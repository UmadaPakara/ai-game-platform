"use client"

import { Check, Sparkles, Zap, Shield, Rocket, Star, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import Link from "next/link"

export default function PremiumPage() {
    const { t, language } = useLanguage()

    const tiers = [
        {
            name: "Free",
            price: "¥0",
            period: "",
            description: language === "ja" ? "まずはここから。AIゲーム投稿の基本を体験。" : "Get started with the basics of AI game sharing.",
            features: [
                language === "ja" ? "月間3回までゲーム投稿可能" : "Up to 3 uploads per month",
                language === "ja" ? "標準的な共有機能" : "Standard sharing features",
                language === "ja" ? "広告あり" : "Contains ads",
                language === "ja" ? "基本的なサポート" : "Basic support"
            ],
            buttonText: language === "ja" ? "現在のプラン" : "Current Plan",
            highlight: false
        },
        {
            name: "Pro",
            price: "¥980",
            period: language === "ja" ? "/月" : "/mo",
            description: language === "ja" ? "クリエイターの翼。制限なしで投稿を楽しもう。" : "Wings for creators. Enjoy sharing without limits.",
            features: [
                language === "ja" ? "ゲーム投稿数無制限" : "Unlimited game uploads",
                language === "ja" ? "カスタマイズ可能なプレイヤー" : "Customizable game player",
                language === "ja" ? "広告非表示" : "Clean, Ad-free experience",
                language === "ja" ? "プロ専用バッジ表示" : "Exclusive Pro badge on profile",
                language === "ja" ? "先行アクセス機能" : "Early access to new features"
            ],
            buttonText: language === "ja" ? "Proにアップグレード" : "Upgrade to Pro",
            highlight: true
        }
    ]

    const benefits = [
        {
            icon: <Rocket className="w-6 h-6 text-purple-400" />,
            title: language === "ja" ? "無制限アップロード" : "Unlimited Uploads",
            desc: language === "ja" ? "投稿数の制限を気にせず、あなたの作品をいくらでも世界に公開できます。" : "Share as many creations as you want without worrying about upload limits."
        },
        {
            icon: <Shield className="w-6 h-6 text-blue-400" />,
            title: language === "ja" ? "広告なし" : "Ad-free Experience",
            desc: language === "ja" ? "プレイ中も投稿中も、邪魔な広告は一切表示されません。" : "No intrusive ads while playing or uploading."
        },
        {
            icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
            title: language === "ja" ? "プレミアムプレイヤー" : "Premium Player",
            desc: language === "ja" ? "プロ専用のデザインや、透かしなしのクリーンなプレイヤーを使用可能。" : "Use exclusive pro designs and a clean player without watermarks."
        }
    ]

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Hero Section */}
            <section className="relative pt-20 pb-16 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full -z-10" />
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-6 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>GAMETUBE PRO</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        {language === "ja" ? "想像力を、" : "Unleash your "}
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                            {language === "ja" ? "限界の先へ。" : "imagination."}
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        {language === "ja" 
                            ? "GameTube Pro は、AIゲームクリエイターのための究極のプランです。より速く、より高画質に、あなたのアイデアを形にします。" 
                            : "GameTube Pro is the ultimate plan for AI game creators. Transform your ideas into reality faster and with higher quality."
                        }
                    </p>
                </div>
            </section>

            {/* Price Tiers */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier) => (
                        <div 
                            key={tier.name}
                            className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-500 ${
                                tier.highlight 
                                    ? "bg-white/5 border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.15)] scale-105 z-10" 
                                    : "bg-black/40 border-gray-800/50 hover:border-gray-700 hover:bg-white/5 shadow-2xl"
                            }`}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-black rounded-full shadow-lg tracking-widest uppercase">
                                    RECOMMENDED
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-100 mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-black">{tier.price}</span>
                                    <span className="text-gray-400 text-sm font-medium">{tier.period}</span>
                                </div>
                                <p className="text-gray-400 text-xs leading-relaxed">{tier.description}</p>
                            </div>
                            <div className="flex-1 space-y-4 mb-8">
                                {tier.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <div className={`p-1 rounded-full ${tier.highlight ? "bg-purple-500/20 text-purple-400" : "bg-gray-800 text-gray-500"}`}>
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-sm text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>
                            <button className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                tier.highlight 
                                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-[0_10px_20px_rgba(168,85,247,0.3)] hover:scale-[1.02]" 
                                    : "bg-white/5 hover:bg-white/10 text-gray-300 border border-gray-700/50"
                            }`}>
                                {tier.buttonText}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 px-6 relative">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="group">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-gray-800">
                                    {benefit.icon}
                                </div>
                                <h4 className="text-lg font-bold mb-3 text-gray-100">{benefit.title}</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto p-12 rounded-[40px] bg-gradient-to-br from-purple-900/40 via-black to-black border border-purple-500/20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full" />
                    <Star className="w-12 h-12 text-yellow-500 mx-auto mb-8 animate-spin-slow" />
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        {language === "ja" ? "今すぐプロクリエイターの仲間入りを。" : "Join the league of Pro creators today."}
                    </h2>
                    <p className="text-gray-400 mb-10 max-w-lg mx-auto">
                        {language === "ja" 
                            ? "まずは30日間の無料トライアルから。いつでもキャンセル可能です。" 
                            : "Start with a 30-day free trial. Cancel anytime."
                        }
                    </p>
                    <button className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.2)]">
                        {language === "ja" ? "無料で試してみる" : "Get Started for Free"}
                    </button>
                </div>
            </section>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
        </div>
    )
}
