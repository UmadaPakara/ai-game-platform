"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Music, Music2, Sparkles } from "lucide-react"

/**
 * サイト全体のBGMを管理するコンポーネント
 * Web Audio API を使用して「ゲームっぽい」メロディアスな音をプロシージャルに生成します
 */
export default function BGMPlayer() {
  const pathname = usePathname()
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<any[]>([])
  const schedulerRef = useRef<number | null>(null)
  
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
    masterGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2) 
    masterGain.connect(ctx.destination)
    masterGainRef.current = masterGain

    // 1. パッド（背景音）
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400, ctx.currentTime)
    filter.connect(masterGain)

    const freqs = [110, 164.81] // A2, E3
    freqs.forEach(f => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, ctx.currentTime)
      osc.connect(filter)
      osc.start()
      oscillatorsRef.current.push(osc)
    })

    // 2. アルペジエイター（メロディ）
    const playNote = (freq: number, time: number, duration: number) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      
      osc.type = 'triangle' // 少しゲームっぽい柔らかな音
      osc.frequency.setValueAtTime(freq, time)
      
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(0.1, time + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, time + duration)
      
      osc.connect(g)
      g.connect(masterGain)
      
      osc.start(time)
      osc.stop(time + duration)
    }

    const melody = [440, 523.25, 659.25, 783.99] // A4, C5, E5, G5
    let noteIdx = 0
    let nextNoteTime = ctx.currentTime

    const scheduler = () => {
      while (nextNoteTime < ctx.currentTime + 0.1) {
        playNote(melody[noteIdx % melody.length], nextNoteTime, 0.25)
        noteIdx++
        nextNoteTime += 0.25 // 16分音符的なスピード
      }
      schedulerRef.current = requestAnimationFrame(scheduler)
    }
    scheduler()
  }

  // BGMの停止
  const stopSynthesizer = () => {
    const ctx = audioCtxRef.current
    const masterGain = masterGainRef.current
    if (ctx && masterGain) {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      if (schedulerRef.current) cancelAnimationFrame(schedulerRef.current)
      setTimeout(() => {
        oscillatorsRef.current.forEach(osc => { try { osc.stop() } catch(e) {} })
        oscillatorsRef.current = []
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
      <div className={`px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-[11px] font-bold text-white/90 transition-all duration-700 shadow-2xl flex items-center gap-3 transform ${isMuted || isGamePage ? 'translate-x-10 opacity-0' : 'translate-x-0 opacity-100'}`}>
        <div className="flex gap-[2px] items-end h-3">
          <div className="w-1 bg-purple-400 animate-[music-bar_0.5s_infinite_ease-in-out]" style={{ animationDelay: '0s' }} />
          <div className="w-1 bg-purple-400 animate-[music-bar_0.5s_infinite_ease-in-out]" style={{ animationDelay: '0.1s' }} />
          <div className="w-1 bg-purple-400 animate-[music-bar_0.5s_infinite_ease-in-out]" style={{ animationDelay: '0.2s' }} />
        </div>
        <span className="tracking-wider">GAME BGM ON</span>
      </div>

      <button
        onClick={toggleMute}
        disabled={isGamePage}
        className={`pointer-events-auto p-4 rounded-2xl shadow-2xl transition-all duration-500 border backdrop-blur-xl group flex items-center justify-center ${
          isGamePage 
            ? 'bg-gray-900/40 border-white/5 text-gray-600 scale-90' 
            : isMuted 
              ? 'bg-black/60 border-white/10 text-white/30 hover:text-white/70' 
              : 'bg-gradient-to-br from-indigo-600 to-purple-600 border-white/20 text-white shadow-[0_10px_40px_rgba(139,92,246,0.4)] hover:scale-110'
        }`}
      >
        {isMuted || isGamePage ? <Music2 className="w-6 h-6 outline-none" /> : <Music className="w-6 h-6 animate-pulse" />}
      </button>

      <style jsx global>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
      `}</style>
    </div>
  )
}
