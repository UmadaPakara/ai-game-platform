import Link from "next/link";
import { Home, Trophy, Heart, User, PlusCircle, Star, TrendingUp } from "lucide-react";
import AffiliateSlot from "./AffiliateSlot";
import AffiliateCarousel from "./AffiliateCarousel";
import { AFFILIATE_ADS } from "@/lib/affiliate";

type SidebarProps = {
    currentTab: string;
    onTabChange: (tab: string) => void;
};

export default function Sidebar({ currentTab, onTabChange }: SidebarProps) {
    const getButtonClass = (isActive: boolean) =>
        `flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
            ? "bg-indigo-50 text-indigo-700 font-bold shadow-sm"
            : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
        }`;

    return (
        <aside className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto hidden md:block z-40 transition-all duration-300">
            <div className="py-4 px-3 flex flex-col gap-6">
                {/* Main Navigation */}
                <div className="space-y-1">
                    <Link href="/?tab=home" onClick={() => onTabChange("home")} className={getButtonClass(currentTab === "home")}>
                        <Home className={`w-5 h-5 ${currentTab === "home" ? "text-indigo-600" : "text-gray-500"}`} />
                        <span>ホーム</span>
                    </Link>
                    <Link href="/ranking" className={getButtonClass(currentTab === "ranking")}>
                        <Trophy className={`w-5 h-5 ${currentTab === "ranking" ? "text-indigo-600" : "text-gray-500"}`} />
                        <span>ランキング</span>
                    </Link>
                    <Link href="/upload" className={getButtonClass(currentTab === "upload")}>
                        <PlusCircle className={`w-5 h-5 ${currentTab === "upload" ? "text-indigo-600" : "text-gray-500"}`} />
                        <span>投稿する</span>
                    </Link>
                </div>

                <hr className="border-gray-100" />

                {/* Library Section */}
                <div>
                    <h3 className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                        ライブラリ
                    </h3>
                    <div className="space-y-1">
                        <Link href="/?tab=favorites" onClick={() => onTabChange("favorites")} className={getButtonClass(currentTab === "favorites")}>
                            <Heart className={`w-5 h-5 ${currentTab === "favorites" ? "text-indigo-600" : "text-gray-500"}`} />
                            <span>お気に入り</span>
                        </Link>
                        <Link href="/?tab=profile" onClick={() => onTabChange("profile")} className={getButtonClass(currentTab === "profile")}>
                            <User className={`w-5 h-5 ${currentTab === "profile" ? "text-indigo-600" : "text-gray-500"}`} />
                            <span>プロフィール</span>
                        </Link>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Recommended / Affiliate Section */}
                <div>
                    <h3 className="px-3 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        おすすめアイテム
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
                        売れ筋トレンド
                    </h3>
                    <div className="px-1">
                        <AffiliateCarousel ads={AFFILIATE_ADS.trending} interval={8000} />
                    </div>
                </div>
            </div>
        </aside>
    );
}
