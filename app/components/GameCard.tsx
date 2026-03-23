"use client";

import { Play, Star } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * ゲームデータの型定義
 */
interface Game {
    id: string;
    title: string;
    thumbnail?: string;
    views?: number;
    likes?: number;
    created_at?: string;
    user_id?: string;
    is_sponsored?: boolean;
    profiles?: { username: string } | null;
}

/**
 * ゲームカードコンポーネント
 * ホーム画面や一覧画面で、各ゲームの概要（サムネイル、タイトル、投稿者など）を表示します。
 * 
 * @param game ゲームデータ（undefinedの場合は読み込み中として表示）
 * @param isLoading 読み込み中フラグ
 */
export default function GameCard({ game, isLoading }: { game?: Game, isLoading?: boolean }) {
    const router = useRouter();

    // 読み込み中またはデータがない場合はスケルトンスクリーンを表示
    if (isLoading || !game) {
        return (
            <div className="flex flex-col gap-3 animate-pulse">
                <div className="w-full aspect-video bg-white/10 rounded-xl" />
                <div className="flex gap-3 px-1 mt-1">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0" />
                    <div className="flex-1 space-y-2 mt-1">
                        <div className="h-4 bg-white/10 rounded w-3/4" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
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
            {/* サムネイルエリア */}
            <div className="relative w-full aspect-video bg-white/5 rounded-xl overflow-hidden shadow-sm group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all border border-gray-800/50">
                {game.thumbnail ? (
                    <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium bg-black/40 italic backdrop-blur-sm">
                        No Image
                    </div>
                )}

                {/* スポンサー（おすすめ）枠のバッジ */}
                {game.is_sponsored && (
                    <div className="absolute top-2 left-2 z-20">
                        <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-lg shadow-lg border border-amber-400/30 uppercase tracking-wider flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Sponsored
                        </span>
                    </div>
                )}

                {/* ホバー時に表示される再生アイコンオーバーレイ */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-purple-900/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 bg-purple-600/90 p-3 rounded-full backdrop-blur-md shadow-[0_0_20px_purple]">
                        <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* 情報表示エリア */}
            <div className="flex gap-3 px-1">
                {/* 投稿者のアバター（名前の頭文字） */}
                <div className="w-9 h-9 mt-0.5 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center text-purple-300 font-bold text-sm border border-purple-500/30 shadow-inner">
                    {(game.profiles?.username || game.title).charAt(0)}
                </div>

                <div className="flex flex-col overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-100 leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {game.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 hover:text-gray-200 transition-colors line-clamp-1">
                        {game.profiles?.username || "ユーザー"}
                    </p>
                    <div className="flex items-center text-[11px] text-gray-500 mt-1 space-x-1.5">
                        <span>{game.views || 0} 回視聴</span>
                        <span className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
                        <span>いいね {game.likes || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
