"use client"

import { useLanguage } from "@/lib/i18n/LanguageContext"
import { Globe, Lightbulb, Code, UploadCloud, Rocket, Info, MessageSquareCode } from "lucide-react"

export default function AboutPage() {
  const { language } = useLanguage()

  const isJa = language === "ja"

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-purple-900/40 rounded-full border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <Info className="w-12 h-12 text-purple-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-100 drop-shadow-md">
          {isJa ? "プラットフォームガイド" : "Platform Guide"}
        </h1>
        <p className="text-lg text-gray-400">
          {isJa ? "AIゲームプラットフォームについて" : "About the AI Game Platform"}
        </p>
      </div>

      {/* Overview */}
      <section className="bg-black/40 p-8 rounded-2xl border border-gray-800/50 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Globe className="w-32 h-32 text-purple-400" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            {isJa ? "概要説明" : "Platform Overview"}
          </h2>
          <p className="text-gray-300 leading-relaxed">
            {isJa
              ? "このプラットフォームは、AIを使って誰でも簡単にブラウザゲームを作成・共有し、世界中のプレイヤーと遊べる最先端のゲームポータルです。プログラミングの経験は一切不要。あなたの想像力とAIの力だけで、今すぐゲーム開発者になることができます。"
              : "This platform is a cutting-edge game portal where anyone can easily create, share, and play browser games using AI. No coding experience is required. With just your imagination and the power of AI, you can become a game developer right now."}
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-black/40 p-8 rounded-2xl border border-gray-800/50 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Lightbulb className="w-32 h-32 text-yellow-500" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            {isJa ? "理念" : "Our Philosophy"}
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg font-medium text-purple-200/90 mb-4 border-l-4 border-purple-500 pl-4">
            {isJa ? "「遊ぶ人」と「創る人」の境界線をなくす" : "Erasing the boundary between 'Player' and 'Creator'"}
          </p>
          <p className="text-gray-400 leading-relaxed">
            {isJa
              ? "私たちは、ゲーム開発のハードルを極限まで下げることを目指しています。複雑なコードやツールの使い分けの代わりに、自然言語（あなたの言葉）を使ってアイデアを形にする。誰もが自分の思い描いた世界を瞬時にプレイアブルなゲームとして表現し、それを共有できるオープンなクリエイティブ空間を提供します。"
              : "We aim to lower the hurdles of game development to the absolute minimum. Instead of wrestling with complex code and tools, you shape your ideas using natural language. We provide an open creative space where anyone can instantly turn their imagined worlds into playable games and share them with the world."}
          </p>
        </div>
      </section>

      {/* How to Post Tutorial */}
      <section className="bg-gradient-to-b from-purple-900/10 to-black/40 p-8 rounded-2xl border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] backdrop-blur-md">
        <h2 className="text-2xl font-bold text-gray-100 mb-8 flex items-center gap-3 justify-center">
          <Rocket className="w-7 h-7 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
          {isJa ? "ゲーム投稿の仕方" : "How to Upload a Game"}
        </h2>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/50 text-purple-300 font-bold text-xl shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-100 mb-2 flex items-center gap-2">
                <MessageSquareCode className="w-5 h-5 text-blue-400" />
                {isJa ? "AIにゲームを作ってもらう" : "Let AI build your game"}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {isJa 
                  ? "ChatGPTやGeminiを開き、プロンプトを入力します。「HTML, CSS, JavaScriptを1つのファイルにまとめた、ブラウザで遊べるアクションゲームを作って。UIはモダンにして」のように具体的にお願いしてみましょう。"
                  : "Open ChatGPT or Gemini and type your prompt. Be specific, like: 'Create a playable action browser game in a single file combining HTML, CSS, and JS. Make the UI modern.'"}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/50 text-purple-300 font-bold text-xl shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-100 mb-2 flex items-center gap-2">
                <Code className="w-5 h-5 text-green-400" />
                {isJa ? "AIが書いたコードをコピー" : "Copy the generated code"}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {isJa
                  ? "AIが生成したコードブロックの右上にある「コピー」ボタンをクリックして、コード全体をクリップボードにコピーします。"
                  : "Click the 'Copy' button on the top right of the code block generated by the AI to copy the entire HTML code to your clipboard."}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/50 text-purple-300 font-bold text-xl shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-100 mb-2 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                {isJa ? "投稿ページでアップロード" : "Upload it on the site"}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {isJa
                  ? "当サイトのサイドバーの「投稿する」からアップロード画面へ進みます。ゲームのタイトルを決め、先ほどコピーしたHTMLコードを所定のテキストエリアに貼り付けます。（お好みでサムネイル画像も設定できます）"
                  : "Navigate to the 'Upload' page from the sidebar. Enter a title for your game, and paste the copied HTML code into the designated text area. You can also optionally upload a thumbnail image."}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6 items-start border-t border-purple-500/20 pt-8 mt-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(168,85,247,0.8)]">
              4
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-200 mb-2">
                {isJa ? "世界中に公開完！" : "Published to the World!"}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {isJa
                  ? "「ゲームを投稿」ボタンを押せば完了です。新着一覧にあなたのゲームが表示され、誰もがブラウザから即座にプレイできるようになります。たくさん遊ばれてランキング上位を目指しましょう！"
                  : "Click the 'Submit' button and you're done! Your game will appear on the 'Newest' list, ready to be played instantly from the browser by anyone. Climb the rankings and have fun!"}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
