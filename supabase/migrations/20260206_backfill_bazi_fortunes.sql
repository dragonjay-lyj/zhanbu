-- 历史数据回填到 fortunes（幂等）
-- 覆盖：bazi/tarot/liuyao/meihua/community_post/ai_chat

-- 1) 八字
INSERT INTO fortunes (
    user_id,
    fortune_type,
    record_id,
    title,
    summary,
    created_at,
    updated_at
)
SELECT
    br.user_id,
    'bazi',
    br.id,
    '八字排盘',
    NULL,
    br.created_at,
    NOW()
FROM bazi_records br
WHERE br.user_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM fortunes f
      WHERE f.fortune_type = 'bazi'
        AND f.record_id = br.id
  );

-- 2) 塔罗
INSERT INTO fortunes (
    user_id,
    fortune_type,
    record_id,
    title,
    summary,
    created_at,
    updated_at
)
SELECT
    tr.user_id,
    'tarot',
    tr.id,
    '塔罗占卜',
    COALESCE(NULLIF(tr.spread_type, ''), 'single'),
    tr.created_at,
    NOW()
FROM tarot_records tr
WHERE tr.user_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM fortunes f
      WHERE f.fortune_type = 'tarot'
        AND f.record_id = tr.id
  );

-- 3) 六爻
INSERT INTO fortunes (
    user_id,
    fortune_type,
    record_id,
    title,
    summary,
    created_at,
    updated_at
)
SELECT
    lr.user_id,
    'liuyao',
    lr.id,
    '六爻排盘',
    COALESCE(lr.hexagram_result -> 'benGua' ->> 'name', lr.question, NULL),
    lr.created_at,
    NOW()
FROM liuyao_records lr
WHERE lr.user_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM fortunes f
      WHERE f.fortune_type = 'liuyao'
        AND f.record_id = lr.id
  );

-- 4) 梅花易数
INSERT INTO fortunes (
    user_id,
    fortune_type,
    record_id,
    title,
    summary,
    created_at,
    updated_at
)
SELECT
    mr.user_id,
    'meihua',
    mr.id,
    '梅花易数',
    COALESCE(mr.meihua_result -> 'benGua' ->> 'name', mr.question, NULL),
    mr.created_at,
    NOW()
FROM meihua_records mr
WHERE mr.user_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM fortunes f
      WHERE f.fortune_type = 'meihua'
        AND f.record_id = mr.id
  );

-- 5) 社区帖子（community_posts.user_id 为 clerk_id，需要映射 users.id）
INSERT INTO fortunes (
    user_id,
    fortune_type,
    record_id,
    title,
    summary,
    created_at,
    updated_at
)
SELECT
    u.id,
    'community_post',
    cp.id,
    COALESCE(NULLIF(cp.title, ''), '社区发帖'),
    LEFT(COALESCE(cp.category, 'general') || ' · ' || COALESCE(cp.content, ''), 800),
    cp.created_at,
    NOW()
FROM community_posts cp
JOIN users u ON u.clerk_id = cp.user_id
WHERE NOT EXISTS (
    SELECT 1
    FROM fortunes f
    WHERE f.fortune_type = 'community_post'
      AND f.record_id = cp.id
);

-- 6) AI 使用日志（ai_usage_logs.user_id 为 clerk_id，需要映射 users.id）
INSERT INTO fortunes (
    user_id,
    fortune_type,
    record_id,
    title,
    summary,
    created_at,
    updated_at
)
SELECT
    u.id,
    'ai_chat',
    aul.id,
    'AI 解读',
    LEFT(
        COALESCE(aul.divination_type, 'general') ||
        ' · tokens=' || COALESCE(aul.tokens_used, 0)::text ||
        ' · credits=' || COALESCE(aul.credits_cost, 0)::text,
        800
    ),
    aul.created_at,
    NOW()
FROM ai_usage_logs aul
JOIN users u ON u.clerk_id = aul.user_id
WHERE NOT EXISTS (
    SELECT 1
    FROM fortunes f
    WHERE f.fortune_type = 'ai_chat'
      AND f.record_id = aul.id
);
