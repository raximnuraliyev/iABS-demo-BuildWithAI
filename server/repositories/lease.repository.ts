import prisma from '../prismaClient';
import { LeaseStatus, LeaseType, Prisma } from '@prisma/client';

export class LeaseRepository {
  async findById(id: string) {
    return prisma.lease.findUnique({
      where: { id },
      include: { tenant: true, lessor: true, memo_orders: true },
    });
  }

  async create(data: Prisma.LeaseUncheckedCreateInput) {
    return prisma.lease.create({
      data,
      include: { tenant: true, lessor: true },
    });
  }

  async findAll(filters: { type?: LeaseType; status?: LeaseStatus }) {
    const where: Prisma.LeaseWhereInput = {};
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    return prisma.lease.findMany({
      where,
      include: { tenant: true, lessor: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async update(id: string, data: Prisma.LeaseUncheckedUpdateInput) {
    return prisma.lease.update({
      where: { id },
      data,
      include: { tenant: true, lessor: true },
    });
  }

  async updateStatus(id: string, status: LeaseStatus) {
    return prisma.lease.update({
      where: { id },
      data: { status },
      include: { tenant: true, lessor: true },
    });
  }

  async delete(id: string) {
    return prisma.lease.delete({ where: { id } });
  }

  /**
   * Atomically approve a lease and generate a memo order.
   * Wrapped in a Prisma $transaction for ACID compliance.
   */
  async approveTransaction(
    leaseId: string,
    debitAccount: string,
    creditAccount: string,
    contractAmount: number
  ) {
    return prisma.$transaction(async (tx) => {
      const lease = await tx.lease.findUnique({ where: { id: leaseId } });
      if (!lease) throw new Error('Lease not found');
      if (lease.status !== LeaseStatus.INTRODUCED) {
        throw new Error('Lease status must be INTRODUCED to approve');
      }

      const updatedLease = await tx.lease.update({
        where: { id: leaseId },
        data: { status: LeaseStatus.APPROVED },
        include: { tenant: true, lessor: true },
      });

      const memoOrder = await tx.memoOrder.create({
        data: {
          lease_id: leaseId,
          debit_account_20: debitAccount,
          credit_account_20: creditAccount,
          amount: contractAmount,
        },
      });

      return { updatedLease, memoOrder };
    });
  }

  /**
   * Execute payment for inbound leases.
   * Creates a double-entry memo order (debit transit, credit lessor).
   * Wrapped in $transaction for atomicity.
   */
  async executePayment(
    leaseId: string,
    transitAccount: string,
    lessorAccount: string,
    amount: number
  ) {
    return prisma.$transaction(async (tx) => {
      const lease = await tx.lease.findUnique({ where: { id: leaseId } });
      if (!lease) throw new Error('Lease not found');
      if (lease.status !== LeaseStatus.APPROVED) {
        throw new Error('Lease must be APPROVED to execute payment');
      }

      const memoOrder = await tx.memoOrder.create({
        data: {
          lease_id: leaseId,
          debit_account_20: transitAccount,
          credit_account_20: lessorAccount,
          amount,
        },
      });

      return memoOrder; // Correctly returning the memoOrder
    }); // Correctly closing the transaction bracket
  } // Correctly closing the executePayment block

  /**
   * Schedule a payment for the next Monday at 09:00 AM.
   */
  async schedulePayment(leaseId: string, amount: number) {
    // 09:00 AM next Monday
    const date = new Date();
    const day = date.getDay();
    
    // Formula to always calculate the offset to the NEXT Monday
    const daysToMonday = day === 0 ? 1 : 8 - day;
    
    date.setDate(date.getDate() + daysToMonday);
    date.setHours(9, 0, 0, 0);

    return await prisma.scheduledPayment.create({
      data: {
        lease_id: leaseId,
        amount,
        scheduled_date: date,
        status: 'PENDING'
      }
    });
  }
}
