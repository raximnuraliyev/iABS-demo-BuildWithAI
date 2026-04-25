import prisma from '../prismaClient';
import { Prisma } from '@prisma/client';

export class CounterpartyRepository {
  async findAll(type?: string, search?: string) {
    const where: any = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { inn: { contains: search } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.counterparty.findMany({ where, orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    return prisma.counterparty.findUnique({ where: { id } });
  }

  async create(data: Prisma.CounterpartyUncheckedCreateInput) {
    return prisma.counterparty.create({ data });
  }

  async update(id: string, data: Prisma.CounterpartyUncheckedUpdateInput) {
    return prisma.counterparty.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.counterparty.delete({ where: { id } });
  }
}
