-- 为 users 表添加 role 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'member', 'admin'));

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 如果之前创建了 profiles 表作为视图或别名，创建一个视图以保持兼容性
-- CREATE OR REPLACE VIEW profiles AS SELECT *, clerk_id as id FROM users;

-- 更新第一个用户为管理员（如果存在）
-- UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);
