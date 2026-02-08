-- 记录第三方网关实际支付金额（用于 Linux DO 回调验签与退款）
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_amount TEXT;

-- 兼容历史 Linux DO 订单：默认按 1:1（元）回填
UPDATE orders
SET payment_amount = TO_CHAR(amount / 100.0, 'FM9999999990.00')
WHERE payment_method = 'linuxdo_credit'
  AND payment_amount IS NULL;
