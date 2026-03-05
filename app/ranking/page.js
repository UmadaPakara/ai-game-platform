"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Ranking() {
  const [games, setGames] = useState([])
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("all")
  const router = useRouter()

  const fetchRanking = async () => {
    const { data } = await supabase
      .from("games")
      .select("*")

    setGames(data || [])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchRanking()

    // 🔥 リアルタイム更新
    const channel = supabase
      .channel("games-realtime")
      .on(
        "postgres_changes",
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
        (b.likes * 3 + b.views) -
        (a.likes * 3 + a.views)
      )
    }

    // 🔥 新着
    if (sort === "new") {
      list.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      )
    }

    return list
  }, [games, search, sort])

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">🏆</span> ランキング
          </h1>

          {/* 🔥 検索＋ソート */}
          <div className="flex gap-3">
            <div className="flex-1 sm:flex-none relative">
              <input
                className="w-full sm:w-64 pl-4 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-sm"
                placeholder="検索..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium shadow-sm appearance-none cursor-pointer"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="all">🏆 総合</option>
              <option value="trend">🔥 24時間</option>
              <option value="daily">💎 デイリー</option>
              <option value="weekly">🏅 週間</option>
              <option value="new">🆕 新着</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filtered.map((game, index) => (
            <div
              key={game.id}
              className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => router.push(`/game/${game.id}`)}
            >
              <div className="flex items-center justify-center w-12 flex-shrink-0">
                <span className={`text-2xl font-bold ${index < 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  #{index + 1}
                </span>
              </div>

              <div className="w-full sm:w-48 aspect-video bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                {game.thumbnail ? (
                  <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">No Image</div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                  {game.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">👀 {game.views || 0}</span>
                  <span className="flex items-center gap-1">❤️ {game.likes || 0}</span>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-medium text-xs border border-indigo-100">
                    ⭐ スコア: {(game.likes || 0) * 3 + (game.views || 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-100">
              条件に一致するゲームがありません
            </div>
          )}
        </div>

      </div>
    </>
  )
}

// Removed legacy inline styles