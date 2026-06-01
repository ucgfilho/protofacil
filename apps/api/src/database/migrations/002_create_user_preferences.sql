CREATE TABLE IF NOT EXISTS user_preferences (
  user_id CHAR(36) PRIMARY KEY,
  font_scale ENUM('normal', 'large', 'extra-large') NOT NULL DEFAULT 'large',
  contrast_mode ENUM('default', 'high') NOT NULL DEFAULT 'default',
  reduced_motion BOOLEAN NOT NULL DEFAULT TRUE,
  simplified_interface BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
