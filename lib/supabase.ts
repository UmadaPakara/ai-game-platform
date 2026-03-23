/**
 * Supabase クライアント・ユーティリティ
 * プロジェクト全体で使用する認証およびデータベース接続のインスタンスを作成します。
 */
import { createClient } from '@supabase/supabase-js'

// 環境変数からプロジェクトURLと匿名キーを取得
// ! は、変数が必ず定義されていることを示す TypeScript の Non-null assertion operator です。
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase クライアントの初期化
export const supabase = createClient(supabaseUrl, supabaseAnonKey)