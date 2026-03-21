"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Music, Music2, Sparkles } from "lucide-react"

/**
 * サイト全体のBGMを管理するコンポーネント
 * Web Audio API を使用して「AIっぽい」アンビエント音をプロシージャルに生成します
 */
export default function BGMPlayer() {
  const pathname = usePathname()
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  
  const [isMuted, setIsMuted] = useState(true)
  const [isGamePage, setIsGamePage] = useState(false)

  // プロシージャルBGMの開始
  const startSynthesizer = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // マスターゲイン設定 (フェードイン用)
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0, ctx.currentTime)
    masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2) // かなり控えめな音量
    masterGain.connect(ctx.destination)
    masterGainRef.current = masterGain

    // フィルター (こもった感じの音にする)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400, ctx.currentTime)
    filter.connect(masterGain)

    // フィルターの動き（うねり）を作るLFO
    const lfo = ctx.createOscillator()
    lfo.frequency.setValueAtTime(0.05, ctx.currentTime)
    const lfoGain = ctx.createGain()
    lfoGain.gain.setValueAtTime(200, ctx.currentTime)
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()
    oscillatorsRef.current.push(lfo)

    // 3つの低音オシレーターを重ねて和音（パッド）を作る
    const freqs = [110, 138.59, 164.81] // A2, C#3, E3 (A Major)
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, ctx.currentTime)
      
      // わずかな音程の揺れ（デチューン）
      const detuneOsc = ctx.createOscillator()
      detuneOsc.frequency.setValueAtTime(0.1 + i * 0.05, ctx.currentTime)
      const detuneGain = ctx.createGain()
      detuneGain.gain.setValueAtTime(5, ctx.currentTime)
      detuneOsc.connect(detuneGain)
      detuneGain.connect(osc.detune)
      detuneOsc.start()
      oscillatorsRef.current.push(detuneOsc)

      osc.connect(filter)
      osc.start()
      oscillatorsRef.current.push(osc)
    })
  }

  // BGMの停止（フェードアウト）
  const stopSynthesizer = () => {
    const ctx = audioCtxRef.current
    const masterGain = masterGainRef.current
    if (ctx && masterGain) {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      setTimeout(() => {
        oscillatorsRef.current.forEach(osc => {
            try { osc.stop() } catch(e) {}
        })
        oscillatorsRef.current = []
        if (audioCtxRef.current?.state !== 'closed') {
           // 完全に閉じるのではなく、次の再生のためにリセットに近い形に
        }
      }, 600)
    }
  }

  useEffect(() => {
    const isGame = pathname.startsWith("/game/")
    setIsGamePage(isGame)

    if (isGame) {
      stopSynthesizer()
    } else if (!isMuted) {
      startSynthesizer()
    }

    return () => {
      // クリーンアップ
    }
  }, [pathname, isMuted])

  const toggleMute = () => {
    if (isMuted) {
      startSynthesizer()
      setIsMuted(false)
    } else {
      stopSynthesizer()
      setIsMuted(true)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 pointer-events-none">
      <div className={`px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-[11px] font-bold text-white/90 transition-all duration-700 shadow-2xl flex items-center gap-2 transform ${isMuted || isGamePage ? 'translate-x-10 opacity-0' : 'translate-x-0 opacity-100'}`}>
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span>AI Generated Ambient</span>
      </div>

      <button
        onClick={toggleMute}
        disabled={isGamePage}
        className={`pointer-events-auto p-3.5 rounded-2xl shadow-2xl transition-all duration-500 border backdrop-blur-xl group flex items-center justify-center ${
          isGamePage 
            ? 'bg-gray-900/40 border-white/5 text-gray-600 cursor-not-allowed scale-90' 
            : isMuted 
              ? 'bg-black/60 border-white/10 text-white/30 hover:text-white/70 hover:bg-black/80 hover:border-white/20' 
              : 'bg-indigo-600/80 border-indigo-400/40 text-white shadow-[0_10px_30px_rgba(79,70,229,0.5)] hover:scale-110 active:scale-95'
        }`}
        title={isGamePage ? "Game playing" : isMuted ? "Start AI BGM" : "Stop AI BGM"}
      >
        {isMuted || isGamePage ? (
          <Music2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
        ) : (
          <Music className="w-5 h-5 animate-pulse" />
        )}
      </button>
    </div>
  )
}
