-- 扩展 fortunes.fortune_type 取值范围（全站历史类型）
ALTER TABLE fortunes
DROP CONSTRAINT IF EXISTS fortunes_fortune_type_check;

ALTER TABLE fortunes
ADD CONSTRAINT fortunes_fortune_type_check CHECK (
    fortune_type IN (
        'bazi',
        'ziwei',
        'liuyao',
        'meihua',
        'tarot',
        'marriage',
        'daily',
        'name',
        'zodiac',
        'shengxiao',
        'liunian',
        'qianwen',
        'jiemeng',
        'zeji',
        'huangli',
        'ai_chat',
        'community_post',
        'qimen',
        'liuren',
        'jinkouque',
        'fengshui'
    )
);

-- 历史去重查询加速（record_id 去重场景）
CREATE INDEX IF NOT EXISTS idx_fortunes_user_type_record
    ON fortunes (user_id, fortune_type, record_id)
    WHERE record_id IS NOT NULL;
