"use client"
 
import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Game } from "@/types"
import { Trophy, Flame, Calendar, Award, Sparkles, Eye, Heart, Gamepad2, MousePointer2 } from "lucide-react"
import { AFFILIATE_ADS, getWeeklyTrendingAds } from "@/lib/affiliate"
import AffiliateSlot from "../components/AffiliateSlot"

export default function Ranking() {
  const [games, setGames] = useState<Game[]>([])
  const [search, setSearch] = useState<string>("")
  const [sort, setSort] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"games" | "gear">("games")
  const router = useRouter()
 
  const fetchRanking = async () => {
    const { data } = await supabase
      .from("games")
      .select("*")
 
    setGames(data as Game[] || [])
  }
 
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchRanking()
 
    // 🔥 リアルタイム更新
    const channel = supabase
      .channel("games-realtime")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "games" },
        () => {
          fetchRanking()
        }
      )
      .subscribe()
 
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
 
  const gamingGear = useMemo(() => {
    return getWeeklyTrendingAds(10)
  }, [])

  // 🔥 フィルタ＋ソート
  const filtered = useMemo(() => {
    const now = new Date()
 
    let list = games.filter(g =>
      g.title.toLowerCase().includes(search.toLowerCase())
    )
 
    // 🔥 24時間
    if (sort === "trend") {
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      list = list.filter(g =>
        g.created_at && new Date(g.created_at) >= last24h
      )
    }
 
    // 🔥 デイリー
    if (sort === "daily") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      list = list.filter(g =>
        g.created_at && new Date(g.created_at) >= today
      )
    }
 
    // 🔥 週間
    if (sort === "weekly") {
      const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      list = list.filter(g =>
        g.created_at && new Date(g.created_at) >= last7days
      )
    }
 
    // 🔥 並び替え（総合スコア）
    if (sort === "likes" || sort === "trend" || sort === "daily" || sort === "weekly") {
      list.sort((a, b) =>
        ((b.likes || 0) * 3 + (b.views || 0)) -
        ((a.likes || 0) * 3 + (a.views || 0))
      )
    }
 
    // 🔥 新着
    if (sort === "new") {
      list.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }
 
    return list
  }, [games, search, sort])
 
  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
 
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3 drop-shadow-md">
            <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" /> ランキング
          </h1>
 
          {/* 🔥 検索＋ソート */}
          <div className="flex gap-3">
            <div className="flex-1 sm:flex-none relative">
              <input
                className="w-full sm:w-64 pl-4 pr-4 py-2 bg-black/40 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm text-white placeholder-gray-400 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all"
                placeholder="検索..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {activeTab === "games" && (
                <div className="relative">
                    <select
                    className="pl-9 pr-8 py-2 bg-black/40 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium text-gray-200 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-sm appearance-none cursor-pointer hover:bg-black/60 transition-colors"
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    >
                    <option value="all">👑 総合</option>
                    <option value="trend">🔥 24時間</option>
                    <option value="daily">💎 デイリー</option>
                    <option value="weekly">🏅 週間</option>
                    <option value="new">✨ 新着</option>
                    </select>
                    <Flame className="w-4 h-4 text-purple-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
            )}
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="flex gap-4 mb-8 border-b border-gray-800/50 pb-px">
            <button
                onClick={() => setActiveTab("games")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${activeTab === "games" ? "text-purple-400" : "text-gray-500 hover:text-gray-300"}`}
            >
                <Gamepad2 className="w-4 h-4" />
                ゲーム
                {activeTab === "games" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
            </button>
            <button
                onClick={() => setActiveTab("gear")}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${activeTab === "gear" ? "text-purple-400" : "text-gray-500 hover:text-gray-300"}`}
            >
                <MousePointer2 className="w-4 h-4" />
                ゲーミングギア
                {activeTab === "gear" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
            </button>
        </div>
 
        {activeTab === "games" ? (
            <div className="flex flex-col gap-4">
            {filtered.map((game, index) => (
                <div
                key={game.id}
                className="flex flex-col sm:flex-row gap-4 bg-black/40 p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-gray-800/50 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all cursor-pointer group backdrop-blur-md"
                onClick={() => router.push(`/game/${game.id}`)}
                >
                <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
                    {index === 0 && <Award className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] mb-1" />}
                    {index === 1 && <Award className="w-7 h-7 text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.8)] mb-1" />}
                    {index === 2 && <Award className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)] mb-1" />}
                    <span className={`text-xl font-bold ${index < 3 ? 'text-purple-400' : 'text-gray-500'}`}>
                    {index + 1}
                    </span>
                </div>
    
                <div className="w-full sm:w-48 aspect-video bg-white/5 border border-gray-700/50 rounded-lg overflow-hidden flex-shrink-0 relative group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                    {game.thumbnail ? (
                    <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-black/40 backdrop-blur-sm text-sm font-medium">No Image</div>
                    )}
                </div>
    
                <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-xl font-bold text-gray-100 group-hover:text-purple-400 transition-colors mb-2 line-clamp-2">
                    {game.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {game.views || 0}</span>
                    <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {game.likes || 0}</span>
                    <span className="px-2.5 py-1 bg-purple-900/40 text-purple-300 rounded-md font-medium text-xs border border-purple-500/30 flex items-center gap-1 shadow-inner">
                        <Sparkles className="w-3.5 h-3.5" /> スコア: {(game.likes || 0) * 3 + (game.views || 0)}
                    </span>
                    </div>
                </div>
                </div>
            ))}
    
            {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-400 bg-black/20 rounded-xl border border-gray-800/50 backdrop-blur-sm">
                条件に一致するゲームがありません
                </div>
            )}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gamingGear.map((gear, index) => (
                    <div key={index} className="relative">
                        <div className="absolute -top-3 -left-3 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-20 border border-purple-400/50">
                            {index + 1}
                        </div>
                        <AffiliateSlot
                            type="sidebar-tall"
                            {...gear}
                        />
                    </div>
                ))}
            </div>
        )}
 
      </div>
    </>
  )
}