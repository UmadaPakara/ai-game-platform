"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"
import AffiliateSlot from "../../components/AffiliateSlot"
import { AFFILIATE_ADS } from "@/lib/affiliate"

export default function GamePage() {
  const { id } = useParams()
  const router = useRouter()
  const iframeRef = useRef(null)

  const [game, setGame] = useState(null)
  const [comments, setComments] = useState([])
  const [relatedGames, setRelatedGames] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!iframeRef.current) return
    if (!document.fullscreenElement) {
      iframeRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const loadGame = useCallback(async () => {
    const { data } = await supabase
      .from("games")
      .select("*, profiles(username)")
      .eq("id", id)
      .single()

    if (data) setGame(data)
  }, [id])

  const fetchRelatedGames = useCallback(async () => {
    const { data } = await supabase
      .from("games")
      .select("*, profiles(username)")
      .neq("id", id)
      .limit(6)
    setRelatedGames(data || [])
  }, [id])

  const incrementViews = async () => {
    const { data } = await supabase
      .from("games")
      .select("views")
      .eq("id", id)
      .single()

    if (data) {
      await supabase
        .from("games")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", id)
    }
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("game_id", id)
      .order("created_at", { ascending: false })

    setComments(data || [])
  }

  useEffect(() => {
    if (id) {
      incrementViews()
      loadGame()
      fetchComments()
      fetchRelatedGames()
    }
  }, [id, loadGame, fetchRelatedGames])

  // フルスクリーン監視
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleChange)
    return () =>
      document.removeEventListener("fullscreenchange", handleChange)
  }, [])

  const handleLike = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) return alert("ログインしてください")

    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("game_id", id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("likes")
        .delete()
        .eq("game_id", id)
        .eq("user_id", user.id)
    } else {
      await supabase.from("likes").insert([
        { game_id: id, user_id: user.id }
      ])
    }

    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("game_id", id)

    await supabase
      .from("games")
      .update({ likes: count ?? 0 })
      .eq("id", id)

    loadGame()
  }

  if (!game) return <div className="p-10 text-gray-500">Loading...</div>

  const aspect = game.width && game.height ? `${game.width} / ${game.height}` : "4 / 3"

  return (
    <div className="max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-10 min-h-screen font-sans">

      {/* 🔴 Left Column: Video/Game Player & Main Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Play Area Wrapper */}
        <div
          className={`w-full bg-black rounded-xl overflow-hidden shadow-2xl relative group transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
          style={{ aspectRatio: aspect }}
        >
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-lg transition-colors border border-white/10 shadow-lg"
              title="フルスクリーン"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>
          </div>
          <iframe
            ref={iframeRef}
            srcDoc={game.html_code}
            className="w-full h-full border-none"
            allowFullScreen
          />
        </div>

        {/* Info Area */}
        {!isFullscreen && (
          <div className="mt-5 flex flex-col gap-4">
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
              {game.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-50 shadow-sm overflow-hidden">
                  {(game.profiles?.username || game.title).charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 leading-none">{game.profiles?.username || "作者不明"}</span>
                  <span className="text-[11px] text-gray-400 mt-1">
                    👀 {game.views || 0} 回視聴
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-3 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-full transition-all active:scale-95 shadow-sm"
                >
                  <span className="text-lg leading-none">❤️</span>
                  <span>{game.likes || 0}</span>
                </button>
              </div>
            </div>

            {/* Description Box */}
            <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
              <span className="font-bold mb-1.5 block text-gray-900">
                {new Date(game.created_at || "2020-01-01").toLocaleDateString('ja-JP')} 公開
              </span>
              <p className="whitespace-pre-wrap">{game.description || "このゲームの説明はありません。"}</p>
            </div>

            {/* 🔥 Affiliate Banner Slot */}
            <AffiliateSlot
              type="banner"
              title={AFFILIATE_ADS.gameDetail.banner.title}
              description={AFFILIATE_ADS.gameDetail.banner.description}
              badge={AFFILIATE_ADS.gameDetail.banner.badge}
              price={AFFILIATE_ADS.gameDetail.banner.price}
              link={AFFILIATE_ADS.gameDetail.banner.link}
              imageUrl={AFFILIATE_ADS.gameDetail.banner.imageUrl}
            />

            {/* Comments Area */}
            <div className="mt-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>コメント</span>
                <span className="text-gray-400 font-medium">{comments.length}</span>
              </h2>

              <div className="flex flex-col gap-6">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center font-bold text-gray-400 border border-gray-50">
                      {(c.user_id || "U").charAt(0)}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-900">匿名ユーザー</span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-sm text-gray-400 py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    コメントはまだありません。
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔴 Right Column: Related Games Sidebar */}
      {!isFullscreen && (
        <aside className="w-full lg:w-[380px] flex-shrink-0 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-gray-900 px-1 border-l-4 border-indigo-600 pl-3">次におすすめ</h2>

          <div className="flex flex-col gap-4">
            {relatedGames.map(rg => (
              <div
                key={rg.id}
                className="flex gap-3 group cursor-pointer"
                onClick={() => router.push(`/game/${rg.id}`)}
              >
                <div className="w-40 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                  {rg.thumbnail ? (
                    <img src={rg.thumbnail} alt={rg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs italic">No Image</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col py-1">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {rg.title}
                  </h3>
                  <span className="text-[11px] text-gray-500 mt-1.5">{rg.profiles?.username || "作者不明"}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">{rg.views || 0} 回視聴</span>
                </div>
              </div>
            ))}

            {/* 🔥 Sidebar Affiliate Slot */}
            <AffiliateSlot
              type="sidebar"
              title={AFFILIATE_ADS.gameDetail.sidebar.title}
              description={AFFILIATE_ADS.gameDetail.sidebar.description}
              badge={AFFILIATE_ADS.gameDetail.sidebar.badge}
              link={AFFILIATE_ADS.gameDetail.sidebar.link}
              price={AFFILIATE_ADS.gameDetail.sidebar.price}
              imageUrl={AFFILIATE_ADS.gameDetail.sidebar.imageUrl}
            />
          </div>
        </aside>
      )}

    </div>
  )
}

// Removed legacy inline styles