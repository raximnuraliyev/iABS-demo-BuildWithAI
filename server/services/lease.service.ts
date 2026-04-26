import { LeaseRepository } from '../repositories/lease.repository';
import { LeaseStatus, LeaseType, Prisma } from '@prisma/client';
import prisma from '../prismaClient';

export class LeaseService {
  private repository: LeaseRepository;

  constructor() {
    this.repository = new LeaseRepository();
  }

  async getAllLeases(type?: string, status?: string) {
    const filters: { type?: LeaseType; status?: LeaseStatus } = {};
    if (type) filters.type = type as LeaseType;
    if (status) filters.status = status as LeaseStatus;
    return this.repository.findAll(filters);
  }

  async getLeaseById(id: string) {
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');
    return lease;
  }

  /**
   * Helper: get or create a "BANK" client record that represents the bank itself.
   * This is needed because both tenant_id and lessor_id are required by the schema.
   */
  private async getBankClientId(): Promise<string> {
    const bankInn = '000000000'; // Reserved INN for the bank
    let bankClient = await prisma.client.findUnique({ where: { inn: bankInn } });
    if (!bankClient) {
      bankClient = await prisma.client.create({
        data: {
          code: 'BANK-SQB',
          name: 'SQB Bank (Self)',
          subject: 'J',
          code_filial: '00000',
          inn: bankInn,
          address: 'Head Office',
          phone: '',
          condition: true,
        },
      });
    }
    return bankClient.id;
  }

  async createLease(data: any) {
    // Force INTRODUCED status on creation
    data.status = LeaseStatus.INTRODUCED;

    // Ensure both tenant_id and lessor_id are present.
    // For OUTBOUND (bank rents out): bank = lessor, client = tenant
    // For INBOUND (bank rents in): bank = tenant, client = lessor
    if (data.type === 'OUTBOUND') {
      if (!data.tenant_id) {
        throw new Error('Tenant is required for outbound leases');
      }
      if (!data.lessor_id) {
        data.lessor_id = await this.getBankClientId();
      }
    } else if (data.type === 'INBOUND') {
      if (!data.lessor_id) {
        throw new Error('Lessor is required for inbound leases');
      }
      if (!data.tenant_id) {
        data.tenant_id = await this.getBankClientId();
      }
    }

    return this.repository.create(data as Prisma.LeaseUncheckedCreateInput);
  }

  async updateLease(id: string, data: any) {
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');

    // State Machine Rule: Update only permitted if status is INTRODUCED
    if (lease.status !== LeaseStatus.INTRODUCED) {
      throw new Error('Can only modify leases in INTRODUCED status');
    }

    const updateData: Prisma.LeaseUncheckedUpdateInput = {};
    if (data.asset_type) updateData.asset_type = data.asset_type;
    if (data.measurement_unit) updateData.measurement_unit = data.measurement_unit;
    if (data.tenant_id) updateData.tenant_id = data.tenant_id;
    if (data.lessor_id) updateData.lessor_id = data.lessor_id;
    if (data.amount) updateData.amount = data.amount;
    if (data.income_expense_account) updateData.income_expense_account = data.income_expense_account;
    if (data.transit_account) updateData.transit_account = data.transit_account;
    if (data.start_date) updateData.start_date = new Date(data.start_date);
    if (data.end_date) updateData.end_date = new Date(data.end_date);

    return this.repository.update(id, updateData);
  }

  async deleteLease(id: string) {
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');

    // State Machine Rule: Delete only permitted if status is INTRODUCED
    if (lease.status !== LeaseStatus.INTRODUCED) {
      throw new Error('Can only delete leases in INTRODUCED status');
    }
    return this.repository.delete(id);
  }

  async approveLease(id: string) {
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');

    // Use transit/income-expense accounts from the lease itself
    return this.repository.approveTransaction(
      id,
      lease.transit_account,
      lease.income_expense_account,
      Number(lease.amount)
    );
  }

  async returnLease(id: string) {
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');

    // State Machine Rule: Return only permitted if status is APPROVED
    if (lease.status !== LeaseStatus.APPROVED) {
      throw new Error('Must be in APPROVED status to return');
    }

    return this.repository.updateStatus(id, LeaseStatus.RETURNED);
  }

  /**
   * Payment Execution - Inbound Leases Only
   * Generates a double-entry Memo Order (debiting transit, crediting lessor).
   * Wrapped in a Prisma $transaction for atomicity.
   */
  async payLease(id: string, mode: 'IMMEDIATE' | 'SCHEDULED') {
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');

    if (lease.type !== 'INBOUND') {
      throw new Error('Payment execution is only available for inbound leases');
    }

    if (lease.status !== LeaseStatus.APPROVED) {
      throw new Error('Lease must be APPROVED to execute payment');
    }

    if (mode === 'IMMEDIATE') {
      // Execute double-entry memo order in atomic transaction
      const result = await this.repository.executePayment(
        id,
        lease.transit_account,
        lease.income_expense_account,
        Number(lease.amount)
      );

      return {
        success: true,
        payment_mode: mode,
        memo_order: result,
      };
    } else {
      // SCHEDULED: queue for next Monday 09:00 AM
      const scheduledRecord = await this.repository.schedulePayment(id, Number(lease.amount));
      console.log(`Scheduled payment for lease ${id}`);
      return {
        success: true,
        payment_mode: mode,
        message: `Payment scheduled processing`,
      };
    }
  }
}
