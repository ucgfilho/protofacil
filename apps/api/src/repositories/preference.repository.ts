import type { RowDataPacket } from 'mysql2';
import type { AccessibilityPreferencesInput, UserPreferences } from '@protofacil/shared';
import { pool } from '../database/connection.js';

interface PreferenceRow extends RowDataPacket {
  user_id: string;
  font_scale: UserPreferences['fontScale'];
  contrast_mode: UserPreferences['contrastMode'];
  reduced_motion: number;
  simplified_interface: number;
  created_at: Date;
  updated_at: Date;
}

export class PreferenceRepository {
  async createDefault(userId: string): Promise<UserPreferences> {
    await pool.query('INSERT INTO user_preferences (user_id) VALUES (?)', [userId]);
    const preferences = await this.findByUserId(userId);
    if (!preferences) {
      throw new Error('Preferências não foram criadas.');
    }
    return preferences;
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const [rows] = await pool.query<PreferenceRow[]>('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
    const row = rows[0];
    return row ? this.toPreferences(row) : null;
  }

  async update(userId: string, input: AccessibilityPreferencesInput): Promise<UserPreferences> {
    await pool.query(
      'UPDATE user_preferences SET font_scale = ?, contrast_mode = ?, reduced_motion = ?, simplified_interface = ? WHERE user_id = ?',
      [input.fontScale, input.contrastMode, input.reducedMotion, input.simplifiedInterface, userId]
    );
    const preferences = await this.findByUserId(userId);
    if (!preferences) {
      throw new Error('Preferências de acessibilidade não encontradas.');
    }
    return preferences;
  }

  private toPreferences(row: PreferenceRow): UserPreferences {
    return {
      userId: row.user_id,
      fontScale: row.font_scale,
      contrastMode: row.contrast_mode,
      reducedMotion: Boolean(row.reduced_motion),
      simplifiedInterface: Boolean(row.simplified_interface),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    };
  }
}
