"use client"
 
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import html2canvas from "html2canvas"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { User } from "@supabase/supabase-js"
 
export default function Upload() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { language, t } = useLanguage()
 
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [htmlCode, setHtmlCode] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
 
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    fetchUser()
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
          views: 0
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
 
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🎮</span>
          <h1 className="text-2xl font-bold text-gray-900">{t("upload.title")}</h1>
        </div>
 
        <div className="flex flex-col lg:flex-row gap-8">
 
          {/* 左：投稿フォーム */}
          <div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("upload.game_title")} <span className="text-red-500">*</span></label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                placeholder={language === "ja" ? "例：スライムシューティング" : "e.g. Slime Shooting"}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("upload.description")}</label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[120px] resize-y placeholder-gray-400"
                placeholder={language === "ja" ? "操作方法やゲームの魅力を書いてください" : "How to play, features, etc."}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("upload.html_code")} <span className="text-red-500">*</span></label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[160px] font-mono text-sm resize-y"
                placeholder="<!DOCTYPE html>..."
                value={htmlCode}
                onChange={e => setHtmlCode(e.target.value)}
              />
            </div>
 
            {/* サムネイル選択・プレビュー */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("upload.thumbnail")}</label>
 
                {/* プレビュー表示 */}
                {file && (
                  <div className="mb-4 relative group">
                    <div className="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                      <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
 
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => (document.getElementById('file-upload') as HTMLInputElement)?.click()}>
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500">
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
 
            <div className="pt-4 mt-2 border-t border-gray-100">
              <button
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
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
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
              <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <span>🤖</span> {t("upload.ai_help")}
              </h2>
              <p className="text-sm text-indigo-800/80 mb-6 leading-relaxed">
                {t("upload.ai_links")}
              </p>
              <a
                href="https://chat.openai.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-sm border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A6.0651 6.0651 0 0 0 19.02 19.818a5.9847 5.9847 0 0 0 3.9977-2.9001 6.0462 6.0462 0 0 0-.7358-7.0968z" />
                </svg>
                {t("upload.subtitle")} {language === "ja" ? "ChatGPTを開く" : "Open ChatGPT"}
              </a>
              <a
                href="https://gemini.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-blue-600 font-bold rounded-xl shadow-sm border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <img src="https://www.gstatic.com/lamda/images/favicon_v1_150160d13996594b2931.png" className="w-5 h-5" alt="Gemini" />
                {language === "ja" ? "Geminiを開く" : "Open Gemini"}
              </a>
            </div>
          </div>
 
        </div>
      </div>
    </>
  )
}