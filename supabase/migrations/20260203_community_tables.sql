-- 占卜社区相关表

-- 帖子表
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 评论表
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 点赞表
CREATE TABLE IF NOT EXISTS community_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON community_comments(user_id);

-- RLS 策略
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- 帖子策略 - 所有人可读，登录用户可写
CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (true);

-- 评论策略
CREATE POLICY "Anyone can read comments" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON community_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own comments" ON community_comments FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own comments" ON community_comments FOR DELETE USING (true);

-- 点赞策略
CREATE POLICY "Anyone can read likes" ON community_likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON community_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete their own likes" ON community_likes FOR DELETE USING (true);
