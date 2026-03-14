"use client";

import { useState } from "react";
import { Search, Menu, Gamepad2, Bell, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?q=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push(`/`);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-md border-b border-gray-800/50 z-50 flex items-center justify-between px-4">
            {/* Left: Logo and Menu */}
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-white/10 rounded-full md:hidden">
                    <Menu className="w-6 h-6 text-gray-300" />
                </button>
                <div
                    className="flex items-center gap-2 text-purple-400 cursor-pointer drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    onClick={() => router.push("/")}
                >
                    <Gamepad2 className="w-8 h-8" />
                    <span className="text-xl font-bold tracking-tight hidden sm:block text-purple-100">AIGamePlatform</span>
                </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl px-4 flex justify-center hidden sm:flex">
                <form
                    onSubmit={handleSearch}
                    className="flex w-full max-w-xl items-center border border-gray-700/50 rounded-full bg-white/5 overflow-hidden focus-within:bg-white/10 focus-within:border-purple-500/50 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                >
                    <div className="pl-4 pr-2 text-gray-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder={t("common.search_placeholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 py-2 bg-transparent outline-none text-gray-100 placeholder-gray-500"
                    />
                    <button type="submit" className="px-5 py-2 bg-white/5 border-l border-gray-700/50 hover:bg-white/10 transition-colors">
                        <Search className="w-5 h-5 text-gray-400" />
                    </button>
                </form>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                <button className="p-2 sm:hidden hover:bg-white/10 rounded-full">
                    <Search className="w-5 h-5 text-gray-300" />
                </button>
                <button 
                    onClick={() => setLanguage(language === "ja" ? "en" : "ja")}
                    className="p-2 hover:bg-white/10 rounded-full text-gray-300 flex items-center gap-1 transition-colors border border-gray-700/50 sm:border-0"
                >
                    <Globe className="w-5 h-5" />
                    <span className="text-xs font-bold hidden sm:block">{language === "ja" ? "EN" : "JP"}</span>
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full hidden sm:block">
                    <Bell className="w-6 h-6 text-gray-300" />
                </button>
                <AuthButton />
            </div>
        </header>
    );
}
