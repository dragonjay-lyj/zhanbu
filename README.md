# ZhanBu 占卜

一个基于 Next.js 16 的多语言在线占卜平台，集成了传统术数分析、AI 解读、社区互动、会员体系、积分体系与支付能力（Linux DO Credit / 闲鱼）。

## 项目特性

- 多种占卜与分析功能：
  - 八字、紫微、六爻、梅花、塔罗
  - 合婚/关系分析、每日运势、黄历
  - 姓名分析、生肖、流年、签文、解梦、择吉
  - AI 聊天与 AI 解读
- 用户与权限体系：
  - Clerk 登录注册
  - 用户资料、历史记录、会员状态
  - 管理后台（用户、记录、订单、积分、系统设置）
- 支付与订单：
  - Linux DO Credit 支付（EasyPay 兼容）
  - 闲鱼支付兜底
  - 订单查询、回调验签、退款流程
- 业务能力：
  - 积分包、积分消费/调整
  - 社区发帖
  - 历史记录统一归档（`fortunes`）
- 工程能力：
  - TypeScript + App Router
  - Supabase（数据库 + 业务数据）
  - Next.js API Routes
  - 基础 PWA 支持

## 技术栈

- 前端：Next.js 16、React 19、TypeScript、Tailwind CSS 4、Radix UI
- 鉴权：Clerk
- 数据库：Supabase (PostgreSQL)
- 图表与交互：Recharts、`@use-gesture/react`、`tsparticles`
- AI：兼容 OpenAI 风格接口（可配置模型和网关）
- 支付：Linux DO Credit（EasyPay 协议）+ 闲鱼支付

## 目录结构

```text
src/
  app/
    (main)/                 # 主站页面
    admin/                  # 管理后台页面
    api/                    # 后端 API 路由
  components/               # 通用组件
  lib/                      # 业务库（auth/i18n/payment/supabase 等）
supabase/
  migrations/               # 数据库迁移脚本
```

## 快速开始

### 1. 环境要求

- Node.js `>= 20`
- npm `>= 10`
- 一个 Supabase 项目
- 一个 Clerk 应用

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env.local`（或 `.env`）：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ZhanBu 占卜

# Linux DO Credit（可选，推荐）
LINUX_DO_CREDIT_PID=
LINUX_DO_CREDIT_KEY=
LINUX_DO_CREDIT_GATEWAY=https://credit.linux.do/epay
LINUX_DO_CREDIT_RATE=10
# 可选：不填则按系统配置或自动推导
LINUX_DO_CREDIT_NOTIFY_URL=
LINUX_DO_CREDIT_RETURN_URL=
```

### 4. 初始化数据库

按 `supabase/migrations` 中的 SQL 顺序执行迁移：

- `002_membership.sql`
- `003_credits.sql`
- `20260203_*`
- `20260204_*`
- `20260206_*`
- `20260208_*`

建议使用 Supabase SQL Editor 或 Supabase CLI 统一执行。

### 5. 启动开发环境

```bash
npm run dev
```

访问：`http://localhost:3000`

## 常用脚本

```bash
npm run dev      # 本地开发
npm run build    # 生产构建
npm run start    # 生产启动
npm run lint     # 代码检查
```

## 支付配置说明

### Linux DO Credit

你可以通过两种方式配置：

- 环境变量（优先）
- 管理后台：`/admin/settings` -> 支付设置

关键配置：

- `payment_linuxdo_pid`
- `payment_linuxdo_key`
- `payment_linuxdo_gateway`
- `payment_linuxdo_notify_url`
- `payment_linuxdo_return_url`
- `payment_linuxdo_credit_rate`

汇率示例：

- 当 `payment_linuxdo_credit_rate=10` 时，`29.00 RMB -> 290 Credit`

### 闲鱼支付

在后台填写 `payment_url` 即可作为兜底支付方式。

## 开源前安全检查（强烈建议）

- 确认未提交真实密钥（`.env` / `.env.local`）
- 轮换以下密钥：
  - Supabase `service_role`
  - Clerk `secret`
  - Linux DO `key`
- 检查回调地址是否为正式域名
- 建议增加：
  - `LICENSE`
  - `CONTRIBUTING.md`
  - `.env.example`

## 后台入口

- 管理后台：`/admin`
- 包含模块：
  - 用户管理
  - 占卜记录
  - 订单管理（含 Linux DO 退款）
  - 积分管理
  - 系统设置

## 部署建议

- 推荐部署到 Vercel（Next.js 原生支持）
- 确保平台上配置完整环境变量
- Linux DO 回调地址使用公网 HTTPS 域名

## 贡献指南

欢迎提交 Issue / PR。

建议流程：

1. Fork 项目并创建功能分支
2. 提交改动并保证 `npm run build` 通过
3. 发起 Pull Request，描述改动背景和测试结果

## 免责声明

本项目功能仅供学习与娱乐使用，不构成任何现实决策建议。
