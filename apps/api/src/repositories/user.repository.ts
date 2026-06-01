import type { RowDataPacket } from 'mysql2';
import { pool } from '../database/connection.js';

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  password_hash: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const [rows] = await pool.query<UserRow[]>('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);
    const row = rows[0];
    return row ? this.toRecord(row) : null;
  }

  async create(user: UserRecord): Promise<void> {
    await pool.query('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)', [
      user.id,
      user.name,
      user.email,
      user.passwordHash
    ]);
  }

  private toRecord(row: UserRow): UserRecord {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash
    };
  }
}
