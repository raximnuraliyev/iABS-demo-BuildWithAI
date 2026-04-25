import { PrismaClient, LeaseStatus, LeaseDirection, CounterpartyType, AssetCategory, MeasurementUnit } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

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

  // ── Roles ──
  const adminRole = await prisma.role.create({
    data: { name: 'Admin' },
  });
  const operatorRole = await prisma.role.create({
    data: { name: 'Operator' },
  });
  const controllerRole = await prisma.role.create({
    data: { name: 'Controller' },
  });

  console.log('  ✓ Roles created');

  // ── Permissions ──
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

  // ── Users ──
  await prisma.user.createMany({
    data: [
      { tabel_id: '0012', full_name: 'Zokir Ganiev', role_id: adminRole.id },
      { tabel_id: '14552', full_name: 'Alisher Usmanov', role_id: controllerRole.id },
      { tabel_id: '8891', full_name: 'Malika Karimova', role_id: operatorRole.id },
    ],
  });

  console.log('  ✓ Users created');

  // ── Counterparties ──
  const counterparties = await Promise.all([
    prisma.counterparty.create({
      data: { inn: '123456789', name: 'SoftLine LLC', settlement_account: '20208000405566778899', type: CounterpartyType.TENANT },
    }),
    prisma.counterparty.create({
      data: { inn: '987654321', name: 'Global Logistics', settlement_account: '20201234567890123456', type: CounterpartyType.TENANT },
    }),
    prisma.counterparty.create({
      data: { inn: '332211005', name: 'Korzinka.uz', settlement_account: '20202810901234567890', type: CounterpartyType.TENANT },
    }),
    prisma.counterparty.create({
      data: { inn: '556677889', name: 'Arand Group', settlement_account: '20203000109988776655', type: CounterpartyType.TENANT },
    }),
    prisma.counterparty.create({
      data: { inn: '111222333', name: 'Tashkent City Administration', settlement_account: '20204000501122334455', type: CounterpartyType.LESSOR },
    }),
    prisma.counterparty.create({
      data: { inn: '444555666', name: 'UZ-Telecom JSC', settlement_account: '20205000602233445566', type: CounterpartyType.LESSOR },
    }),
    prisma.counterparty.create({
      data: { inn: '777888999', name: 'Security Solutions Ltd', settlement_account: '20206000703344556677', type: CounterpartyType.LESSOR },
    }),
  ]);

  console.log('  ✓ Counterparties created');

  // ── Assets ──
  const assets = await Promise.all([
    prisma.asset.create({
      data: { name: 'Server Rack HP-99', category: AssetCategory.PC, measurement_unit: MeasurementUnit.PIECES },
    }),
    prisma.asset.create({
      data: { name: 'Main Building 4th Floor', category: AssetCategory.BUILDING, measurement_unit: MeasurementUnit.SQ_METERS },
    }),
    prisma.asset.create({
      data: { name: 'Vehicle Toyota Hilux', category: AssetCategory.FURNITURE, measurement_unit: MeasurementUnit.PIECES },
    }),
    prisma.asset.create({
      data: { name: 'Point of Sale Terminal', category: AssetCategory.ATM, measurement_unit: MeasurementUnit.PIECES },
    }),
    prisma.asset.create({
      data: { name: 'Land Plot Sergeli District', category: AssetCategory.LAND, measurement_unit: MeasurementUnit.SQ_METERS },
    }),
    prisma.asset.create({
      data: { name: 'Office Furniture Set', category: AssetCategory.FURNITURE, measurement_unit: MeasurementUnit.PIECES },
    }),
    prisma.asset.create({
      data: { name: 'ATM NCR SelfServ 80', category: AssetCategory.ATM, measurement_unit: MeasurementUnit.PIECES },
    }),
    prisma.asset.create({
      data: { name: 'Optic Fiber Lines', category: AssetCategory.PC, measurement_unit: MeasurementUnit.PIECES },
    }),
    prisma.asset.create({
      data: { name: 'Vault Security Systems', category: AssetCategory.PC, measurement_unit: MeasurementUnit.PIECES },
    }),
  ]);

  console.log('  ✓ Assets created');

  // ── Leases ──
  // OUTBOUND leases (bank rents out its assets)
  const outboundLeases = await Promise.all([
    prisma.lease.create({
      data: {
        asset_id: assets[0].id, counterparty_id: counterparties[0].id,
        lease_direction: LeaseDirection.OUTBOUND, status: LeaseStatus.APPROVED,
        contract_amount: 25000000, start_date: new Date('2024-01-01'), end_date: new Date('2024-12-31'),
      },
    }),
    prisma.lease.create({
      data: {
        asset_id: assets[1].id, counterparty_id: counterparties[1].id,
        lease_direction: LeaseDirection.OUTBOUND, status: LeaseStatus.INTRODUCED,
        contract_amount: 150000000, start_date: new Date('2024-03-15'), end_date: new Date('2025-03-15'),
      },
    }),
    prisma.lease.create({
      data: {
        asset_id: assets[2].id, counterparty_id: counterparties[3].id,
        lease_direction: LeaseDirection.OUTBOUND, status: LeaseStatus.RETURNED,
        contract_amount: 18000000, start_date: new Date('2023-10-10'), end_date: new Date('2024-10-10'),
      },
    }),
    prisma.lease.create({
      data: {
        asset_id: assets[3].id, counterparty_id: counterparties[2].id,
        lease_direction: LeaseDirection.OUTBOUND, status: LeaseStatus.APPROVED,
        contract_amount: 45000000, start_date: new Date('2024-04-20'), end_date: new Date('2025-04-20'),
      },
    }),
    prisma.lease.create({
      data: {
        asset_id: assets[4].id, counterparty_id: counterparties[0].id,
        lease_direction: LeaseDirection.OUTBOUND, status: LeaseStatus.INTRODUCED,
        contract_amount: 300000000, start_date: new Date('2024-06-01'), end_date: new Date('2026-06-01'),
      },
    }),
    prisma.lease.create({
      data: {
        asset_id: assets[5].id, counterparty_id: counterparties[1].id,
        lease_direction: LeaseDirection.OUTBOUND, status: LeaseStatus.APPROVED,
        contract_amount: 8000000, start_date: new Date('2024-07-01'), end_date: new Date('2025-01-01'),
      },
    }),
    prisma.lease.create({
      data: {
        asset_id: assets[6].id, counterparty_id: counterparties[2].id,
        lease_direction: LeaseDirection.OUTBOUND, status: LeaseStatus.INTRODUCED,
        contract_amount: 55000000, start_date: new Date('2024-09-01'), end_date: new Date('2025-09-01'),
      },
    }),
  ]);

  // INBOUND leases (bank rents from others)
  const inboundLeases = await Promise.all([
    prisma.lease.create({
      data: {
        asset_id: assets[1].id, counterparty_id: counterparties[4].id,
        lease_direction: LeaseDirection.INBOUND, status: LeaseStatus.APPROVED,
        contract_amount: 150000000, start_date: new Date('2024-01-01'), end_date: new Date('2024-11-05'),
      },
    }),
    prisma.lease.create({
      data: {
        asset_id: assets[7].id, counterparty_id: counterparties[5].id,
        lease_direction: LeaseDirection.INBOUND, status: LeaseStatus.RETURNED,
        contract_amount: 12500000, start_date: new Date('2024-02-01'), end_date: new Date('2024-10-25'),
      },
    }),
    prisma.lease.create({
      data: {
        asset_id: assets[8].id, counterparty_id: counterparties[6].id,
        lease_direction: LeaseDirection.INBOUND, status: LeaseStatus.APPROVED,
        contract_amount: 45000000, start_date: new Date('2024-05-01'), end_date: new Date('2024-11-01'),
      },
    }),
    prisma.lease.create({
      data: {
        asset_id: assets[4].id, counterparty_id: counterparties[4].id,
        lease_direction: LeaseDirection.INBOUND, status: LeaseStatus.INTRODUCED,
        contract_amount: 200000000, start_date: new Date('2024-08-01'), end_date: new Date('2025-08-01'),
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
          debit_account_20: '12345678901234567890',
          credit_account_20: '09876543210987654321',
          amount: Number(lease.contract_amount),
        },
      });
    }
  }

  console.log('  ✓ Memo orders created');

  // ── Audit Log entries ──
  const now = new Date();
  const auditEntries = [
    {
      tabel_id: '14552',
      action: 'APPROVE_LEASE',
      entity_name: 'leases',
      entity_id: outboundLeases[0].id,
      new_data: JSON.stringify({ status: 'APPROVED' }),
      created_at: new Date(now.getTime() - 3600000), // 1 hour ago
    },
    {
      tabel_id: '8891',
      action: 'CREATE_LEASE',
      entity_name: 'leases',
      entity_id: outboundLeases[1].id,
      new_data: JSON.stringify({ asset: 'Main Building 4th Floor', counterparty: 'Global Logistics' }),
      created_at: new Date(now.getTime() - 86400000), // Yesterday
    },
    {
      tabel_id: '0012',
      action: 'UPDATE_ROLE_PERMISSION',
      entity_name: 'role_permissions',
      entity_id: operatorRole.id,
      new_data: JSON.stringify({ action_name: 'can_add_lease', is_allowed: true }),
      created_at: new Date(now.getTime() - 172800000), // 2 days ago
    },
    {
      tabel_id: '14552',
      action: 'APPROVE_LEASE',
      entity_name: 'leases',
      entity_id: outboundLeases[3].id,
      new_data: JSON.stringify({ status: 'APPROVED' }),
      created_at: new Date(now.getTime() - 259200000), // 3 days ago
    },
    {
      tabel_id: '8891',
      action: 'CREATE_COUNTERPARTY',
      entity_name: 'counterparties',
      entity_id: counterparties[2].id,
      new_data: JSON.stringify({ name: 'Korzinka.uz', inn: '332211005' }),
      created_at: new Date(now.getTime() - 345600000), // 4 days ago
    },
    {
      tabel_id: '0012',
      action: 'CREATE_LEASE',
      entity_name: 'leases',
      entity_id: inboundLeases[0].id,
      new_data: JSON.stringify({ asset: 'Main Building 4th Floor', counterparty: 'Tashkent City Administration' }),
      created_at: new Date(now.getTime() - 432000000), // 5 days ago
    },
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
