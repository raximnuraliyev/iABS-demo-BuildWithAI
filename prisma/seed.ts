import 'dotenv/config';
import { PrismaClient, LeaseStatus, LeaseType, SubjectType, AccountType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Check if already seeded
  const existingRoles = await prisma.role.count();
  if (existingRoles > 0) {
    console.log('✅ Database already seeded, skipping.');
    return;
  }

  // ══════════════════════════════════════════════
  // ROLES & PERMISSIONS
  // ══════════════════════════════════════════════
  const adminRole = await prisma.role.create({ data: { name: 'Admin' } });
  const operatorRole = await prisma.role.create({ data: { name: 'Operator' } });
  const controllerRole = await prisma.role.create({ data: { name: 'Controller' } });
  console.log('  ✓ Roles created');

  const permissionDefs = [
    // Admin: everything
    { role_id: adminRole.id, action_name: 'can_add_lease', is_allowed: true },
    { role_id: adminRole.id, action_name: 'can_approve_lease', is_allowed: true },
    { role_id: adminRole.id, action_name: 'can_execute_payment', is_allowed: true },
    { role_id: adminRole.id, action_name: 'can_view_audit', is_allowed: true },
    { role_id: adminRole.id, action_name: 'can_manage_users', is_allowed: true },
    // Operator: add + view
    { role_id: operatorRole.id, action_name: 'can_add_lease', is_allowed: true },
    { role_id: operatorRole.id, action_name: 'can_approve_lease', is_allowed: false },
    { role_id: operatorRole.id, action_name: 'can_execute_payment', is_allowed: false },
    { role_id: operatorRole.id, action_name: 'can_view_audit', is_allowed: true },
    { role_id: operatorRole.id, action_name: 'can_manage_users', is_allowed: false },
    // Controller: approve + pay + view
    { role_id: controllerRole.id, action_name: 'can_add_lease', is_allowed: false },
    { role_id: controllerRole.id, action_name: 'can_approve_lease', is_allowed: true },
    { role_id: controllerRole.id, action_name: 'can_execute_payment', is_allowed: true },
    { role_id: controllerRole.id, action_name: 'can_view_audit', is_allowed: true },
    { role_id: controllerRole.id, action_name: 'can_manage_users', is_allowed: false },
  ];

  for (const perm of permissionDefs) {
    await prisma.rolePermission.create({ data: perm });
  }
  console.log('  ✓ Permissions created');

  // ══════════════════════════════════════════════
  // USERS
  // ══════════════════════════════════════════════
  await prisma.user.createMany({
    data: [
      { tabel_id: '0012', full_name: 'Zokir Ganiev', role_id: adminRole.id, is_head_admin: true },
      { tabel_id: '14552', full_name: 'Alisher Usmanov', role_id: controllerRole.id },
      { tabel_id: '8891', full_name: 'Malika Karimova', role_id: operatorRole.id },
    ],
  });
  console.log('  ✓ Users created');

  // ══════════════════════════════════════════════
  // CBU REGISTRY (Markaziy Bank 3336-qarori)
  // ══════════════════════════════════════════════
  const cbuEntries = [
    { coa_code: '16310', description: 'Daromadlar: Operativ ijara daromadlari', account_type: AccountType.INCOME },
    { coa_code: '16320', description: 'Daromadlar: Moliyaviy ijara daromadlari', account_type: AccountType.INCOME },
    { coa_code: '25302', description: 'Xarajatlar: Operativ ijara xarajatlari', account_type: AccountType.EXPENSE },
    { coa_code: '25304', description: 'Xarajatlar: Moliyaviy ijara xarajatlari', account_type: AccountType.EXPENSE },
    { coa_code: '22602', description: 'Tranzit hisoblar: Ijara to\'lovlari tranzit', account_type: AccountType.TRANSIT },
    { coa_code: '10100', description: 'Kassa va teng ekvivalentlar', account_type: AccountType.INCOME },
    { coa_code: '10301', description: 'Nostro hisoblar', account_type: AccountType.TRANSIT },
    { coa_code: '20200', description: 'Mijozlarning joriy hisoblari', account_type: AccountType.TRANSIT },
    { coa_code: '20208', description: 'Yuridik shaxslarning joriy hisoblari (UZS)', account_type: AccountType.TRANSIT },
    { coa_code: '20210', description: 'Jismoniy shaxslarning joriy hisoblari', account_type: AccountType.TRANSIT },
  ];

  for (const entry of cbuEntries) {
    await prisma.cBURegistry.create({ data: entry });
  }
  console.log('  ✓ CBU Registry entries created');

  // ══════════════════════════════════════════════
  // CLIENTS (Справочник контрагентов)
  // ══════════════════════════════════════════════
  const clients = await Promise.all([
    prisma.client.create({
      data: { code: 'CL-001', name: 'SoftLine LLC', subject: SubjectType.J, code_filial: '00450', inn: '123456789', address: 'Tashkent, Amir Temur 42', phone: '+998901234567' },
    }),
    prisma.client.create({
      data: { code: 'CL-002', name: 'Global Logistics JSC', subject: SubjectType.J, code_filial: '00450', inn: '987654321', address: 'Tashkent, Navoi 15', phone: '+998901112233' },
    }),
    prisma.client.create({
      data: { code: 'CL-003', name: 'Korzinka.uz', subject: SubjectType.J, code_filial: '00450', inn: '332211005', address: 'Tashkent, Oybek 78', phone: '+998903334455' },
    }),
    prisma.client.create({
      data: { code: 'CL-004', name: 'Arand Group', subject: SubjectType.J, code_filial: '00851', inn: '556677889', address: 'Samarkand, Registon 5', phone: '+998944445566' },
    }),
    prisma.client.create({
      data: { code: 'CL-005', name: 'Tashkent City Administration', subject: SubjectType.J, code_filial: '00450', inn: '111222333', address: 'Tashkent, Mustaqillik 1', phone: '+998712001234' },
    }),
    prisma.client.create({
      data: { code: 'CL-006', name: 'UZ-Telecom JSC', subject: SubjectType.J, code_filial: '00450', inn: '444555666', address: 'Tashkent, A.Qodiriy 10', phone: '+998712005678' },
    }),
    prisma.client.create({
      data: { code: 'CL-007', name: 'Abdullaev Bobur', subject: SubjectType.P, code_filial: '00450', inn: '777888999', address: 'Tashkent, Chilanzar Q-12', phone: '+998905556677' },
    }),
    prisma.client.create({
      data: { code: 'CL-008', name: 'SQB Bank (Internal)', subject: SubjectType.J, code_filial: '00450', inn: '200100300', address: 'Tashkent, Islam Karimov 49', phone: '+998712000001', condition: true },
    }),
  ]);
  console.log('  ✓ Clients created');

  // ══════════════════════════════════════════════
  // ACCOUNTS (Настройка счетов)
  // ══════════════════════════════════════════════
  await Promise.all([
    prisma.account.create({ data: { client_id: clients[0].id, code: '20208000405566778899', code_filial: '00450', code_coa: '20208', code_currency: '000' } }),
    prisma.account.create({ data: { client_id: clients[1].id, code: '20208001234567890123', code_filial: '00450', code_coa: '20208', code_currency: '000' } }),
    prisma.account.create({ data: { client_id: clients[2].id, code: '20208002810901234567', code_filial: '00450', code_coa: '20208', code_currency: '000' } }),
    prisma.account.create({ data: { client_id: clients[3].id, code: '20208003000109988776', code_filial: '00851', code_coa: '20208', code_currency: '000' } }),
    prisma.account.create({ data: { client_id: clients[4].id, code: '20200004000501122334', code_filial: '00450', code_coa: '20200', code_currency: '000' } }),
    prisma.account.create({ data: { client_id: clients[5].id, code: '20200005000602233445', code_filial: '00450', code_coa: '20200', code_currency: '000' } }),
    prisma.account.create({ data: { client_id: clients[6].id, code: '20210006000703344556', code_filial: '00450', code_coa: '20210', code_currency: '000' } }),
    // Bank internal accounts
    prisma.account.create({ data: { client_id: clients[7].id, code: '16310000000000000001', code_filial: '00450', code_coa: '16310', code_currency: '000' } }),
    prisma.account.create({ data: { client_id: clients[7].id, code: '25302000000000000001', code_filial: '00450', code_coa: '25302', code_currency: '000' } }),
    prisma.account.create({ data: { client_id: clients[7].id, code: '22602000000000000001', code_filial: '00450', code_coa: '22602', code_currency: '000' } }),
  ]);
  console.log('  ✓ Accounts created');

  // ══════════════════════════════════════════════
  // LEASES (Шартномалар)
  // ══════════════════════════════════════════════
  const bankId = clients[7].id; // SQB Bank internal

  // OUTBOUND leases (bank rents out its assets)
  const outboundLeases = await Promise.all([
    prisma.lease.create({
      data: {
        type: LeaseType.OUTBOUND, status: LeaseStatus.APPROVED,
        asset_type: 'Server Rack HP-99', measurement_unit: 'PIECES', amount: 25000000,
        tenant_id: clients[0].id, lessor_id: bankId,
        income_expense_account: '16310000000000000001', transit_account: '22602000000000000001',
        start_date: new Date('2024-01-01'), end_date: new Date('2024-12-31'),
      },
    }),
    prisma.lease.create({
      data: {
        type: LeaseType.OUTBOUND, status: LeaseStatus.INTRODUCED,
        asset_type: 'Main Building 4th Floor', measurement_unit: 'SQ_METERS', amount: 150000000,
        tenant_id: clients[1].id, lessor_id: bankId,
        income_expense_account: '16310000000000000001', transit_account: '22602000000000000001',
        start_date: new Date('2024-03-15'), end_date: new Date('2025-03-15'),
      },
    }),
    prisma.lease.create({
      data: {
        type: LeaseType.OUTBOUND, status: LeaseStatus.RETURNED,
        asset_type: 'Vehicle Toyota Hilux', measurement_unit: 'PIECES', amount: 18000000,
        tenant_id: clients[3].id, lessor_id: bankId,
        income_expense_account: '16310000000000000001', transit_account: '22602000000000000001',
        start_date: new Date('2023-10-10'), end_date: new Date('2024-10-10'),
      },
    }),
    prisma.lease.create({
      data: {
        type: LeaseType.OUTBOUND, status: LeaseStatus.APPROVED,
        asset_type: 'Point of Sale Terminal', measurement_unit: 'PIECES', amount: 45000000,
        tenant_id: clients[2].id, lessor_id: bankId,
        income_expense_account: '16310000000000000001', transit_account: '22602000000000000001',
        start_date: new Date('2024-04-20'), end_date: new Date('2025-04-20'),
      },
    }),
    prisma.lease.create({
      data: {
        type: LeaseType.OUTBOUND, status: LeaseStatus.INTRODUCED,
        asset_type: 'Land Plot Sergeli District', measurement_unit: 'SQ_METERS', amount: 300000000,
        tenant_id: clients[0].id, lessor_id: bankId,
        income_expense_account: '16310000000000000001', transit_account: '22602000000000000001',
        start_date: new Date('2024-06-01'), end_date: new Date('2026-06-01'),
      },
    }),
  ]);

  // INBOUND leases (bank rents from others)
  const inboundLeases = await Promise.all([
    prisma.lease.create({
      data: {
        type: LeaseType.INBOUND, status: LeaseStatus.APPROVED,
        asset_type: 'Office Space Amir Temur', measurement_unit: 'SQ_METERS', amount: 150000000,
        tenant_id: bankId, lessor_id: clients[4].id,
        income_expense_account: '25302000000000000001', transit_account: '22602000000000000001',
        start_date: new Date('2024-01-01'), end_date: new Date('2024-11-05'),
      },
    }),
    prisma.lease.create({
      data: {
        type: LeaseType.INBOUND, status: LeaseStatus.RETURNED,
        asset_type: 'Optic Fiber Lines', measurement_unit: 'PIECES', amount: 12500000,
        tenant_id: bankId, lessor_id: clients[5].id,
        income_expense_account: '25302000000000000001', transit_account: '22602000000000000001',
        start_date: new Date('2024-02-01'), end_date: new Date('2024-10-25'),
      },
    }),
    prisma.lease.create({
      data: {
        type: LeaseType.INBOUND, status: LeaseStatus.APPROVED,
        asset_type: 'Vault Security Systems', measurement_unit: 'PIECES', amount: 45000000,
        tenant_id: bankId, lessor_id: clients[6].id,
        income_expense_account: '25302000000000000001', transit_account: '22602000000000000001',
        start_date: new Date('2024-05-01'), end_date: new Date('2024-11-01'),
      },
    }),
    prisma.lease.create({
      data: {
        type: LeaseType.INBOUND, status: LeaseStatus.INTRODUCED,
        asset_type: 'Data Center Colocation', measurement_unit: 'SQ_METERS', amount: 200000000,
        tenant_id: bankId, lessor_id: clients[4].id,
        income_expense_account: '25302000000000000001', transit_account: '22602000000000000001',
        start_date: new Date('2024-08-01'), end_date: new Date('2025-08-01'),
      },
    }),
  ]);
  console.log('  ✓ Leases created');

  // ── Memo Orders for approved leases ──
  for (const lease of [...outboundLeases, ...inboundLeases]) {
    if (lease.status === LeaseStatus.APPROVED) {
      await prisma.memoOrder.create({
        data: {
          lease_id: lease.id,
          debit_account_20: lease.transit_account,
          credit_account_20: lease.income_expense_account,
          amount: Number(lease.amount),
        },
      });
    }
  }
  console.log('  ✓ Memo orders created');

  // ── Audit Log entries ──
  const now = new Date();
  const auditEntries = [
    { tabel_id: '14552', action: 'APPROVE_LEASE', entity: 'leases', entity_id: outboundLeases[0].id, payload: { status: 'APPROVED' }, timestamp: new Date(now.getTime() - 3600000) },
    { tabel_id: '8891', action: 'CREATE_LEASE', entity: 'leases', entity_id: outboundLeases[1].id, payload: { asset_type: 'Main Building 4th Floor' }, timestamp: new Date(now.getTime() - 86400000) },
    { tabel_id: '0012', action: 'UPDATE_ROLE_PERMISSION', entity: 'role_permissions', entity_id: operatorRole.id, payload: { action_name: 'can_add_lease', is_allowed: true }, timestamp: new Date(now.getTime() - 172800000) },
    { tabel_id: '14552', action: 'APPROVE_LEASE', entity: 'leases', entity_id: outboundLeases[3].id, payload: { status: 'APPROVED' }, timestamp: new Date(now.getTime() - 259200000) },
    { tabel_id: '8891', action: 'CREATE_CLIENT', entity: 'clients', entity_id: clients[2].id, payload: { name: 'Korzinka.uz', inn: '332211005' }, timestamp: new Date(now.getTime() - 345600000) },
    { tabel_id: '0012', action: 'CREATE_LEASE', entity: 'leases', entity_id: inboundLeases[0].id, payload: { asset_type: 'Office Space Amir Temur' }, timestamp: new Date(now.getTime() - 432000000) },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({ data: entry });
  }
  console.log('  ✓ Audit log entries created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
