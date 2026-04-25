import prisma from '../prismaClient';

export class CBURegistryRepository {
  async findAll() {
    return prisma.cBURegistry.findMany({ orderBy: { coa_code: 'asc' } });
  }

  async findByCode(coa_code: string) {
    return prisma.cBURegistry.findUnique({ where: { coa_code } });
  }
}
