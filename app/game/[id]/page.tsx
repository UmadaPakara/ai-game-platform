"use client"
 
import { useEffect, useState, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"
import AffiliateSlot from "../../components/AffiliateSlot"
import { AFFILIATE_ADS, detectGenre, getAdsByCategory, AffiliateAd } from "@/lib/affiliate"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Game, Comment } from "@/types"
import { GitFork, Sparkles } from "lucide-react"
 
export default function GamePage() {
  const { id } = useParams()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { language, t } = useLanguage()
 
  const [game, setGame] = useState<Game | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedGames, setRelatedGames] = useState<Game[]>([])
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [contextualAds, setContextualAds] = useState<{ banner?: AffiliateAd, sidebar?: AffiliateAd }>({})
 
  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    
    const isNativeFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
    
    if (isFullscreen) {
      // Exit fullscreen mode
      setIsFullscreen(false)
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      
      try {
        if (isNativeFullscreen) {
          if (document.exitFullscreen) {
            await document.exitFullscreen()
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen()
          }
        }
      } catch (err) {
        console.warn("Fullscreen exit failed:", err)
      }
    } else {
      // Enter fullscreen mode (Always visibly change UI first so mobile browsers immediately fall back if native fails silently)
      setIsFullscreen(true)
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
      
      try {
        if (containerRef.current.requestFullscreen) {
          const p = containerRef.current.requestFullscreen()
          if (p && (p as any).catch) (p as any).catch(() => {})
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          const p = (containerRef.current as any).webkitRequestFullscreen()
          if (p && (p as any).catch) (p as any).catch(() => {})
        }
      } catch (err) {
        console.warn("Fullscreen API failed, staying in fallback mode:", err)
      }
    }
  }
 
  const loadGame = useCallback(async () => {
    const { data, error } = await supabase
      .from("games")
      .select("*, profiles(username)")
      .eq("id", id)
      .single()
 
    if (error) {
      console.warn("Join with profiles failed, falling back:", error.message)
      const { data: simpleData, error: simpleError } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .single()
      
      if (simpleError) {
        console.error("Game fetch error:", simpleError)
        return
      }
 
      if (simpleData?.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", simpleData.user_id)
          .single()
        
        if (profileError) {
          console.error("Profile fetch error during fallback:", profileError);
        }
        setGame({ ...simpleData, profiles: profileData || null } as Game)
      } else {
        setGame(simpleData as Game)
      }
    } else {
      setGame(data as Game)
    }
  }, [id])
 
  const fetchRelatedGames = useCallback(async () => {
    const { data, error } = await supabase
      .from("games")
      .select("*, profiles(username)")
      .neq("id", id)
      .limit(6)
 
    if (error) {
      console.warn("Related games join failed, falling back")
      const { data: simpleData } = await supabase
        .from("games")
        .select("*")
        .neq("id", id)
        .limit(6)
      
      const gamesWithProfiles = await Promise.all((simpleData || []).map(async (g) => {
        if (!g.user_id) return { ...g, profiles: { username: "匿名ユーザー" } }
        const { data: p } = await supabase.from("profiles").select("username").eq("id", g.user_id).single()
        return { ...g, profiles: p || { username: "匿名ユーザー" } }
      }))
      setRelatedGames(gamesWithProfiles as Game[])
    } else {
      setRelatedGames(data as Game[] || [])
    }
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
 
    setComments(data as Comment[] || [])
  }
 
  useEffect(() => {
    if (id) {
      incrementViews()
      loadGame()
      fetchComments()
      fetchRelatedGames()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loadGame, fetchRelatedGames])

  // ジャンルに応じた広告を設定
  useEffect(() => {
    if (game) {
      const genre = detectGenre(game.title, game.description || "");
      const bannerAds = getAdsByCategory(genre, 1);
      const lifestyleAds = getAdsByCategory("LIFESTYLE", 1);
      
      setContextualAds({
        banner: bannerAds[0] || AFFILIATE_ADS.gameDetail.banner,
        sidebar: lifestyleAds[0] || AFFILIATE_ADS.gameDetail.sidebar
      });
    }
  }, [game]);
 
  // フルスクリーン監視
  useEffect(() => {
    const handleChange = () => {
      const isNative = !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
      if (isNative) {
        setIsFullscreen(true)
        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"
      } else if (!isNative && !isFullscreen) {
        // Only reset if we are not in pseudo-fullscreen mode
        // Wait, if we WERE in native and we just exited, we want to clear everything.
        // If we are in pseudo-mode, isNative is already false.
        // So we need to know if we just exited native.
      }
      
      // Let's simplify: if native is false AND the event fired, it means someone exited native.
      if (!isNative) {
        // If we are in pseudo mode, we might want to stay in pseudo mode? 
        // No, typically if native exists and we exit it, we want to exit entirely.
        setIsFullscreen(false)
        document.body.style.overflow = ""
        document.documentElement.style.overflow = ""
      }
    }
 
    document.addEventListener("fullscreenchange", handleChange)
    document.addEventListener("webkitfullscreenchange", handleChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleChange)
      document.removeEventListener("webkitfullscreenchange", handleChange)
    }
  }, [])
 
  // フルスクリーン切り替え時に子要素へリサイズイベントを通知
  useEffect(() => {
    if (isFullscreen && iframeRef.current) {
      const timer = setTimeout(() => {
        iframeRef.current?.contentWindow?.dispatchEvent(new Event('resize'));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);
 
  const handleLike = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
 
    if (!user) return alert(language === "ja" ? "ログインしてください" : "Please login")
 
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
 
  if (!game) return <div className="p-10 text-gray-500">{t("common.loading")}</div>
 
  const width = (game as any).width
  const height = (game as any).height
  const aspect = width && height ? `${width} / ${height}` : "4 / 3"
 
  return (
    <div className="max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-10 min-h-screen font-sans">
 
      {/* 🔴 Left Column: Video/Game Player & Main Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Play Area Wrapper */}
        <div
          ref={containerRef}
          className={`w-full bg-black rounded-xl overflow-hidden shadow-2xl relative group transition-all duration-300`}
          style={{ aspectRatio: aspect }}
        >
          <div className="absolute top-4 right-4 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-lg transition-colors border border-white/10 shadow-lg"
              title={t("game.fullscreen")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
          <iframe
            srcDoc={`
              <style>
                html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; display: flex; justify-content: center; align-items: center; background: #000; }
                canvas { max-width: 100%; max-height: 100%; object-fit: contain; }
              </style>
              ${game.html_code}
            `}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-pointer-lock"
            allowFullScreen
          />
        </div>

        {/* Portal for Fullscreen */}
        {isFullscreen && typeof document !== 'undefined' && createPortal(
          <div className="fullscreen-portal">
            <div className="absolute top-4 right-4 z-[2147483647]">
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white rounded-full transition-all border border-white/20 shadow-2xl active:scale-90 flex items-center justify-center"
                title={t("common.close") || "Close"}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={`
                <style>
                  html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; display: flex; justify-content: center; align-items: center; background: #000; }
                  canvas { max-width: 100%; max-height: 100%; object-fit: contain; }
                </style>
                ${game.html_code}
              `}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-pointer-lock"
              allowFullScreen
            />
          </div>,
          document.body
        )}
 
        {/* Info Area */}
        {!isFullscreen && (
          <div className="mt-5 flex flex-col gap-4 bg-black/40 p-6 rounded-2xl border border-gray-800/50 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <h1 className="text-2xl font-extrabold text-gray-100 leading-tight drop-shadow-md">
              {game.title}
            </h1>
 
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-900/40 text-purple-300 flex items-center justify-center font-bold text-lg border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)] overflow-hidden">
                  {(game.profiles?.username || game.title).charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-200 leading-none">{game.profiles?.username || t("common.unknown_author")}</span>
                  <span className="text-[11px] text-gray-400 mt-1">
                    👀 {t("common.views", { count: game.views || 0 })}
                  </span>
                </div>
              </div>
 
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-3 px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-100 font-bold rounded-full transition-all active:scale-95 border border-gray-700/50 shadow-sm"
                >
                  <span className="text-lg leading-none">❤️</span>
                  <span>{game.likes || 0}</span>
                </button>
                <button
                  onClick={() => router.push(`/upload?fork_id=${game.id}`)}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold rounded-full transition-all active:scale-95 border border-purple-500/30 shadow-sm"
                >
                  <GitFork className="w-4 h-4" />
                  <span>{t("game.fork")}</span>
                </button>
              </div>
            </div>
 
            {/* Description Box */}
            <div className="bg-white/5 rounded-2xl p-4 text-sm text-gray-300 leading-relaxed border border-gray-700/50">
              <span className="font-bold mb-1.5 block text-gray-100">
                {t("game.published_at", { date: new Date(game.created_at || "2020-01-01").toLocaleDateString(language === "ja" ? 'ja-JP' : 'en-US') })}
              </span>
              <p className="whitespace-pre-wrap">{game.description || (language === "ja" ? "このゲームの説明はありません。" : "No description for this game.")}</p>
            </div>

            {/* AI Prompt Display */}
            {game.prompt && (
              <div className="bg-yellow-500/5 rounded-2xl p-4 text-sm text-gray-300 leading-relaxed border border-yellow-500/20">
                <span className="font-bold mb-1.5 flex items-center gap-2 text-yellow-300">
                  <Sparkles className="w-4 h-4" />
                  {t("game.prompt_used")}
                </span>
                <p className="whitespace-pre-wrap mt-2 text-gray-400 font-mono text-xs bg-black/30 p-3 rounded-lg">{game.prompt}</p>
              </div>
            )}
 
            {/* 🔥 Affiliate Banner Slot */}
            {contextualAds.banner && (
              <AffiliateSlot
                type="banner"
                title={contextualAds.banner.title}
                description={contextualAds.banner.description}
                badge={contextualAds.banner.badge}
                price={contextualAds.banner.price}
                link={contextualAds.banner.link}
                imageUrl={contextualAds.banner.imageUrl}
              />
            )}
 
            {/* Comments Area */}
            <div className="mt-4 border-t border-gray-800/50 pt-6">
              <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
                <span>{t("game.comments")}</span>
                <span className="text-gray-400 font-medium">{comments.length}</span>
              </h2>
 
              <div className="flex flex-col gap-6">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-purple-900/20 flex-shrink-0 flex items-center justify-center font-bold text-purple-400 border border-purple-500/20 shadow-inner">
                      {(c.user_id || "U").charAt(0)}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-200">{language === "ja" ? "匿名ユーザー" : "Anonymous User"}</span>
                        <span className="text-[11px] text-gray-500">
                          {new Date(c.created_at).toLocaleDateString(language === "ja" ? "ja-JP" : "en-US")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
 
                {comments.length === 0 && (
                  <div className="text-sm text-gray-400 py-10 text-center bg-white/5 rounded-2xl border border-dashed border-gray-700/50">
                    {t("game.no_comments")}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
 
      {/* 🔴 Right Column: Related Games Sidebar */}
      {!isFullscreen && (
        <aside className="w-full lg:w-[380px] flex-shrink-0 flex flex-col gap-6 bg-black/40 p-6 rounded-2xl border border-gray-800/50 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <h2 className="text-lg font-bold text-gray-100 px-1 border-l-4 border-purple-500 pl-3 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">{t("game.related")}</h2>
 
          <div className="flex flex-col gap-4">
            {relatedGames.map(rg => (
              <div
                key={rg.id}
                className="flex gap-3 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors"
                onClick={() => router.push(`/game/${rg.id}`)}
              >
                <div className="w-40 h-24 bg-black/50 border border-gray-700/50 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                  {rg.thumbnail ? (
                    <img src={rg.thumbnail} alt={rg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs italic">No Image</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col py-1">
                  <h3 className="text-sm font-bold text-gray-200 line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                    {rg.title}
                  </h3>
                  <span className="text-[11px] text-gray-400 mt-1.5">{rg.profiles?.username || t("common.unknown_author")}</span>
                  <span className="text-[11px] text-gray-500 mt-0.5">{t("common.views", { count: rg.views || 0 })}</span>
                </div>
              </div>
            ))}
 
            {/* 🔥 Sidebar Affiliate Slot */}
            {contextualAds.sidebar && (
              <AffiliateSlot
                type="sidebar"
                title={contextualAds.sidebar.title}
                description={contextualAds.sidebar.description}
                badge={contextualAds.sidebar.badge}
                link={contextualAds.sidebar.link}
                price={contextualAds.sidebar.price}
                imageUrl={contextualAds.sidebar.imageUrl}
              />
            )}
          </div>
        </aside>
      )}
 
    </div>
  )
}