import prisma from '../prismaClient';
import { Prisma } from '@prisma/client';

export class CBURegistryRepository {
  async findAll() {
    return prisma.cBURegistry.findMany({ orderBy: { coa_code: 'asc' } });
  }

  async findByCode(coa_code: string) {
    return prisma.cBURegistry.findUnique({ where: { coa_code } });
  }

  async create(data: { coa_code: string; description: string; account_type: 'INCOME' | 'EXPENSE' | 'TRANSIT' }) {
    return prisma.cBURegistry.create({ data });
  }

  async delete(id: string) {
    return prisma.cBURegistry.delete({ where: { id } });
  }
}
