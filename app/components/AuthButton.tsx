"use client"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href }
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <img src={user.user_metadata.avatar_url} width="35" style={{ borderRadius: "50%" }} />
        <span>{user.user_metadata.name}</span>
        <button style={{ background:"#ff4d6d",color:"white",border:"none",padding:"6px 10px",borderRadius:"6px" }} onClick={logout}>
          ログアウト
        </button>
      </div>
    )
  }

  return (
    <button
      style={{ background:"#4f46e5",color:"white",border:"none",padding:"10px 15px",borderRadius:"8px",marginBottom:"20px" }}
      onClick={login}
    >
      🔐 Googleでログイン
    </button>
  )
}