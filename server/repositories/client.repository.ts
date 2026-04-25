import prisma from '../prismaClient';
import { Prisma, SubjectType } from '@prisma/client';

export class ClientRepository {
  async findAll(filters?: { subject?: SubjectType; search?: string; code_filial?: string; condition?: boolean }) {
    const where: Prisma.ClientWhereInput = {};
    if (filters?.subject) where.subject = filters.subject;
    if (filters?.code_filial) where.code_filial = filters.code_filial;
    if (filters?.condition !== undefined) where.condition = filters.condition;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { inn: { contains: filters.search } },
        { code: { contains: filters.search } },
      ];
    }
    return prisma.client.findMany({
      where,
      include: { accounts: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: { accounts: true },
    });
  }

  async create(data: Prisma.ClientCreateInput) {
    return prisma.client.create({ data });
  }

  async update(id: string, data: Prisma.ClientUpdateInput) {
    return prisma.client.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.client.delete({ where: { id } });
  }
}
