import { ClientRepository } from '../repositories/client.repository';
import { SubjectType, Prisma } from '@prisma/client';

export class ClientService {
  private repository: ClientRepository;

  constructor() {
    this.repository = new ClientRepository();
  }

  async getAllClients(filters?: { subject?: string; search?: string; code_filial?: string; condition?: string }) {
    return this.repository.findAll({
      subject: filters?.subject as SubjectType | undefined,
      search: filters?.search,
      code_filial: filters?.code_filial,
      condition: filters?.condition !== undefined ? filters.condition === 'true' : undefined,
    });
  }

  async getClientById(id: string) {
    const client = await this.repository.findById(id);
    if (!client) throw new Error('Client not found');
    return client;
  }

  async createClient(data: {
    code: string;
    name: string;
    subject: SubjectType;
    code_filial: string;
    inn: string;
    address?: string;
    phone?: string;
  }) {
    return this.repository.create(data);
  }

  async updateClient(id: string, data: Prisma.ClientUpdateInput) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Client not found');
    return this.repository.update(id, data);
  }

  async deleteClient(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Client not found');
    return this.repository.delete(id);
  }
}
