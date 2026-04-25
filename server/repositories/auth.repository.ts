import prisma from '../prismaClient';

export class AuthRepository {
  async findUserByTabelId(tabel_id: string) {
    return prisma.user.findUnique({
      where: { tabel_id },
      include: { role: { include: { permissions: true } } }
    });
  }

  async updateRolePermission(roleId: string, action_name: string, is_allowed: boolean) {
    const existing = await prisma.rolePermission.findFirst({
      where: { role_id: roleId, action_name },
    });
    if (existing) {
      return prisma.rolePermission.update({ where: { id: existing.id }, data: { is_allowed } });
    }
    return prisma.rolePermission.create({ data: { role_id: roleId, action_name, is_allowed } });
  }
}

