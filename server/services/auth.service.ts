import { AuthRepository } from '../repositories/auth.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async login(tabel_id: string, password: string): Promise<{ token: string; user: any } | null> {
    const user = await this.repository.findUserByTabelId(tabel_id);
    if (!user) return null;

    // Allow empty password_hash for demo/seed users (first login)
    if (user.password_hash === '') {
      // Demo mode: any password works for users with empty hash
    } else {
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) return null;
    }

    const token = jwt.sign(
      { tabel_id: user.tabel_id, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        tabel_id: user.tabel_id,
        full_name: user.full_name,
        is_head_admin: user.is_head_admin,
        role: user.role,
      }
    };
  }
}
