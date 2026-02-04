-- 系统配置表
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 默认配置
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
-- AI 配置
('ai_api_key', '', 'AI API 密钥', 'ai', false),
('ai_api_base_url', 'https://api.deepseek.com/v1', 'AI API 基础 URL', 'ai', false),
('ai_model', 'deepseek-chat', 'AI 模型名称', 'ai', false),
-- 网站配置
('app_url', 'http://localhost:3000', '网站 URL', 'site', true),
('app_name', 'ZhanBu 占卜', '网站名称', 'site', true),
('app_description', 'AI 智能占卜平台', '网站描述', 'site', true),
('app_keywords', '占卜,八字,塔罗,紫微斗数,AI', '网站关键词', 'site', true),
-- 功能开关
('enable_ai_analysis', 'true', '启用 AI 分析功能', 'feature', false),
('enable_community', 'true', '启用社区功能', 'feature', false),
('enable_invite', 'true', '启用邀请功能', 'feature', false)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以修改
CREATE POLICY "Anyone can read public settings" ON system_settings 
FOR SELECT USING (is_public = true);

CREATE POLICY "Admin can read all settings" ON system_settings 
FOR SELECT USING (true);

CREATE POLICY "Admin can update settings" ON system_settings 
FOR UPDATE USING (true);

CREATE POLICY "Admin can insert settings" ON system_settings 
FOR INSERT WITH CHECK (true);
