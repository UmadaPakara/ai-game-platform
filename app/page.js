"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import GameCard from "./components/GameCard"

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "home"

  const [games, setGames] = useState([])
  const [myGames, setMyGames] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])
  const [sort, setSort] = useState("new")
  const [isLoading, setIsLoading] = useState(true)

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const [editingGameId, setEditingGameId] = useState(null)
  const [editHtml, setEditHtml] = useState("")

  const q = searchParams.get("q") || ""

  // ── ゲーム一覧取得（ログイン不要）──────────────────────────
  const loadGames = async () => {
    // profilesとの結合を試みる（リレーションがあれば取得可能）
    const { data, error } = await supabase
      .from("games")
      .select("*, profiles(username)")

    if (error) {
      console.warn("Join with profiles failed, falling back to simple select:", error.message)
      const { data: simpleData } = await supabase.from("games").select("*")
      setGames(simpleData || [])
    } else {
      setGames(data || [])
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
      await supabase.from("profiles").insert({ id: currentUser.id, username: "ユーザー", bio: "" })
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
    alert("更新しました")
  }

  // ── HTML更新（本人のみ）──────────────────────────────────────
  const updateGameHtml = async (gameId) => {
    if (!user) return
    await supabase.from("games").update({ html_code: editHtml }).eq("id", gameId).eq("user_id", user.id)
    alert("HTMLを更新しました")
    setEditingGameId(null)
    const { data } = await supabase.from("games").select("*").eq("user_id", user.id)
    setMyGames(data || [])
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
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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
              className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${sort === "new" ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
            >
              新着順
            </button>
            <button
              onClick={() => setSort("likes")}
              className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${sort === "likes" ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
            >
              人気順
            </button>
          </div>
        )}

        {/* ゲームグリッド */}
        {(tab === "home" || tab === "favorites") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
            {isLoading ? (
              // 読み込み中のスケルトン
              Array.from({ length: 8 }).map((_, i) => (
                <GameCard key={i} isLoading={true} />
              ))
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
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="text-6xl mb-4 grayscale opacity-20">🎮</div>
            <h3 className="text-xl font-bold mb-2 text-gray-600">ゲームが見つかりません</h3>
            <p className="text-sm">
              {q ? `"${q}" に一致する結果はありませんでした。` :
                tab === "favorites" ? "お気に入りのゲームがまだありません。" : "投稿されたゲームがまだありません。"}
            </p>
          </div>
        )}

        {/* プロフィールタブ */}
        {tab === "profile" && profile && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100">
            {!isEditing ? (
              <>
                <div className="flex items-start justify-between border-b border-gray-100 pb-8 mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold">
                      {profile.username?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.username}</h2>
                      <p className="text-gray-600 whitespace-pre-wrap">{profile.bio || "自己紹介がまだありません。"}</p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-lg transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    プロフィールを編集
                  </button>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-6">🎮 自分の投稿</h3>

                {myGames.length === 0 && (
                  <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 border border-gray-100">
                    まだ投稿がありません。<br />右上の「投稿する」から新しいゲームを作ってみましょう！
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myGames.map(game => (
                    <div key={game.id} className="bg-white border text-left border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-gray-900">{game.title}</h4>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">ID: {game.id.split('-')[0]}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
                        <span>👀 {game.views || 0}</span>
                        <span>❤️ {game.likes || 0}</span>
                      </div>

                      {editingGameId === game.id ? (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">HTMLコードの編集</label>
                          <textarea
                            className="w-full h-48 p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={editHtml}
                            onChange={(e) => setEditHtml(e.target.value)}
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                              onClick={() => updateGameHtml(game.id)}
                            >
                              保存する
                            </button>
                            <button
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                              onClick={() => setEditingGameId(null)}
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            onClick={() => { setEditingGameId(game.id); setEditHtml(game.html_code) }}
                          >
                            ✏️ HTML編集
                          </button>
                          <button
                            className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-2"
                            onClick={() => router.push(`/game/${game.id}`)}
                          >
                            ▶️ プレイ
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-xl mx-auto py-8">
                <h2 className="text-2xl font-bold mb-6">プロフィール編集</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー名</label>
                    <input
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
                    <textarea
                      className="w-full px-4 py-2 h-32 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                      onClick={updateProfile}
                    >
                      保存する
                    </button>
                    <button
                      className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                      onClick={() => setIsEditing(false)}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* プロフィール未ログイン */}
        {tab === "profile" && !user && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">ログインが必要です</h3>
            <p>プロフィールを見るにはログインしてください。</p>
          </div>
        )}

      </div>
    </>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">読み込み中...</div>}>
      <HomeContent />
    </Suspense>
  )
}