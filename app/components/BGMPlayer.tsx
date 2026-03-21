"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Music, Music2, Sparkles } from "lucide-react"

/**
 * サイト全体のBGMを管理するコンポーネント
 * Web Audio API を使用して「明るくポップ」なゲームBGMを生成します
 */
export default function BGMPlayer() {
  const pathname = usePathname()
  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<any[]>([])
  const schedulerRef = useRef<number | null>(null)
  
  const [isMuted, setIsMuted] = useState(false) // デフォルトでONに設定
  const [isGamePage, setIsGamePage] = useState(false)

  // プロシージャルBGMの開始
  const startSynthesizer = () => {
    if (oscillatorsRef.current.length > 0) return // 既に再生中なら何もしない

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // マスターゲイン設定
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0, ctx.currentTime)
    masterGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1) 
    masterGain.connect(ctx.destination)
    masterGainRef.current = masterGain

    // ... (rest of the synthesizer logic remains the same)
    // 1. ノイズによるリズム（ハイハット風）
    const bufferSize = ctx.sampleRate * 0.05
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }

    const playHihat = (time: number) => {
      if (!masterGainRef.current) return
      const source = ctx.createBufferSource()
      source.buffer = noiseBuffer
      const highpass = ctx.createBiquadFilter()
      highpass.type = 'highpass'
      highpass.frequency.setValueAtTime(7000, time)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.04, time)
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.03)
      source.connect(highpass)
      highpass.connect(g)
      g.connect(masterGainRef.current)
      source.start(time)
    }

    // 2. メロディとベース
    const playNote = (freq: number, time: number, duration: number, type: OscillatorType = 'square', vol = 0.08) => {
      if (!masterGainRef.current) return
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, time)
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(vol, time + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, time + duration)
      osc.connect(g)
      g.connect(masterGainRef.current)
      osc.start(time)
      osc.stop(time + duration)
      oscillatorsRef.current.push(osc)
    }

    const bpm = 128
    const step = 60 / bpm / 2 // 8分音符
    const melody = [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33] 
    const bass = [130.81, 196.00, 146.83, 220.00] 
    
    let noteIdx = 0
    let nextNoteTime = ctx.currentTime

    const scheduler = () => {
      if (!masterGainRef.current) return
      while (nextNoteTime < ctx.currentTime + 0.1) {
        if (noteIdx % 2 === 0) playNote(melody[Math.floor(noteIdx / 2) % melody.length], nextNoteTime, 0.1, 'square', 0.03)
        if (noteIdx % 4 === 0) playNote(bass[Math.floor(noteIdx / 8) % bass.length], nextNoteTime, 0.3, 'triangle', 0.06)
        if (noteIdx % 2 === 0) playHihat(nextNoteTime)
        noteIdx++
        nextNoteTime += step
      }
      schedulerRef.current = requestAnimationFrame(scheduler)
    }
    scheduler()
  }

  const stopSynthesizer = () => {
    const ctx = audioCtxRef.current
    const masterGain = masterGainRef.current
    if (ctx && masterGain) {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      if (schedulerRef.current) {
        cancelAnimationFrame(schedulerRef.current)
        schedulerRef.current = null
      }
      setTimeout(() => {
        oscillatorsRef.current.forEach(osc => { try { osc.stop() } catch(e) {} })
        oscillatorsRef.current = []
        masterGainRef.current = null
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

    // ブラウザのオートプレイ制限回避のためのグローバルなインタラクション監視
    const handleInteraction = () => {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().then(() => {
          if (!isMuted && !isGamePage) startSynthesizer()
        })
      } else if (!isMuted && !isGamePage) {
        startSynthesizer()
      }
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [pathname, isMuted])

  const toggleMute = () => {
    if (isMuted) { startSynthesizer(); setIsMuted(false); }
    else { stopSynthesizer(); setIsMuted(true); }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 pointer-events-none">
      <div className={`px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-[11px] font-bold text-white/90 transition-all duration-700 shadow-2xl flex items-center gap-3 transform ${isMuted || isGamePage ? 'translate-x-10 opacity-0' : 'translate-x-0 opacity-100'}`}>
        <div className="flex gap-[3px] items-end h-3">
          <div className="w-1.5 bg-yellow-400 animate-[music-bar_0.3s_infinite_ease-in-out]" style={{ animationDelay: '0s' }} />
          <div className="w-1.5 bg-yellow-400 animate-[music-bar_0.3s_infinite_ease-in-out]" style={{ animationDelay: '0.1s' }} />
          <div className="w-1.5 bg-yellow-400 animate-[music-bar_0.3s_infinite_ease-in-out]" style={{ animationDelay: '0.2s' }} />
        </div>
        <span className="tracking-tighter">POP BGM ACTIVE</span>
      </div>

      <button
        onClick={toggleMute}
        disabled={isGamePage}
        className={`pointer-events-auto p-4 rounded-2xl shadow-2xl transition-all duration-500 border backdrop-blur-xl group flex items-center justify-center ${
          isGamePage 
            ? 'bg-gray-900/40 border-white/5 text-gray-600 scale-90' 
            : isMuted 
              ? 'bg-black/60 border-white/10 text-white/30 hover:text-white/70' 
              : 'bg-gradient-to-br from-yellow-400 to-orange-500 border-white/40 text-black shadow-[0_10px_40px_rgba(250,204,21,0.5)] hover:scale-110 active:scale-95'
        }`}
      >
        {isMuted || isGamePage ? <Music2 className="w-6 h-6" /> : <Music className="w-6 h-6 animate-bounce" />}
      </button>

      <style jsx global>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
      `}</style>
    </div>
  )
}
