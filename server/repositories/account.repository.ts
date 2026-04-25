import prisma from '../prismaClient';
import { Prisma } from '@prisma/client';

export class AccountRepository {
  async findAll(filters?: { client_id?: string; code_coa?: string }) {
    const where: Prisma.AccountWhereInput = {};
    if (filters?.client_id) where.client_id = filters.client_id;
    if (filters?.code_coa) where.code_coa = filters.code_coa;
    return prisma.account.findMany({
      where,
      include: { client: true },
      orderBy: { code: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.account.findUnique({
      where: { id },
      include: { client: true },
    });
  }

  async create(data: Prisma.AccountUncheckedCreateInput) {
    return prisma.account.create({ data, include: { client: true } });
  }

  async update(id: string, data: Prisma.AccountUncheckedUpdateInput) {
    return prisma.account.update({ where: { id }, data, include: { client: true } });
  }

  async delete(id: string) {
    return prisma.account.delete({ where: { id } });
  }
}
