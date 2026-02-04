import { createClient } from '@supabase/supabase-js'

// Supabase 配置
// 请在 .env.local 中设置这些环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Supabase 浏览器客户端
 * 用于客户端组件中的数据获取
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * 数据库类型定义
 */
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    clerk_id: string
                    email: string | null
                    name: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    clerk_id: string
                    email?: string | null
                    name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    clerk_id?: string
                    email?: string | null
                    name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            bazi_records: {
                Row: {
                    id: string
                    user_id: string | null
                    name: string | null
                    gender: 'male' | 'female' | null
                    birth_year: number
                    birth_month: number
                    birth_day: number
                    birth_hour: number
                    birth_minute: number
                    is_lunar: boolean
                    use_true_solar: boolean
                    birth_location: string | null
                    bazi_result: Record<string, unknown> | null
                    ai_interpretation: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    name?: string | null
                    gender?: 'male' | 'female' | null
                    birth_year: number
                    birth_month: number
                    birth_day: number
                    birth_hour: number
                    birth_minute?: number
                    is_lunar?: boolean
                    use_true_solar?: boolean
                    birth_location?: string | null
                    bazi_result?: Record<string, unknown> | null
                    ai_interpretation?: string | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['bazi_records']['Insert']>
            }
            ziwei_records: {
                Row: {
                    id: string
                    user_id: string | null
                    name: string | null
                    gender: 'male' | 'female' | null
                    birth_datetime: string
                    chart_type: 'natal' | 'flow_year'
                    flow_year: number | null
                    flow_month: number | null
                    ziwei_chart: Record<string, unknown> | null
                    ai_interpretation: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    name?: string | null
                    gender?: 'male' | 'female' | null
                    birth_datetime: string
                    chart_type?: 'natal' | 'flow_year'
                    flow_year?: number | null
                    flow_month?: number | null
                    ziwei_chart?: Record<string, unknown> | null
                    ai_interpretation?: string | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['ziwei_records']['Insert']>
            }
            liuyao_records: {
                Row: {
                    id: string
                    user_id: string | null
                    question: string | null
                    cast_method: string | null
                    yao_data: Record<string, unknown> | null
                    hexagram_result: Record<string, unknown> | null
                    ai_interpretation: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    question?: string | null
                    cast_method?: string | null
                    yao_data?: Record<string, unknown> | null
                    hexagram_result?: Record<string, unknown> | null
                    ai_interpretation?: string | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['liuyao_records']['Insert']>
            }
            tarot_records: {
                Row: {
                    id: string
                    user_id: string | null
                    question: string | null
                    spread_type: string | null
                    cards: Record<string, unknown>[] | null
                    reading_style: string | null
                    ai_interpretation: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    question?: string | null
                    spread_type?: string | null
                    cards?: Record<string, unknown>[] | null
                    reading_style?: string | null
                    ai_interpretation?: string | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['tarot_records']['Insert']>
            }
            relationship_analysis: {
                Row: {
                    id: string
                    user_id: string | null
                    analysis_type: string
                    person_a: Record<string, unknown>
                    person_b: Record<string, unknown>
                    analysis_result: Record<string, unknown> | null
                    ai_interpretation: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    analysis_type: string
                    person_a: Record<string, unknown>
                    person_b: Record<string, unknown>
                    analysis_result?: Record<string, unknown> | null
                    ai_interpretation?: string | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['relationship_analysis']['Insert']>
            }
            daily_fortune: {
                Row: {
                    id: string
                    user_id: string | null
                    date: string
                    bazi_id: string | null
                    fortune_data: Record<string, unknown> | null
                    ai_interpretation: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    date: string
                    bazi_id?: string | null
                    fortune_data?: Record<string, unknown> | null
                    ai_interpretation?: string | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['daily_fortune']['Insert']>
            }
        }
    }
}
