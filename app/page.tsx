"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import GameCard from "./components/GameCard"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Game, Profile } from "@/types"
import { User } from "@supabase/supabase-js"
import { Gamepad2, Trophy, Lock } from "lucide-react"

import AILoadingSpinner from "./components/AILoadingSpinner"

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "home"
  const { language, t } = useLanguage()

  const [games, setGames] = useState<Game[]>([])
  const [myGames, setMyGames] = useState<Game[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [sort, setSort] = useState<string>("new")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editName, setEditName] = useState<string>("")
  const [editBio, setEditBio] = useState<string>("")
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const [editingGameId, setEditingGameId] = useState<string | null>(null)
  const [editHtml, setEditHtml] = useState<string>("")

  const q = searchParams.get("q") || ""

  // ── ゲーム一覧取得（ログイン不要）──────────────────────────
  const loadGames = async () => {
    // profilesとの結合を試みる（リレーションがあれば取得可能）
    const { data, error } = await supabase
      .from("games")
      .select("*, profiles(username)")

    if (error) {
      console.warn("Manual join fallback triggered:", error.message)
      const { data: gamesData, error: gamesError } = await supabase.from("games").select("*")
      if (gamesError) {
        console.error("Games fetch error:", gamesError)
        setIsLoading(false)
        return
      }

      // ユーザー情報の取得
      const userIds = Array.from(new Set(gamesData.map(g => g.user_id).filter(Boolean)))
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds)
        
        const profileMap: Record<string, { username: string }> = {}
        profilesData?.forEach(p => {
          profileMap[p.id] = p
        })

        const joined: Game[] = gamesData.map(g => ({
          ...g,
          profiles: profileMap[g.user_id] || { username: t("common.unknown_author") }
        }))
        setGames(joined)
      } else {
        setGames(gamesData as Game[])
      }
    } else {
      setGames(data as Game[] || [])
    }
  }

  // ── ログイン済みユーザーのデータ取得 ──────────────────────
  const loadUserData = async () => {
    const { data: authData } = await supabase.auth.getUser()
    const currentUser = authData?.user
    setUser(currentUser)
    if (!currentUser) return

    const [myGamesRes, favRes, profileRes] = await Promise.all([
      supabase.from("games").select("*").eq("user_id", currentUser.id),
      supabase.from("likes").select("game_id").eq("user_id", currentUser.id),
      supabase.from("profiles").select("*").eq("id", currentUser.id).single(),
    ])

    setMyGames(myGamesRes.data || [])
    setFavoriteIds(favRes.data?.map(f => f.game_id) || [])

    if (profileRes.data) {
      setProfile(profileRes.data)
      setEditName(profileRes.data.username || "")
      setEditBio(profileRes.data.bio || "")
    } else {
      // プロフィールがなければ作成
      await supabase.from("profiles").insert({ id: currentUser.id, username: t("common.unknown_author"), bio: "" })
      const { data: newProfile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()
      if (newProfile) {
        setProfile(newProfile)
        setEditName(newProfile.username || "")
        setEditBio(newProfile.bio || "")
      }
    }
  }

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await Promise.all([loadGames(), loadUserData()])
      setIsLoading(false)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── プロフィール更新 ────────────────────────────────────────
  const updateProfile = async () => {
    if (!user) return
    await supabase.from("profiles").update({ username: editName, bio: editBio }).eq("id", user.id)
    setIsEditing(false)
    setProfile(prev => prev ? { ...prev, username: editName, bio: editBio } : prev)
    alert(language === "ja" ? "更新しました" : "Profile updated")
  }

  // ── HTML更新（本人のみ）──────────────────────────────────────
  const updateGameHtml = async (gameId: string) => {
    if (!user) return
    await supabase.from("games").update({ html_code: editHtml }).eq("id", gameId).eq("user_id", user.id)
    alert(language === "ja" ? "HTMLを更新しました" : "HTML updated")
    setEditingGameId(null)
    const { data } = await supabase.from("games").select("*").eq("user_id", user.id)
    setMyGames(data as Game[] || [])
  }

  // ── ゲーム削除（本人のみ）────────────────────────────────────
  const deleteGame = async (gameId: string) => {
    if (!user) return
    const confirmMsg = language === "ja" 
      ? "このゲームを削除してもよろしいですか？（この操作は取り消せません）" 
      : "Are you sure you want to delete this game? (This cannot be undone)"
    if (!confirm(confirmMsg)) return

    const { error } = await supabase.from("games").delete().eq("id", gameId).eq("user_id", user.id)
    
    if (error) {
      console.error("Delete error:", error)
      alert(language === "ja" ? "削除に失敗しました" : "Failed to delete")
    } else {
      alert(language === "ja" ? "削除しました" : "Deleted successfully")
      // ステートを更新
      setGames(prev => prev.filter(g => g.id !== gameId))
      setMyGames(prev => prev.filter(g => g.id !== gameId))
    }
  }

  // ── フィルタ＆ソート ───────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...games]

    // 検索フィルタ
    if (q) {
      list = list.filter(g =>
        g.title.toLowerCase().includes(q.toLowerCase()) ||
        (g.profiles?.username || "").toLowerCase().includes(q.toLowerCase())
      )
    }

    if (tab === "favorites") {
      list = list.filter(g => favoriteIds.includes(g.id))
    }

    if (sort === "likes") {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    } else {
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    }

    return list
  }, [games, sort, tab, favoriteIds])

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* ソートチップ */}
        {(tab === "home" || tab === "favorites") && (
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setSort("new")}
              className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${sort === "new" ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)] border border-purple-500" : "bg-white/10 hover:bg-white/20 text-gray-300 border border-gray-700/50"}`}
            >
              {language === "ja" ? "新着順" : "Newest"}
            </button>
            <button
              onClick={() => setSort("likes")}
              className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${sort === "likes" ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)] border border-purple-500" : "bg-white/10 hover:bg-white/20 text-gray-300 border border-gray-700/50"}`}
            >
              {language === "ja" ? "人気順" : "Most Liked"}
            </button>
          </div>
        )}

        {/* ゲームグリッド */}
        {(tab === "home" || tab === "favorites") && (
          <div className={isLoading ? "w-full" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10"}>
            {isLoading ? (
              // AI読み込み中のスピナー
              <AILoadingSpinner />
            ) : (
              // 実際のゲームリスト
              filtered.map(game => (
                <GameCard key={game.id} game={game} />
              ))
            )}
          </div>
        )}

        {/* ゲームなし */}
        {!isLoading && (tab === "home" || tab === "favorites") && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-black/20 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
            <Gamepad2 className="w-16 h-16 mb-4 text-gray-600 opacity-50" />
            <h3 className="text-xl font-bold mb-2 text-purple-300">
              {language === "ja" ? "ゲームが見つかりません" : "No games found"}
            </h3>
            <p className="text-sm text-gray-400">
              {q ? (language === "ja" ? `"${q}" に一致する結果はありませんでした。` : `No results for "${q}".`) :
                tab === "favorites" ? (language === "ja" ? "お気に入りのゲームがまだありません。" : "No favorite games yet.") : 
                (language === "ja" ? "投稿されたゲームがまだありません。" : "No games uploaded yet.")}
            </p>
          </div>
        )}

        {/* プロフィールタブ */}
        {tab === "profile" && profile && (
          <div className="max-w-4xl mx-auto bg-black/50 backdrop-blur-lg rounded-2xl p-6 sm:p-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-purple-500/20 text-white">
            {!isEditing ? (
              <>
                <div className="flex items-start justify-between border-b border-gray-800/50 pb-8 mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-purple-900/40 text-purple-300 border border-purple-500/30 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner">
                      {profile.username?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-100 mb-2">{profile.username}</h2>
                      <p className="text-gray-400 whitespace-pre-wrap">
                        {profile.bio || (language === "ja" ? "自己紹介がまだありません。" : "No bio yet.")}
                      </p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors border border-gray-600/50"
                    onClick={() => setIsEditing(true)}
                  >
                    {language === "ja" ? "プロフィールを編集" : "Edit Profile"}
                  </button>
                </div>

                <h3 className="text-2xl font-bold text-gray-100 mb-6 drop-shadow-md flex items-center gap-2">
                  <Gamepad2 className="w-7 h-7 text-purple-400" /> 
                  {language === "ja" ? "自分の投稿" : "My Uploads"}
                </h3>

                {myGames.length === 0 && (
                  <div className="bg-black/30 rounded-xl p-8 text-center text-gray-400 border border-gray-800/50">
                    {language === "ja" 
                      ? "まだ投稿がありません。右上の「投稿する」から新しいゲームを作ってみましょう！" 
                      : "No uploads yet. Create your first game from 'Upload'!"}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myGames.map(game => (
                    <div key={game.id} className="bg-black/30 border text-left border-gray-800/50 rounded-xl p-5 hover:border-purple-500/50 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-gray-100">{game.title}</h4>
                        <span className="bg-white/10 text-gray-300 text-xs px-2 py-1 rounded-md font-medium border border-gray-700/50">ID: {game.id.split('-')[0]}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-5">
                        <span>👀 {game.views || 0}</span>
                        <span>❤️ {game.likes || 0}</span>
                      </div>

                      {editingGameId === game.id ? (
                        <div className="mt-4 border-t border-gray-800/50 pt-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                             {language === "ja" ? "HTMLコードの編集" : "Edit HTML Code"}
                          </label>
                          <textarea
                            className="w-full h-48 p-3 bg-black/50 border border-gray-700/50 text-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            value={editHtml}
                            onChange={(e) => setEditHtml(e.target.value)}
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                               className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                               onClick={() => updateGameHtml(game.id)}
                             >
                               {t("common.confirm")}
                             </button>
                             <button
                               className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-200 font-medium rounded-lg transition-colors border border-gray-600/50"
                               onClick={() => setEditingGameId(null)}
                             >
                               {t("common.cancel")}
                             </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            className="flex-1 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            onClick={() => { setEditingGameId(game.id); setEditHtml(game.html_code) }}
                          >
                            ✏️ {language === "ja" ? "HTML編集" : "Edit HTML"}
                          </button>
                          <button
                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-lg transition-colors border border-gray-700/50 flex items-center justify-center gap-2"
                            onClick={() => router.push(`/game/${game.id}`)}
                          >
                            ▶️ {t("game.play")}
                          </button>
                          <button
                            className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-medium rounded-lg transition-colors border border-red-800/50 flex items-center justify-center"
                            onClick={() => deleteGame(game.id)}
                            title={t("common.delete")}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-xl mx-auto py-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-100">
                  {language === "ja" ? "プロフィール編集" : "Edit Profile"}
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {language === "ja" ? "ユーザー名" : "Username"}
                    </label>
                    <input
                      className="w-full px-4 py-2 bg-black/40 border border-gray-700/50 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {language === "ja" ? "自己紹介" : "Bio"}
                    </label>
                    <textarea
                      className="w-full px-4 py-2 h-32 bg-black/40 border border-gray-700/50 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_10px_purple] font-medium rounded-lg transition-colors"
                      onClick={updateProfile}
                    >
                      {t("common.confirm")}
                    </button>
                    <button
                      className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 font-medium rounded-lg transition-colors border border-gray-600/50"
                      onClick={() => setIsEditing(false)}
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* プロフィール未ログイン */}
        {tab === "profile" && !user && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-black/20 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
            <Lock className="w-16 h-16 mb-4 text-gray-600 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-purple-300">
              {language === "ja" ? "ログインが必要です" : "Login Required"}
            </h3>
            <p>
              {language === "ja" ? "プロフィールを見るにはログインしてください。" : "Please login to view your profile."}
            </p>
          </div>
        )}

      </div>
    </>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}