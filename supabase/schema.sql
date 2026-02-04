-- =====================================================
-- ZhanBu 占卜网站数据库架构
-- 创建时间: 2026-01-29
-- 数据库: Supabase (PostgreSQL)
-- =====================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 用户表 (users)
-- 存储从 Clerk 同步的用户信息
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  -- 用户偏好设置
  preferred_calendar TEXT DEFAULT 'solar' CHECK (preferred_calendar IN ('solar', 'lunar')),
  use_true_solar_time BOOLEAN DEFAULT true,
  default_province TEXT DEFAULT '北京',
  -- 会员状态
  membership_type TEXT DEFAULT 'free' CHECK (membership_type IN ('free', 'basic', 'premium', 'lifetime')),
  membership_expires_at TIMESTAMPTZ,
  -- AI 使用配额
  ai_credits_remaining INTEGER DEFAULT 5,
  ai_credits_reset_at TIMESTAMPTZ,
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- 2. 占卜记录总表 (fortunes)
-- 所有占卜记录的汇总表
-- =====================================================
CREATE TABLE IF NOT EXISTS fortunes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fortune_type TEXT NOT NULL CHECK (fortune_type IN ('bazi', 'ziwei', 'liuyao', 'meihua', 'tarot', 'marriage', 'daily')),
  -- 关联的具体记录 ID
  record_id UUID,
  -- 基本信息
  title TEXT,
  summary TEXT,
  -- 是否公开分享
  is_public BOOLEAN DEFAULT false,
  share_code TEXT UNIQUE,
  -- 收藏和评分
  is_favorite BOOLEAN DEFAULT false,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 占卜记录索引
CREATE INDEX IF NOT EXISTS idx_fortunes_user_id ON fortunes(user_id);
CREATE INDEX IF NOT EXISTS idx_fortunes_type ON fortunes(fortune_type);
CREATE INDEX IF NOT EXISTS idx_fortunes_share_code ON fortunes(share_code);
CREATE INDEX IF NOT EXISTS idx_fortunes_created_at ON fortunes(created_at DESC);

-- =====================================================
-- 3. 八字记录表 (bazi_records)
-- =====================================================
CREATE TABLE IF NOT EXISTS bazi_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- 个人信息
  name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  -- 出生信息
  birth_year INTEGER NOT NULL,
  birth_month INTEGER NOT NULL CHECK (birth_month >= 1 AND birth_month <= 12),
  birth_day INTEGER NOT NULL CHECK (birth_day >= 1 AND birth_day <= 31),
  birth_hour INTEGER NOT NULL CHECK (birth_hour >= 0 AND birth_hour <= 23),
  birth_minute INTEGER DEFAULT 0 CHECK (birth_minute >= 0 AND birth_minute <= 59),
  -- 日历类型
  is_lunar BOOLEAN DEFAULT false,
  use_true_solar BOOLEAN DEFAULT true,
  -- 出生地点
  birth_province TEXT,
  birth_city TEXT,
  birth_longitude DECIMAL(10, 6),
  birth_latitude DECIMAL(10, 6),
  -- 八字计算结果 (JSONB)
  bazi_result JSONB,
  -- 结构示例:
  -- {
  --   "pillars": {
  --     "year": {"gan": "甲", "zhi": "子"},
  --     "month": {"gan": "乙", "zhi": "丑"},
  --     "day": {"gan": "丙", "zhi": "寅"},
  --     "hour": {"gan": "丁", "zhi": "卯"}
  --   },
  --   "wuxing": {"木": 2, "火": 3, "土": 1, "金": 1, "水": 1},
  --   "dayMaster": "丙",
  --   "dayMasterElement": "火",
  --   "dayMasterStrength": "strong",
  --   "hiddenStems": {...},
  --   "tenGods": {...},
  --   "nayin": {...}
  -- }
  
  -- AI 解读
  ai_interpretation TEXT,
  ai_model TEXT,
  ai_generated_at TIMESTAMPTZ,
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 八字记录索引
CREATE INDEX IF NOT EXISTS idx_bazi_user_id ON bazi_records(user_id);
CREATE INDEX IF NOT EXISTS idx_bazi_created_at ON bazi_records(created_at DESC);

-- =====================================================
-- 4. 紫微斗数记录表 (ziwei_records)
-- =====================================================
CREATE TABLE IF NOT EXISTS ziwei_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- 个人信息
  name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  -- 出生信息
  birth_year INTEGER NOT NULL,
  birth_month INTEGER NOT NULL,
  birth_day INTEGER NOT NULL,
  birth_hour INTEGER NOT NULL, -- 时辰 (0-11, 对应子-亥)
  is_lunar BOOLEAN DEFAULT false,
  -- 盘式类型
  chart_type TEXT DEFAULT 'natal' CHECK (chart_type IN ('natal', 'flow_year', 'flow_month', 'flow_day')),
  flow_year INTEGER,
  flow_month INTEGER,
  -- 紫微命盘结果 (JSONB)
  ziwei_chart JSONB,
  -- 结构示例:
  -- {
  --   "palaces": [
  --     {"name": "命宫", "position": 0, "mainStar": "紫微", "otherStars": ["文昌"], "sihua": "化禄"},
  --     ...
  --   ],
  --   "mingGong": 0,
  --   "shenGong": 6,
  --   "wuxingJu": "水二局",
  --   "dayunStart": 5,
  --   "dayunList": [...]
  -- }
  
  -- AI 解读
  ai_interpretation TEXT,
  ai_model TEXT,
  ai_generated_at TIMESTAMPTZ,
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 紫微记录索引
CREATE INDEX IF NOT EXISTS idx_ziwei_user_id ON ziwei_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ziwei_created_at ON ziwei_records(created_at DESC);

-- =====================================================
-- 5. 六爻记录表 (liuyao_records)
-- =====================================================
CREATE TABLE IF NOT EXISTS liuyao_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- 问卦信息
  question TEXT,
  question_category TEXT CHECK (question_category IN ('事业', '感情', '财运', '健康', '学业', '其他')),
  -- 起卦方式
  cast_method TEXT DEFAULT 'coin' CHECK (cast_method IN ('coin', 'time', 'number', 'manual')),
  cast_time TIMESTAMPTZ DEFAULT NOW(),
  -- 六爻数据 (JSONB)
  yao_data JSONB,
  -- 结构示例:
  -- {
  --   "lines": [
  --     {"position": 1, "type": "yang", "changing": false},
  --     {"position": 2, "type": "yin", "changing": true},
  --     ...
  --   ],
  --   "coinResults": [[1,1,0], [0,0,1], ...]
  -- }
  
  -- 卦象结果 (JSONB)
  hexagram_result JSONB,
  -- 结构示例:
  -- {
  --   "benGua": {"name": "乾", "number": 1, "element": "金"},
  --   "bianGua": {"name": "姤", "number": 44, "element": "金"},
  --   "shiYao": 5,
  --   "yingYao": 2,
  --   "liuQin": [...],
  --   "liuShen": [...],
  --   "worldBranch": "戌",
  --   "interpretation": "..."
  -- }
  
  -- AI 解读
  ai_interpretation TEXT,
  ai_model TEXT,
  ai_generated_at TIMESTAMPTZ,
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 六爻记录索引
CREATE INDEX IF NOT EXISTS idx_liuyao_user_id ON liuyao_records(user_id);
CREATE INDEX IF NOT EXISTS idx_liuyao_created_at ON liuyao_records(created_at DESC);

-- =====================================================
-- 6. 梅花易数记录表 (meihua_records)
-- =====================================================
CREATE TABLE IF NOT EXISTS meihua_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- 问卦信息
  question TEXT,
  -- 起卦方式
  cast_method TEXT DEFAULT 'time' CHECK (cast_method IN ('time', 'number', 'word', 'image', 'sound')),
  cast_input TEXT, -- 起卦输入（数字、文字等）
  cast_time TIMESTAMPTZ DEFAULT NOW(),
  -- 梅花易数结果 (JSONB)
  meihua_result JSONB,
  -- 结构示例:
  -- {
  --   "upperGua": {"name": "乾", "element": "金"},
  --   "lowerGua": {"name": "坤", "element": "土"},
  --   "benGua": {"name": "泰", "number": 11},
  --   "huGua": {"name": "归妹", "number": 54},
  --   "bianGua": {"name": "大有", "number": 14},
  --   "movingLine": 3,
  --   "tiYong": {"ti": "乾", "yong": "坤", "relation": "相克"}
  -- }
  
  -- AI 解读
  ai_interpretation TEXT,
  ai_model TEXT,
  ai_generated_at TIMESTAMPTZ,
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 梅花易数索引
CREATE INDEX IF NOT EXISTS idx_meihua_user_id ON meihua_records(user_id);
CREATE INDEX IF NOT EXISTS idx_meihua_created_at ON meihua_records(created_at DESC);

-- =====================================================
-- 7. 塔罗记录表 (tarot_records)
-- =====================================================
CREATE TABLE IF NOT EXISTS tarot_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- 问题信息
  question TEXT,
  -- 牌阵类型
  spread_type TEXT DEFAULT 'single' CHECK (spread_type IN ('single', 'three', 'celtic_cross', 'love', 'career', 'custom')),
  -- 解读风格
  reading_style TEXT DEFAULT 'standard' CHECK (reading_style IN ('standard', 'fire', 'moon', 'wise')),
  -- 抽取的牌 (JSONB Array)
  cards JSONB,
  -- 结构示例:
  -- [
  --   {"cardId": 0, "name": "愚者", "position": "过去", "reversed": false},
  --   {"cardId": 6, "name": "恋人", "position": "现在", "reversed": true},
  --   {"cardId": 17, "name": "星星", "position": "未来", "reversed": false}
  -- ]
  
  -- AI 解读
  ai_interpretation TEXT,
  ai_model TEXT,
  ai_generated_at TIMESTAMPTZ,
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 塔罗记录索引
CREATE INDEX IF NOT EXISTS idx_tarot_user_id ON tarot_records(user_id);
CREATE INDEX IF NOT EXISTS idx_tarot_created_at ON tarot_records(created_at DESC);

-- =====================================================
-- 8. 合婚/关系分析表 (relationship_analysis)
-- =====================================================
CREATE TABLE IF NOT EXISTS relationship_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- 分析类型
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('marriage', 'business', 'friendship', 'in_law', 'parent_child', 'workplace')),
  -- 甲方信息 (JSONB)
  person_a JSONB NOT NULL,
  -- {
  --   "name": "...",
  --   "gender": "male",
  --   "birthYear": 1990,
  --   "birthMonth": 1,
  --   "birthDay": 1,
  --   "birthHour": 12,
  --   "bazi": {...}
  -- }
  
  -- 乙方信息 (JSONB)
  person_b JSONB NOT NULL,
  -- 分析结果 (JSONB)
  analysis_result JSONB,
  -- {
  --   "overallScore": 85,
  --   "compatibility": {...},
  --   "strengths": [...],
  --   "challenges": [...],
  --   "advice": [...]
  -- }
  
  -- AI 解读
  ai_interpretation TEXT,
  ai_model TEXT,
  ai_generated_at TIMESTAMPTZ,
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 关系分析索引
CREATE INDEX IF NOT EXISTS idx_relationship_user_id ON relationship_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_type ON relationship_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_relationship_created_at ON relationship_analysis(created_at DESC);

-- =====================================================
-- 9. 每日运势表 (daily_fortune)
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_fortune (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  -- 日期
  fortune_date DATE NOT NULL,
  -- 关联的八字记录
  bazi_record_id UUID REFERENCES bazi_records(id) ON DELETE SET NULL,
  -- 运势数据 (JSONB)
  fortune_data JSONB,
  -- {
  --   "overall": "大吉",
  --   "overallScore": 90,
  --   "love": {"score": 85, "summary": "..."},
  --   "career": {"score": 90, "summary": "..."},
  --   "wealth": {"score": 80, "summary": "..."},
  --   "health": {"score": 95, "summary": "..."},
  --   "luckyColor": "红色",
  --   "luckyNumber": 8,
  --   "luckyDirection": "东南",
  --   "advice": "...",
  --   "dayGanZhi": "甲子"
  -- }
  
  -- AI 解读
  ai_interpretation TEXT,
  ai_model TEXT,
  ai_generated_at TIMESTAMPTZ,
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 唯一约束：每个用户每天只有一条记录
  UNIQUE(user_id, fortune_date)
);

-- 每日运势索引
CREATE INDEX IF NOT EXISTS idx_daily_fortune_user_id ON daily_fortune(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_fortune_date ON daily_fortune(fortune_date DESC);

-- =====================================================
-- 更新时间触发器
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fortunes_updated_at
  BEFORE UPDATE ON fortunes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (Row Level Security) 策略
-- =====================================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bazi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ziwei_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE liuyao_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE meihua_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_fortune ENABLE ROW LEVEL SECURITY;

-- Users 表策略
-- 用户只能查看和更新自己的记录
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = clerk_id OR clerk_id IS NULL);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = clerk_id);

-- Service Role 可以插入用户
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Fortunes 表策略
CREATE POLICY "Users can view own fortunes"
  ON fortunes FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text) OR is_public = true);

CREATE POLICY "Users can insert own fortunes"
  ON fortunes FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can update own fortunes"
  ON fortunes FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can delete own fortunes"
  ON fortunes FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Bazi Records 策略
CREATE POLICY "Users can view own bazi records"
  ON bazi_records FOR SELECT
  USING (user_id IS NULL OR user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Anyone can insert bazi records"
  ON bazi_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own bazi records"
  ON bazi_records FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Ziwei Records 策略
CREATE POLICY "Users can view own ziwei records"
  ON ziwei_records FOR SELECT
  USING (user_id IS NULL OR user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Anyone can insert ziwei records"
  ON ziwei_records FOR INSERT
  WITH CHECK (true);

-- Liuyao Records 策略
CREATE POLICY "Users can view own liuyao records"
  ON liuyao_records FOR SELECT
  USING (user_id IS NULL OR user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Anyone can insert liuyao records"
  ON liuyao_records FOR INSERT
  WITH CHECK (true);

-- Meihua Records 策略
CREATE POLICY "Users can view own meihua records"
  ON meihua_records FOR SELECT
  USING (user_id IS NULL OR user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Anyone can insert meihua records"
  ON meihua_records FOR INSERT
  WITH CHECK (true);

-- Tarot Records 策略
CREATE POLICY "Users can view own tarot records"
  ON tarot_records FOR SELECT
  USING (user_id IS NULL OR user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Anyone can insert tarot records"
  ON tarot_records FOR INSERT
  WITH CHECK (true);

-- Relationship Analysis 策略
CREATE POLICY "Users can view own relationship analysis"
  ON relationship_analysis FOR SELECT
  USING (user_id IS NULL OR user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Anyone can insert relationship analysis"
  ON relationship_analysis FOR INSERT
  WITH CHECK (true);

-- Daily Fortune 策略
CREATE POLICY "Users can view own daily fortune"
  ON daily_fortune FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can insert own daily fortune"
  ON daily_fortune FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can update own daily fortune"
  ON daily_fortune FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
