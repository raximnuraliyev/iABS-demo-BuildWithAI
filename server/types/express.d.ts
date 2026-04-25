export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        tabel_id: string;
        role_id: string;
      };
      auditInfo?: {
        action: string;
        entity_name: string;
        entity_id?: string;
        previous_data?: any;
        new_data?: any;
      };
    }
  }
}
