-- 会员套餐配置表
CREATE TABLE IF NOT EXISTS membership_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- 单位：分
    original_price INTEGER,
    period TEXT NOT NULL, -- 'monthly', 'yearly', 'lifetime'
    duration_days INTEGER NOT NULL, -- -1 表示永久
    daily_quota INTEGER NOT NULL DEFAULT -1, -- -1 表示无限
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES membership_plans(id),
    amount INTEGER NOT NULL,
    payment_method TEXT,
    payment_url TEXT, -- 闲鱼链接或其他支付链接
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, cancelled
    transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会员表
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE UNIQUE,
    plan_id TEXT NOT NULL REFERENCES membership_plans(id),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户配额使用记录
CREATE TABLE IF NOT EXISTS quota_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    used_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, date)
);

-- 插入默认会员套餐
INSERT INTO membership_plans (id, name, description, price, original_price, period, duration_days, daily_quota, features, sort_order) VALUES
('free', '免费版', '体验基础占卜功能', 0, NULL, 'forever', -1, 3, '["每日 3 次占卜", "基础占卜功能", "查看占卜结果", "保存历史记录 7 天"]', 0),
('monthly', '月度会员', '解锁全部功能', 2900, 4900, 'monthly', 30, 50, '["每日 50 次占卜", "全部占卜功能", "AI 智能解读", "历史记录永久保存", "高级排盘功能", "无广告体验"]', 1),
('yearly', '年度会员', '最优惠的选择', 19900, 58800, 'yearly', 365, -1, '["无限次占卜", "全部占卜功能", "AI 智能解读", "历史记录永久保存", "高级排盘功能", "无广告体验", "专属客服", "优先体验新功能"]', 2),
('lifetime', '终身会员', '一次付费永久享用', 49900, 99900, 'lifetime', 36500, -1, '["无限次占卜", "全部占卜功能", "AI 智能解读", "历史记录永久保存", "高级排盘功能", "无广告体验", "专属客服", "优先体验新功能", "专属身份标识", "终身免费升级"]', 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    period = EXCLUDED.period,
    duration_days = EXCLUDED.duration_days,
    daily_quota = EXCLUDED.daily_quota,
    features = EXCLUDED.features,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- 索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_quota_usage_user_date ON quota_usage(user_id, date);

-- RLS 策略
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE quota_usage ENABLE ROW LEVEL SECURITY;

-- 会员套餐：所有人可读
CREATE POLICY "membership_plans_read" ON membership_plans FOR SELECT USING (true);
-- 会员套餐：管理员可写
CREATE POLICY "membership_plans_admin" ON membership_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin')
);

-- 订单：用户只能看自己的
CREATE POLICY "orders_user_read" ON orders FOR SELECT USING (user_id = auth.uid()::text);
-- 订单：管理员可查看全部
CREATE POLICY "orders_admin" ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin')
);

-- 会员：用户只能看自己的
CREATE POLICY "memberships_user_read" ON memberships FOR SELECT USING (user_id = auth.uid()::text);
-- 会员：管理员可管理
CREATE POLICY "memberships_admin" ON memberships FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin')
);

-- 配额：用户只能看自己的
CREATE POLICY "quota_usage_user" ON quota_usage FOR ALL USING (user_id = auth.uid()::text);
