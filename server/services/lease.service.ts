import { LeaseRepository } from '../repositories/lease.repository';
import { LeaseStatus, Prisma } from '@prisma/client';

export class LeaseService {
  private repository: LeaseRepository;

  constructor() {
    this.repository = new LeaseRepository();
  }

  async getAllLeases(direction?: string, status?: string) {
    const filters: any = {};
    if (direction) filters.lease_direction = direction;
    if (status) filters.status = status;
    return this.repository.findAll(filters);
  }

  async getLeaseById(id: string) {
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');
    return lease;
  }

  async createLease(data: Prisma.LeaseUncheckedCreateInput) {
    // Force INTRODUCED status on creation
    data.status = LeaseStatus.INTRODUCED;
    return this.repository.create(data);
  }

  async updateLease(id: string, data: any) {
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');
    if (lease.status !== LeaseStatus.INTRODUCED) {
      throw new Error('Can only modify leases in INTRODUCED status');
    }

    const updateData: Prisma.LeaseUncheckedUpdateInput = {};
    if (data.asset_id) updateData.asset_id = data.asset_id;
    if (data.counterparty_id) updateData.counterparty_id = data.counterparty_id;
    if (data.lease_direction) updateData.lease_direction = data.lease_direction;
    if (data.contract_amount) updateData.contract_amount = data.contract_amount;
    if (data.start_date) updateData.start_date = new Date(data.start_date);
    if (data.end_date) updateData.end_date = new Date(data.end_date);

    return this.repository.update(id, updateData);
  }

  async deleteLease(id: string) {
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');
    if (lease.status !== LeaseStatus.INTRODUCED) {
      throw new Error('Can only delete leases in INTRODUCED status');
    }
    return this.repository.delete(id);
  }

  async approveLease(id: string) {
    // Fetch lease to determine internal account logic based on lease type (OUTBOUND/INBOUND). 
    // In our simplified plan, we hardcode an internal bank account.
    const internalBankAccount = '12345678901234567890';
    
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');

    const counterpartyAccount = lease.counterparty.settlement_account;

    // Use Prisma transaction defined in LeaseRepository
    return this.repository.approveTransaction(
      id,
      internalBankAccount,
      counterpartyAccount,
      Number(lease.contract_amount)
    );
  }

  async returnLease(id: string) {
    const lease = await this.repository.findById(id);
    if (!lease) throw new Error('Lease not found');
    if (lease.status !== LeaseStatus.APPROVED) {
      throw new Error('Must be in APPROVED status to return');
    }

    return this.repository.updateStatus(id, LeaseStatus.RETURNED);
  }

  async payLease(id: string, type: 'IMMEDIATE' | 'NEXT_BUSINESS_DAY') {
    if (type === 'IMMEDIATE') {
      // Simulate Payment Push sync
      console.log(`Pushed immediate payment to iABS for lease ${id}`);
    } else {
      // Simulate Worker scheduled payment sync
      console.log(`Scheduled payment for lease ${id} on next business day`);
    }
    return { success: true, payment_type: type };
  }
}
