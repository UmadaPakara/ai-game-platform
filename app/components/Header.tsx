"use client";

import { useState } from "react";
import { Search, Menu, Gamepad2, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthButton from "./AuthButton";

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?q=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push(`/`);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
            {/* Left: Logo and Menu */}
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-full md:hidden">
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
                <div
                    className="flex items-center gap-2 text-indigo-600 cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <Gamepad2 className="w-8 h-8" />
                    <span className="text-xl font-bold tracking-tight hidden sm:block">AIGamePlatform</span>
                </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl px-4 flex justify-center hidden sm:flex">
                <form
                    onSubmit={handleSearch}
                    className="flex w-full max-w-xl items-center border border-gray-300 rounded-full bg-gray-50 overflow-hidden focus-within:bg-white focus-within:border-blue-500 focus-within:shadow-sm"
                >
                    <div className="pl-4 pr-2 text-gray-500">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="ゲームを検索"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 py-2 bg-transparent outline-none text-gray-800"
                    />
                    <button type="submit" className="px-5 py-2 bg-gray-100 border-l border-gray-300 hover:bg-gray-200 transition-colors">
                        <Search className="w-5 h-5 text-gray-600" />
                    </button>
                </form>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                <button className="p-2 sm:hidden hover:bg-gray-100 rounded-full">
                    <Search className="w-5 h-5 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full hidden sm:block">
                    <Bell className="w-6 h-6 text-gray-700" />
                </button>
                <AuthButton />
            </div>
        </header>
    );
}
