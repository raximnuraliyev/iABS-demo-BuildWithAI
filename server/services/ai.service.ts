import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.GOOGLE_AI_API_KEY;
if (!API_KEY) {
  console.warn('WARNING: GOOGLE_AI_API_KEY not set. AI features will not work.');
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// ══════════════════════════════════════════════
// Model Fallback Chain (ordered by priority)
// When a model hits rate limits (429), we automatically
// try the next model in the chain.
// ══════════════════════════════════════════════
const MODEL_CHAIN = [
  'gemini-2.5-flash',        // Primary: 5 RPM, 250K TPM, 20 RPD
  'gemini-2.5-flash-lite',   // Fallback 1: 10 RPM, 250K TPM, 20 RPD
  'gemini-3-flash',          // Fallback 2: 5 RPM, 250K TPM, 20 RPD
  'gemini-3.1-flash-lite',   // Fallback 3: 15 RPM, 250K TPM, 500 RPD
  'gemini-2.0-flash',        // Fallback 4: original model
];

// Track which models are temporarily blocked (rate-limited)
const blockedModels: Map<string, number> = new Map();
const BLOCK_DURATION_MS = 60_000; // Block a model for 60s after a 429

/**
 * Get the next available model from the chain.
 * Skips models that are currently blocked due to recent rate limits.
 */
function getAvailableModel(): string {
  const now = Date.now();

  // Clean up expired blocks
  for (const [model, blockedUntil] of blockedModels.entries()) {
    if (now >= blockedUntil) {
      blockedModels.delete(model);
    }
  }

  // Find first non-blocked model
  for (const model of MODEL_CHAIN) {
    if (!blockedModels.has(model)) {
      return model;
    }
  }

  // All models blocked — return the one that unblocks soonest
  let soonest = MODEL_CHAIN[0];
  let soonestTime = Infinity;
  for (const [model, blockedUntil] of blockedModels.entries()) {
    if (blockedUntil < soonestTime) {
      soonestTime = blockedUntil;
      soonest = model;
    }
  }
  return soonest;
}

/**
 * Mark a model as rate-limited (blocked) for BLOCK_DURATION_MS.
 */
function blockModel(model: string): void {
  blockedModels.set(model, Date.now() + BLOCK_DURATION_MS);
  console.warn(`⚠️ Model "${model}" rate-limited, blocked for ${BLOCK_DURATION_MS / 1000}s. Falling back...`);
}

/**
 * Check if an error is a rate limit (429) error.
 */
function isRateLimitError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  const status = error.status || error.statusCode || error.code;
  return (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('resource exhausted') ||
    msg.includes('quota') ||
    msg.includes('too many requests')
  );
}

/**
 * Execute an AI generation with automatic model fallback.
 * Tries each model in the chain until one succeeds or all are exhausted.
 */
async function generateWithFallback(
  params: {
    contents: string;
    config?: any;
  },
  maxRetries: number = MODEL_CHAIN.length
): Promise<any> {
  if (!ai) throw new Error('AI service not configured: GOOGLE_AI_API_KEY missing');

  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const model = getAvailableModel();

    try {
      console.log(`🤖 AI request using model: ${model} (attempt ${attempt + 1}/${maxRetries})`);

      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      // Success — log which model was used
      if (attempt > 0) {
        console.log(`✅ Fallback successful: completed with model "${model}"`);
      }

      return response;
    } catch (error: any) {
      lastError = error;

      if (isRateLimitError(error)) {
        blockModel(model);
        // Continue to the next iteration which will pick the next available model
        continue;
      }

      // Non-rate-limit error — don't retry, throw immediately
      throw error;
    }
  }

  // All models exhausted
  throw new Error(
    `All AI models are rate-limited. Please wait a moment and try again. Last error: ${lastError?.message || 'Unknown'}`
  );
}

// ══════════════════════════════════════════════
// System context for the Copilot
// ══════════════════════════════════════════════
const COPILOT_SYSTEM_PROMPT = `You are an expert assistant for the iABS Core Banking System, specifically the "iABS Demo #BuildWithAI" (Lease Management) module deployed at SQB Bank, Uzbekistan.

Your knowledge includes:
1. **CBU Resolution 3336** (Markaziy Bank, 26.11.2021) - Chart of Accounts for commercial banks:
   - Account codes are 20 digits, the first 5 digits represent the COA (Chart of Accounts) class.
   - Key lease-related COA codes:
     - 16310: Income from operating lease (INCOME)
     - 16320: Income from financial lease (INCOME)
     - 25302: Operating lease expenses (EXPENSE)
     - 25304: Financial lease expenses (EXPENSE)
     - 22602: Transit accounts for lease payments (TRANSIT)
     - 10100: Cash and equivalents
     - 10301: Nostro accounts

2. **Subject Types**:
   - "P" = Physical person (individual, жисмоний шахс)
   - "J" = Juridical entity (legal entity, юридик шахс)

3. **Lease Types**:
   - OUTBOUND (Сдача в аренду): Bank rents its assets to clients
   - INBOUND (Получение в аренду): Bank rents assets from third parties

4. **Lease Lifecycle**:
   - INTRODUCED → APPROVED → RETURNED
   - Edit/Delete only when INTRODUCED
   - Return only when APPROVED
   - Payment only for INBOUND leases when APPROVED

5. **Roles**: Admin (full access), Controller (approve + pay), Operator (create leases)

Answer in the same language as the user's question. Be precise and reference specific account codes when relevant.`;

// ══════════════════════════════════════════════
// Lease schema context for Text-to-SQL
// ══════════════════════════════════════════════
const LEASE_SCHEMA_PROMPT = `You are a SQL query generator for a PostgreSQL database. Generate ONLY a raw SQL SELECT query based on the user's request. Do not include any explanation, just the SQL.

The database has the following schema:

TABLE "Lease" (
  id UUID PRIMARY KEY,
  type VARCHAR -- 'OUTBOUND' or 'INBOUND',
  status VARCHAR -- 'INTRODUCED', 'APPROVED', or 'RETURNED',
  asset_type VARCHAR,
  measurement_unit VARCHAR,
  amount DECIMAL(15,2),
  tenant_id UUID REFERENCES "Client"(id),
  lessor_id UUID REFERENCES "Client"(id),
  income_expense_account VARCHAR(20),
  transit_account VARCHAR(20),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP
);

TABLE "Client" (
  id UUID PRIMARY KEY,
  code VARCHAR UNIQUE,
  name VARCHAR,
  subject VARCHAR -- 'P' (physical) or 'J' (juridical),
  code_filial VARCHAR,
  inn VARCHAR UNIQUE,
  address VARCHAR,
  phone VARCHAR,
  condition BOOLEAN -- true=active
);

TABLE "MemoOrder" (
  id UUID PRIMARY KEY,
  lease_id UUID REFERENCES "Lease"(id),
  debit_account_20 VARCHAR(20),
  credit_account_20 VARCHAR(20),
  amount DECIMAL(15,2),
  generated_at TIMESTAMP
);

Important: Use double quotes around table names and column names. Return ONLY the SQL query, nothing else.`;

export class AIService {
  /**
   * Copilot: Contextual help assistant for iABS users
   */
  async copilot(userMessage: string): Promise<string> {
    const response = await generateWithFallback({
      contents: userMessage,
      config: {
        systemInstruction: COPILOT_SYSTEM_PROMPT,
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    return response.text || 'No response generated';
  }

  /**
   * Matchmaker: Natural language → structured JSON for real estate matching
   */
  async matchmaker(prompt: string): Promise<{ query: any; results: any[] }> {
    const response = await generateWithFallback({
      contents: `Extract property requirements from this request and return a JSON object with these fields: city, min_sqm, max_sqm, budget_min, budget_max, currency, property_type, features (array). Request: "${prompt}"`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Mock Comet API integration
    const mockResults = generateMockProperties(parsed);

    return { query: parsed, results: mockResults };
  }

  /**
   * Text-to-SQL Analytics: Natural language → SQL → data for charting
   */
  async analytics(userQuery: string): Promise<{ sql: string; data: any[] }> {
    const response = await generateWithFallback({
      contents: userQuery,
      config: {
        systemInstruction: LEASE_SCHEMA_PROMPT,
        temperature: 0.0,
        maxOutputTokens: 512,
      },
    });

    let sql = (response.text || '').trim();

    // Clean up markdown code fences if present
    sql = sql.replace(/```sql\n?/gi, '').replace(/```\n?/g, '').trim();

    // In case the AI added a semicolon but is immediately followed by a markdown tail, ensure it is stripped
    sql = sql.replace(/```$/g, '').trim();

    if (!sql) {
      throw new Error('AI could not generate a SQL query from your prompt.');
    }

    // Safety: only allow SELECT queries
    if (!sql.toUpperCase().startsWith('SELECT')) {
      throw new Error('Generated query is not a SELECT statement. Only read-only queries are allowed.');
    }

    // Execute via shared Prisma Client
    const prisma = (await import('../prismaClient')).default;

    try {
      const data = await prisma.$queryRawUnsafe(sql);
      return { sql, data: data as any[] };
    } catch (e: any) {
      console.error('SQL Execution error:', e);
      throw new Error(`Failed to execute query: ${e.message}`);
    }
  }

  /**
   * Get the current status of model availability (for diagnostics)
   */
  getModelStatus(): { chain: string[]; blocked: Record<string, number>; active: string } {
    const now = Date.now();
    const blocked: Record<string, number> = {};
    for (const [model, blockedUntil] of blockedModels.entries()) {
      const remaining = Math.max(0, Math.ceil((blockedUntil - now) / 1000));
      if (remaining > 0) blocked[model] = remaining;
    }
    return {
      chain: MODEL_CHAIN,
      blocked,
      active: getAvailableModel(),
    };
  }
}

/**
 * Mock property results simulating the "Comet API" integration
 */
function generateMockProperties(query: any): any[] {
  const city = query.city || 'Tashkent';
  const type = query.property_type || 'office';

  return [
    {
      id: 'prop-001',
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Space in ${city} Business Center`,
      address: `${city}, Amir Temur Ave, Building 42`,
      sqm: query.min_sqm || 100,
      price: query.budget_min || 500000,
      currency: query.currency || 'UZS',
      features: ['parking', 'security', 'elevator'],
      match_score: 0.95,
    },
    {
      id: 'prop-002',
      title: `Premium ${type} near ${city} Metro`,
      address: `${city}, Navoi Street, Block 15`,
      sqm: Math.round((query.min_sqm || 100) * 1.3),
      price: Math.round((query.budget_min || 500000) * 1.2),
      currency: query.currency || 'UZS',
      features: ['metro', 'renovated', 'meeting rooms'],
      match_score: 0.87,
    },
    {
      id: 'prop-003',
      title: `Budget ${type} in ${city} Suburbs`,
      address: `${city}, Sergeli District, Building 7`,
      sqm: Math.round((query.min_sqm || 100) * 0.8),
      price: Math.round((query.budget_min || 500000) * 0.7),
      currency: query.currency || 'UZS',
      features: ['parking', 'garden'],
      match_score: 0.72,
    },
  ];
}
