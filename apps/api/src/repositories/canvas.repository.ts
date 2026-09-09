import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/connection.js';

interface CanvasRow extends RowDataPacket {
  id: string;
  project_id: string;
  name: string;
  elements_json: any;
  version: number;
}

export class CanvasRepository {
  async findByProjectId(projectId: string): Promise<CanvasRow | null> {
    const [rows] = await pool.query<CanvasRow[]>(
      'SELECT id, project_id, name, elements_json, version FROM canvases WHERE project_id = ? LIMIT 1',
      [projectId]
    );
    return rows[0] ?? null;
  }

  async create(canvas: { id: string; projectId: string; elementsJson: any }): Promise<void> {
    await pool.query(
      'INSERT INTO canvases (id, project_id, elements_json, version) VALUES (?, ?, ?, 1)',
      [canvas.id, canvas.projectId, JSON.stringify(canvas.elementsJson)]
    );
  }

  async update(canvasId: string, elementsJson: any): Promise<number | null> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE canvases SET elements_json = ?, version = version + 1 WHERE id = ?',
      [JSON.stringify(elementsJson), canvasId]
    );
    if (result.affectedRows === 0) return null;
    
    const [rows] = await pool.query<CanvasRow[]>('SELECT version FROM canvases WHERE id = ?', [canvasId]);
    return rows[0]?.version ?? null;
  }

  async createSnapshot(snapshot: { id: string; canvasId: string; version: number; elementsJson: any; createdBy: string }): Promise<void> {
    await pool.query(
      'INSERT INTO canvas_snapshots (id, canvas_id, version, elements_json, created_by) VALUES (?, ?, ?, ?, ?)',
      [snapshot.id, snapshot.canvasId, snapshot.version, JSON.stringify(snapshot.elementsJson), snapshot.createdBy]
    );
  }
}
