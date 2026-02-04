-- 积分系统数据库迁移
-- 创建时间: 2026-02-03

-- 用户积分表
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    balance INTEGER NOT NULL DEFAULT 100, -- 默认新用户100积分
    total_earned INTEGER NOT NULL DEFAULT 100, -- 总获得积分
    total_spent INTEGER NOT NULL DEFAULT 0, -- 总消费积分
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 积分交易记录表
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL, -- 正数为增加，负数为减少
    balance_after INTEGER NOT NULL, -- 交易后余额
    type TEXT NOT NULL, -- 类型: recharge, consume, reward, refund, admin
    description TEXT, -- 描述
    reference_id TEXT, -- 关联ID（订单号、功能名等）
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 充值套餐表
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL, -- 积分数量
    price DECIMAL(10,2) NOT NULL, -- 价格（元）
    bonus_credits INTEGER DEFAULT 0, -- 赠送积分
    is_popular BOOLEAN DEFAULT false, -- 是否热门
    is_active BOOLEAN DEFAULT true, -- 是否启用
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 积分消费规则表
CREATE TABLE IF NOT EXISTS credit_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL UNIQUE, -- 动作: ai_chat, ai_interpret, etc.
    cost INTEGER NOT NULL, -- 消耗积分
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active) WHERE is_active = true;

-- RLS 策略
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_rules ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的积分
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid()::text = user_id OR auth.jwt() ->> 'role' = 'admin');

-- 用户只能查看自己的交易记录
CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid()::text = user_id OR auth.jwt() ->> 'role' = 'admin');

-- 所有人可查看套餐
CREATE POLICY "Anyone can view packages" ON credit_packages
    FOR SELECT USING (is_active = true);

-- 所有人可查看规则
CREATE POLICY "Anyone can view rules" ON credit_rules
    FOR SELECT USING (is_active = true);

-- 插入默认充值套餐
INSERT INTO credit_packages (name, credits, price, bonus_credits, is_popular, sort_order) VALUES
    ('入门包', 100, 10.00, 0, false, 1),
    ('标准包', 500, 50.00, 100, true, 2),
    ('豪华包', 1000, 100.00, 500, false, 3),
    ('至尊包', 3000, 300.00, 2000, false, 4)
ON CONFLICT DO NOTHING;

-- 插入积分消费规则
INSERT INTO credit_rules (action, cost, description) VALUES
    ('ai_chat', 5, 'AI 对话占卜'),
    ('ai_interpret', 10, 'AI 深度解读'),
    ('pdf_export', 15, 'PDF 报告导出'),
    ('share_card', 5, '分享卡片生成')
ON CONFLICT (action) DO UPDATE SET cost = EXCLUDED.cost, description = EXCLUDED.description;

-- 积分获取规则（用于参考，不存入数据库）
-- 新用户注册: +100 积分 (自动)
-- 每日签到: +5 积分
-- 邀请好友: +50 积分
-- 社区互动: +2 积分
