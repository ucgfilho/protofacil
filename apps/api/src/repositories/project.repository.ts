import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { ProjectSummary } from '@protofacil/shared';
import { pool } from '../database/connection.js';

interface ProjectRow extends RowDataPacket {
  id: string;
  name: string;
  description: string | null;
  updated_at: Date;
}

export class ProjectRepository {
  async listByOwner(ownerId: string): Promise<ProjectSummary[]> {
    const [rows] = await pool.query<ProjectRow[]>(
      'SELECT id, name, description, updated_at FROM projects WHERE owner_id = ? AND is_deleted = FALSE ORDER BY updated_at DESC',
      [ownerId]
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      updatedAt: row.updated_at.toISOString()
    }));
  }

  async findByOwner(projectId: string, ownerId: string): Promise<ProjectSummary | null> {
    const [rows] = await pool.query<ProjectRow[]>(
      'SELECT id, name, description, updated_at FROM projects WHERE id = ? AND owner_id = ? AND is_deleted = FALSE LIMIT 1',
      [projectId, ownerId]
    );
    const project = rows[0];

    if (!project) {
      return null;
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      updatedAt: project.updated_at.toISOString()
    };
  }

  async create(project: { id: string; ownerId: string; name: string; description: string | null }): Promise<void> {
    await pool.query('INSERT INTO projects (id, owner_id, name, description) VALUES (?, ?, ?, ?)', [
      project.id,
      project.ownerId,
      project.name,
      project.description
    ]);
  }

  async createOwnerCollaborator(input: { id: string; projectId: string; userId: string }): Promise<void> {
    await pool.query('INSERT INTO project_collaborators (id, project_id, user_id, role) VALUES (?, ?, ?, ?)', [
      input.id,
      input.projectId,
      input.userId,
      'owner'
    ]);
  }

  async softDelete(projectId: string, ownerId: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE projects SET is_deleted = TRUE WHERE id = ? AND owner_id = ?',
      [projectId, ownerId]
    );
    return result.affectedRows > 0;
  }

  async rename(projectId: string, ownerId: string, name: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE projects SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner_id = ? AND is_deleted = FALSE',
      [name, projectId, ownerId]
    );
    return result.affectedRows > 0;
  }
}
