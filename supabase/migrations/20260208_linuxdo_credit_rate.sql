-- Linux DO Credit 汇率配置（人民币 1 元兑换多少 Credit）
INSERT INTO system_settings (key, value, description, category, is_public)
VALUES
    ('payment_linuxdo_credit_rate', '10', 'LINUX DO Credit 汇率（每 1 元兑换 Credit 数）', 'payment', false)
ON CONFLICT (key) DO NOTHING;
