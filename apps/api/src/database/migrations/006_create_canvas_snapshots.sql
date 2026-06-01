CREATE TABLE IF NOT EXISTS canvas_snapshots (
  id CHAR(36) PRIMARY KEY,
  canvas_id CHAR(36) NOT NULL,
  version INT NOT NULL,
  elements_json JSON NOT NULL,
  created_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_canvas_snapshots_canvas FOREIGN KEY (canvas_id) REFERENCES canvases(id) ON DELETE CASCADE,
  CONSTRAINT fk_canvas_snapshots_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_canvas_snapshots_canvas_version (canvas_id, version)
);
