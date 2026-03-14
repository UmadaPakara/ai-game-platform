"use client"
 
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import html2canvas from "html2canvas"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { User } from "@supabase/supabase-js"
import { Gamepad2, GitFork, Sparkles } from "lucide-react"
 
export default function Upload() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { language, t } = useLanguage()
 
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [htmlCode, setHtmlCode] = useState<string>("")
  const [prompt, setPrompt] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [forkedFrom, setForkedFrom] = useState<string | null>(null)
 
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    fetchUser()

    // Fork handling: pre-fill from existing game
    const forkId = searchParams.get("fork_id")
    if (forkId) {
      setForkedFrom(forkId)
      const fetchOriginal = async () => {
        const { data } = await supabase.from("games").select("title, description, html_code").eq("id", forkId).single()
        if (data) {
          setTitle((language === "ja" ? "【改造】" : "[Remix] ") + data.title)
          setDescription(data.description || "")
          setHtmlCode(data.html_code)
        }
      }
      fetchOriginal()
    }
  }, [])
 
  // 🔹 画像リサイズユーティリティ
  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const targetW = 1280;
          const targetH = 720;
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
 
          // アスペクト比を維持しながらカバー（中央切り抜き）
          const imgRatio = img.width / img.height;
          const targetRatio = targetW / targetH;
          let drawW: number, drawH: number, offsetX: number, offsetY: number;
 
          if (imgRatio > targetRatio) {
            drawH = targetH;
            drawW = targetH * imgRatio;
            offsetX = (targetW - drawW) / 2;
            offsetY = 0;
          } else {
            drawW = targetW;
            drawH = targetW / imgRatio;
            offsetX = 0;
            offsetY = (targetH - drawH) / 2;
          }
 
          ctx.fillStyle = "#FFFFFF"; // 背景を白で埋める
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
 
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
              resolve(resizedFile);
            }
          }, "image/jpeg", 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };
 
  const handleUpload = async () => {
    if (!user) {
      alert(t("common.login"))
      return
    }
 
    if (!title || !htmlCode) {
      alert(language === "ja" ? "タイトルとHTMLコードは必須です" : "Title and HTML code are required")
      return
    }
 
    try {
      setLoading(true)
 
      let thumbnailUrl: string | null = null
 
      // 🔹 サムネアップロード
      if (file) {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        console.log("Uploading safe filename:", fileName)
 
        const { error: uploadError } = await supabase.storage
          .from("thumbnails")
          .upload(fileName, file)
 
        if (uploadError) throw uploadError
 
        const { data: urlData } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(fileName)
 
        if (!urlData?.publicUrl) {
          const errorMsg = language === "ja" ? "サムネイルのURL取得に失敗しました。" : "Failed to get thumbnail URL"
          throw new Error(errorMsg)
        }
        thumbnailUrl = urlData.publicUrl
        console.log("Upload Success. Thumbnail URL:", thumbnailUrl)
      }
 
      // 🔹 プロフィールの存在確認
      const { data: profile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      
      if (checkError) {
        console.warn("Profile check error:", checkError.message);
      }
 
      if (!profile) {
        console.log("Profile not found, creating one...");
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({ id: user.id, username: user.email?.split('@')[0] || t("common.unknown_author"), bio: "" });
        
        if (profileError) {
          console.error("Profile creation error:", profileError.message);
        }
      }
 
      // 🔹 ゲーム投稿（user_id付き）
      const { error: insertError } = await supabase.from("games").insert([
        {
          title,
          description,
          html_code: htmlCode,
          thumbnail: thumbnailUrl,
          user_id: user.id,
          likes: 0,
          views: 0,
          prompt: prompt || null
        }
      ])
 
      if (insertError) throw insertError
 
      alert(t("upload.success"))
      router.push("/")
    } catch (err: any) {
      console.error("HandleUpload Error:", err)
      const failMsg = t("upload.failed")
      alert(`${failMsg}: ${err.message || "内部エラーが発生しました"}`)
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
 
        <div className="flex items-center gap-4 mb-8 bg-black/40 p-5 w-fit rounded-2xl border border-gray-800/50 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <Gamepad2 className="w-8 h-8 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          <h1 className="text-3xl font-bold text-gray-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">{t("upload.title")}</h1>
        </div>

        {/* Fork Banner */}
        {forkedFrom && (
          <div className="mb-6 flex items-center gap-3 bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-purple-200">
            <GitFork className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">{t("upload.forked_from")}</span>
          </div>
        )}
 
        <div className="flex flex-col lg:flex-row gap-8">
 
          {/* 左：投稿フォーム */}
          <div className="flex-1 bg-black/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-gray-800/50 flex flex-col gap-6">
 
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t("upload.game_title")} <span className="text-red-400">*</span></label>
              <input
                className="w-full px-4 py-3 bg-black/50 border border-gray-700/50 text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-gray-500"
                placeholder={language === "ja" ? "例：スライムシューティング" : "e.g. Slime Shooting"}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
 
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t("upload.description")}</label>
              <textarea
                className="w-full px-4 py-3 bg-black/50 border border-gray-700/50 text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all min-h-[120px] resize-y placeholder-gray-500"
                placeholder={language === "ja" ? "操作方法やゲームの魅力を書いてください" : "How to play, features, etc."}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* AIプロンプトフィールド */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                {t("upload.prompt")}
              </label>
              <textarea
                className="w-full px-4 py-3 bg-black/50 border border-gray-700/50 text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all min-h-[100px] resize-y placeholder-gray-500 text-sm"
                placeholder={t("upload.prompt_placeholder")}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">{language === "ja" ? "※ 公開されます。他のユーザーの参考になります。" : "* This will be public. Helps other creators learn."}</p>
            </div>
 
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t("upload.html_code")} <span className="text-red-400">*</span></label>
              <textarea
                className="w-full px-4 py-3 bg-black/50 border border-gray-700/50 text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all min-h-[160px] font-mono text-sm resize-y placeholder-gray-500"
                placeholder="<!DOCTYPE html>..."
                value={htmlCode}
                onChange={e => setHtmlCode(e.target.value)}
              />
            </div>
 
            {/* サムネイル選択・プレビュー */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t("upload.thumbnail")}</label>
 
                {/* プレビュー表示 */}
                {file && (
                  <div className="mb-4 relative group">
                    <div className="w-full aspect-video bg-black/30 rounded-xl overflow-hidden border border-gray-700/50">
                      <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
 
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700/50 border-dashed rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => (document.getElementById('file-upload') as HTMLInputElement)?.click()}>
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-400 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-purple-400 hover:text-purple-300">
                        <span>{language === "ja" ? "ファイルを選択またはドラッグ＆ドロップ" : "Select file or Drag & Drop"}</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={async (e) => {
                            const selectedFile = e.target.files?.[0];
                            if (selectedFile) {
                              setLoading(true);
                              try {
                                const resizedFile = await resizeImage(selectedFile);
                                setFile(resizedFile);
                              } catch (err) {
                                console.error("Resize Error:", err);
                                alert(language === "ja" ? "画像の処理に失敗しました。" : "Failed to process image.");
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">{t("upload.thumbnail_hint")}</p>
                  </div>
                </div>
              </div>
 
            <div className="pt-4 mt-2 border-t border-gray-700/50">
              <button
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:bg-gray-700 disabled:cursor-not-allowed disabled:shadow-none transition-all transform hover:-translate-y-0.5"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("upload.submitting")}
                  </span>
                ) : t("upload.submit")}
              </button>
            </div>
          </div>
 
          {/* 右：AIリンク */}
          <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
            <div className="bg-black/40 p-6 rounded-2xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] backdrop-blur-md">
              <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
                <span className="text-xl">🤖</span> {t("upload.ai_help")}
              </h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                {t("upload.ai_links")}
              </p>
              <div className="space-y-3">
                <a
                  href="https://chat.openai.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 text-gray-200 font-bold rounded-xl shadow-sm border border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-600/20 hover:text-white transition-all shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                >
                  <svg className="w-5 h-5 text-current" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A6.0651 6.0651 0 0 0 19.02 19.818a5.9847 5.9847 0 0 0 3.9977-2.9001 6.0462 6.0462 0 0 0-.7358-7.0968z" />
                  </svg>
                  {language === "ja" ? "ChatGPTを開く" : "Open ChatGPT"}
                </a>
                <a
                  href="https://gemini.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 text-gray-200 font-bold rounded-xl shadow-sm border border-gray-700/50 hover:border-blue-500/50 hover:bg-blue-600/20 hover:text-white transition-all shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                >
                  <img src="https://www.gstatic.com/lamda/images/favicon_v1_150160d13996594b2931.png" className="w-5 h-5" alt="Gemini" />
                  {language === "ja" ? "Geminiを開く" : "Open Gemini"}
                </a>
              </div>
            </div>
          </div>
 
        </div>
      </div>
    </>
  )
}