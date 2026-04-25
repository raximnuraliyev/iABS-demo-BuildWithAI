// DEPRECATED: Counterparty model has been replaced by Client
// This file is kept for backward compatibility but is no longer used.
// See: server/repositories/client.repository.ts

export class CounterpartyRepository {
  async findAll(_type?: string, _search?: string) {
    return [];
  }

  async findById(_id: string) {
    return null;
  }

  async create(_data: any) {
    throw new Error('Counterparty model deprecated. Use Client instead.');
  }

  async update(_id: string, _data: any) {
    throw new Error('Counterparty model deprecated. Use Client instead.');
  }

  async delete(_id: string) {
    throw new Error('Counterparty model deprecated. Use Client instead.');
  }
}
