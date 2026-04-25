import { AccountRepository } from '../repositories/account.repository';
import { CBURegistryRepository } from '../repositories/cbu-registry.repository';

export class AccountService {
  private repository: AccountRepository;
  private cbuRegistry: CBURegistryRepository;

  constructor() {
    this.repository = new AccountRepository();
    this.cbuRegistry = new CBURegistryRepository();
  }

  async getAllAccounts(filters?: { client_id?: string; code_coa?: string }) {
    return this.repository.findAll(filters);
  }

  async getAccountById(id: string) {
    const account = await this.repository.findById(id);
    if (!account) throw new Error('Account not found');
    return account;
  }

  /**
   * COA Validation Rule:
   * Extract the first 5 digits from the account code and verify
   * they exist in the CBU_Registry table. Reject if not found.
   */
  async createAccount(data: {
    client_id: string;
    code: string;
    code_filial: string;
    code_currency?: string;
  }) {
    // Validate account code length
    if (data.code.length !== 20) {
      throw new Error('Account code must be exactly 20 digits');
    }

    if (!/^\d{20}$/.test(data.code)) {
      throw new Error('Account code must contain only digits');
    }

    // Extract COA (first 5 digits)
    const code_coa = data.code.substring(0, 5);

    // Verify COA exists in CBU Registry
    const cbuEntry = await this.cbuRegistry.findByCode(code_coa);
    if (!cbuEntry) {
      throw new Error(
        `Invalid account code: COA prefix "${code_coa}" is not registered in CBU Registry (Resolution 3336). ` +
        `The first 5 digits of the account must match a valid Chart of Accounts entry.`
      );
    }

    return this.repository.create({
      client_id: data.client_id,
      code: data.code,
      code_filial: data.code_filial,
      code_coa,
      code_currency: data.code_currency || '000',
    });
  }

  async updateAccount(id: string, data: any) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Account not found');
    return this.repository.update(id, data);
  }

  async deleteAccount(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Account not found');
    return this.repository.delete(id);
  }
}
