import Link from "next/link";
import { Home, Trophy, Heart, User, PlusCircle, Star, TrendingUp } from "lucide-react";
import AffiliateSlot from "./AffiliateSlot";
import AffiliateCarousel from "./AffiliateCarousel";
import { AFFILIATE_ADS, getWeeklyTrendingAds } from "@/lib/affiliate";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Globe } from "lucide-react";

type SidebarProps = {
    currentTab: string;
    onTabChange: (tab: string) => void;
};

export default function Sidebar({ currentTab, onTabChange }: SidebarProps) {
    const { language, setLanguage, t } = useLanguage();
    
    const getButtonClass = (isActive: boolean) =>
        `flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
            ? "bg-purple-600/30 text-purple-200 font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-500/30"
            : "hover:bg-white/10 text-gray-300 hover:text-white"
        }`;

    return (
        <aside className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-black/40 backdrop-blur-md border-r border-gray-800/50 overflow-y-auto hidden md:block z-40 transition-all duration-300">
            <div className="py-4 px-3 flex flex-col gap-6">
                {/* Main Navigation */}
                <div className="space-y-1">
                    <Link href="/?tab=home" onClick={() => onTabChange("home")} className={getButtonClass(currentTab === "home")}>
                        <Home className={`w-5 h-5 ${currentTab === "home" ? "text-purple-400" : "text-gray-400"}`} />
                        <span>{t("common.home")}</span>
                    </Link>
                    <Link href="/ranking" className={getButtonClass(currentTab === "ranking")}>
                        <Trophy className={`w-5 h-5 ${currentTab === "ranking" ? "text-purple-400" : "text-gray-400"}`} />
                        <span>{t("common.ranking")}</span>
                    </Link>
                    <Link href="/upload" className={getButtonClass(currentTab === "upload")}>
                        <PlusCircle className={`w-5 h-5 ${currentTab === "upload" ? "text-purple-400" : "text-gray-400"}`} />
                        <span>{t("common.upload")}</span>
                    </Link>
                </div>

                {/* Language Switcher */}
                <div className="px-3">
                    <button 
                        onClick={() => setLanguage(language === "ja" ? "en" : "ja")}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 transition-colors border border-gray-700/50"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span className="font-bold">{language === "ja" ? "English" : "日本語"}</span>
                    </button>
                </div>

                <hr className="border-gray-800/50" />

                {/* Library Section */}
                <div>
                    <h3 className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                        {language === "ja" ? "ライブラリ" : "LIBRARY"}
                    </h3>
                    <div className="space-y-1">
                        <Link href="/?tab=favorites" onClick={() => onTabChange("favorites")} className={getButtonClass(currentTab === "favorites")}>
                            <Heart className={`w-5 h-5 ${currentTab === "favorites" ? "text-indigo-600" : "text-gray-500"}`} />
                            <span>{t("common.favorites")}</span>
                        </Link>
                        <Link href="/?tab=profile" onClick={() => onTabChange("profile")} className={getButtonClass(currentTab === "profile")}>
                            <User className={`w-5 h-5 ${currentTab === "profile" ? "text-indigo-600" : "text-gray-500"}`} />
                            <span>{t("common.profile")}</span>
                        </Link>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Recommended / Affiliate Section */}
                <div>
                    <h3 className="px-3 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {language === "ja" ? "おすすめアイテム" : "RECOMMENDED ITEMS"}
                    </h3>
                    <div className="px-1">
                        <AffiliateCarousel ads={AFFILIATE_ADS.sidebar} interval={5000} />
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Trending Section */}
                <div>
                    <h3 className="px-3 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-rose-500" />
                        {language === "ja" ? "売れ筋トレンド" : "TRENDING NOW"}
                    </h3>
                    <div className="px-1">
                        <AffiliateCarousel ads={getWeeklyTrendingAds(5)} interval={8000} />
                    </div>
                </div>
            </div>
        </aside>
    );
}
