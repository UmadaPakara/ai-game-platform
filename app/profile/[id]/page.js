"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"

export default function Profile() {
  const { id } = useParams()
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [games, setGames] = useState([])
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [user, setUser] = useState(null)

  const fetchUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data?.user)
  }, [])

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()

    setProfile(data)
  }, [id])

  const fetchGames = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })

    setGames(data || [])
  }, [id])

  const fetchFollowData = useCallback(async () => {
    if (!id) return;
    const { count: followerCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", id)

    const { count: followingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", id)

    setFollowers(followerCount || 0)
    setFollowing(followingCount || 0)
  }, [id])

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile()
    fetchGames()
    fetchFollowData()
    fetchUser()
  }, [id, fetchProfile, fetchGames, fetchFollowData, fetchUser])

  const toggleFollow = async () => {
    if (!user) return

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", id)

      setIsFollowing(false)
    } else {
      await supabase
        .from("follows")
        .insert({
          follower_id: user.id,
          following_id: id
        })

      setIsFollowing(true)
    }

    fetchFollowData()
  }

  if (!profile) return (
    <div className="flex justify-center items-center min-h-[50vh] text-gray-500">
      Loading...
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">

      {/* 👤 Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">

        <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border-4 border-indigo-50 shadow-sm flex items-center justify-center">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="アバター" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold rounded-full bg-indigo-100 text-indigo-600 w-full h-full flex items-center justify-center">
              {profile.username?.charAt(0) || "U"}
            </span>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.username}</h2>
          <p className="text-gray-600 mb-4 whitespace-pre-wrap">{profile.bio || "自己紹介がありません。"}</p>

          <div className="flex items-center justify-center sm:justify-start gap-6 text-sm font-medium text-gray-700 mb-6">
            <span className="flex flex-col items-center sm:items-start">
              <span className="text-xl font-bold text-gray-900">{followers}</span> フォロワー
            </span>
            <span className="flex flex-col items-center sm:items-start">
              <span className="text-xl font-bold text-gray-900">{following}</span> フォロー中
            </span>
          </div>

          {user && user.id !== id && (
            <button
              onClick={toggleFollow}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-sm ${isFollowing
                ? "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
            >
              {isFollowing ? "フォロー解除" : "フォローする"}
            </button>
          )}
        </div>
      </div>

      {/* 🎮 Games Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          ゲーマーの投稿 <span className="text-gray-400 font-medium text-lg">({games.length})</span>
        </h3>

        {games.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
            まだ投稿がありません。
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map(game => (
              <div
                key={game.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col"
                onClick={() => router.push(`/game/${game.id}`)}
              >
                <div className="aspect-video bg-gray-100 w-full overflow-hidden relative">
                  {game.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                    {game.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">👀 {game.views || 0}</span>
                    <span className="flex items-center gap-1">❤️ {game.likes || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}