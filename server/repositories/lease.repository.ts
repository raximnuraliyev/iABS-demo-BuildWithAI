import prisma from '../prismaClient';
import { Lease, LeaseStatus, Prisma } from '@prisma/client';

export class LeaseRepository {
  async findById(id: string) {
    return prisma.lease.findUnique({ where: { id }, include: { counterparty: true, asset: true } });
  }

  async create(data: Prisma.LeaseUncheckedCreateInput) {
    return prisma.lease.create({ data, include: { counterparty: true, asset: true } });
  }

  async findAll(filters: any) {
    return prisma.lease.findMany({ where: filters, include: { counterparty: true, asset: true }, orderBy: { start_date: 'desc' } });
  }

  async update(id: string, data: Prisma.LeaseUncheckedUpdateInput) {
    return prisma.lease.update({
      where: { id },
      data,
      include: { counterparty: true, asset: true },
    });
  }

  async updateStatus(id: string, status: LeaseStatus) {
    return prisma.lease.update({
      where: { id },
      data: { status },
      include: { counterparty: true, asset: true },
    });
  }

  async delete(id: string) {
    return prisma.lease.delete({ where: { id } });
  }

  // The transactional core for approval
  async approveTransaction(leaseId: string, internalAccountId: string, counterpartyAccountId: string, contractAmount: number) {
    return prisma.$transaction(async (tx) => {
      const lease = await tx.lease.findUnique({ where: { id: leaseId } });
      if (!lease) throw new Error('Lease not found');
      if (lease.status !== LeaseStatus.INTRODUCED) throw new Error('Lease status must be INTRODUCED to approve');

      const updatedLease = await tx.lease.update({
        where: { id: leaseId },
        data: { status: LeaseStatus.APPROVED },
        include: { counterparty: true, asset: true },
      });

      const memoOrder = await tx.memoOrder.create({
        data: {
          lease_id: leaseId,
          debit_account_20: internalAccountId,
          credit_account_20: counterpartyAccountId,
          amount: contractAmount,
        }
      });

      return { updatedLease, memoOrder };
    });
  }
}
