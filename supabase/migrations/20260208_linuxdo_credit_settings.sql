-- Linux DO Credit 支付配置项
INSERT INTO system_settings (key, value, description, category, is_public)
VALUES
    ('payment_linuxdo_pid', '', 'LINUX DO Credit Client ID', 'payment', false),
    ('payment_linuxdo_key', '', 'LINUX DO Credit Client Secret', 'payment', false),
    ('payment_linuxdo_gateway', 'https://credit.linux.do/epay', 'LINUX DO Credit 网关地址', 'payment', false),
    ('payment_linuxdo_notify_url', '', 'LINUX DO Credit 回调地址（可选）', 'payment', false),
    ('payment_linuxdo_return_url', '', 'LINUX DO Credit 返回地址（可选）', 'payment', false)
ON CONFLICT (key) DO NOTHING;
