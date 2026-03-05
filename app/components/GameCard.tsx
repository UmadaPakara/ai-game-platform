"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface Game {
    id: string;
    title: string;
    thumbnail?: string;
    views?: number;
    likes?: number;
    created_at?: string;
    user_id?: string;
    profiles?: { username: string } | null;
}

export default function GameCard({ game, isLoading }: { game?: Game, isLoading?: boolean }) {
    const router = useRouter();

    if (isLoading || !game) {
        return (
            <div className="flex flex-col gap-3 animate-pulse">
                <div className="w-full aspect-video bg-gray-200 rounded-xl" />
                <div className="flex gap-3 px-1 mt-1">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2 mt-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="group flex flex-col gap-3 cursor-pointer"
            onClick={() => router.push(`/game/${game.id}`)}
        >
            {/* Thumbnail Area */}
            <div className="relative w-full aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                {game.thumbnail ? (
                    <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gray-100 italic">
                        No Image
                    </div>
                )}

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 bg-indigo-600/90 p-3 rounded-full backdrop-blur-sm shadow-lg">
                        <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Info Area */}
            <div className="flex gap-3 px-1">
                {/* Creator Avatar - YouTube style */}
                <div className="w-9 h-9 mt-0.5 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-50 shadow-inner">
                    {(game.profiles?.username || game.title).charAt(0)}
                </div>

                <div className="flex flex-col overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {game.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 hover:text-gray-900 transition-colors line-clamp-1">
                        {game.profiles?.username || "作者不明"}
                    </p>
                    <div className="flex items-center text-[11px] text-gray-400 mt-1 space-x-1.5">
                        <span>{game.views || 0} 回視聴</span>
                        <span className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                        <span>いいね {game.likes || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
