import prisma from '../prismaClient';

export class AuthRepository {
  async findUserByTabelId(tabel_id: string) {
    return prisma.user.findUnique({
      where: { tabel_id },
      include: { role: { include: { permissions: true } } }
    });
  }
}
