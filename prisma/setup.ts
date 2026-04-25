import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('⚙️  Running initial setup...');

  // Create roles if they don't exist
  const roleNames = ['Admin', 'Operator', 'Controller'];
  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('  ✓ Roles ensured (Admin, Operator, Controller)');

  // Set default permissions
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  const operatorRole = await prisma.role.findUnique({ where: { name: 'Operator' } });
  const controllerRole = await prisma.role.findUnique({ where: { name: 'Controller' } });

  if (adminRole && operatorRole && controllerRole) {
    const permDefs = [
      { role_id: adminRole.id, action_name: 'can_add_lease', is_allowed: true },
      { role_id: adminRole.id, action_name: 'can_approve_lease', is_allowed: true },
      { role_id: adminRole.id, action_name: 'can_execute_payment', is_allowed: true },
      { role_id: adminRole.id, action_name: 'can_view_audit', is_allowed: true },
      { role_id: adminRole.id, action_name: 'can_manage_users', is_allowed: true },
      { role_id: operatorRole.id, action_name: 'can_add_lease', is_allowed: true },
      { role_id: operatorRole.id, action_name: 'can_approve_lease', is_allowed: false },
      { role_id: operatorRole.id, action_name: 'can_execute_payment', is_allowed: false },
      { role_id: operatorRole.id, action_name: 'can_view_audit', is_allowed: true },
      { role_id: operatorRole.id, action_name: 'can_manage_users', is_allowed: false },
      { role_id: controllerRole.id, action_name: 'can_add_lease', is_allowed: false },
      { role_id: controllerRole.id, action_name: 'can_approve_lease', is_allowed: true },
      { role_id: controllerRole.id, action_name: 'can_execute_payment', is_allowed: true },
      { role_id: controllerRole.id, action_name: 'can_view_audit', is_allowed: true },
      { role_id: controllerRole.id, action_name: 'can_manage_users', is_allowed: false },
    ];

    for (const perm of permDefs) {
      const existing = await prisma.rolePermission.findFirst({
        where: { role_id: perm.role_id, action_name: perm.action_name },
      });
      if (!existing) {
        await prisma.rolePermission.create({ data: perm });
      }
    }
    console.log('  ✓ Default permissions set');

    // Create head admin if no users exist
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const password_hash = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          tabel_id: 'admin',
          full_name: 'Head Administrator',
          password_hash,
          is_head_admin: true,
          role_id: adminRole.id,
        },
      });
      console.log('  ✓ Head admin created (tabel_id: admin, password: admin123)');
    } else {
      console.log('  ✓ Users already exist, skipping head admin creation');
    }
  }

  console.log('✅ Setup complete!');
}

main()
  .catch((e) => { console.error('Setup failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
