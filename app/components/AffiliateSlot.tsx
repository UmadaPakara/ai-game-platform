"use client";

import { ExternalLink, ShoppingCart, Info } from "lucide-react";
import Image from "next/image";

interface AffiliateSlotProps {
    type: "sidebar" | "banner" | "sidebar-minimal" | "sidebar-tall";
    title?: string;
    description?: string;
    imageUrl?: string;
    link: string;
    price?: string;
    badge?: string;
    priority?: boolean;
}

export default function AffiliateSlot({
    type,
    title = "Recommended Gear",
    description,
    imageUrl,
    link,
    price,
    badge,
    priority = false
}: AffiliateSlotProps) {

    // Sidebar Tall Style (Vertical layout, very prominent)
    if (type === "sidebar-tall") {
        return (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-black/40 backdrop-blur-md border border-gray-800/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] relative z-10"
            >
                {imageUrl && (
                    <div className="w-full aspect-square bg-white/5 overflow-hidden relative">
                        <Image src={imageUrl} alt={title || "Product Image"} fill unoptimized priority={priority} sizes="(max-width: 768px) 100vw, 300px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        {badge && (
                            <div className="absolute top-2 left-2">
                                <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg shadow-lg border border-purple-400/30 uppercase tracking-wider">
                                    {badge}
                                </span>
                            </div>
                        )}
                    </div>
                )}
                <div className="p-4 flex flex-col gap-2">
                    <h4 className="text-sm font-bold text-gray-100 line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                        {title}
                    </h4>
                    {description && (
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-snug">
                            {description}
                        </p>
                    )}
                    <div className="mt-1 flex items-center justify-between">
                        {price && <span className="text-purple-400 font-extrabold text-sm">{price}</span>}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-300 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <span>詳細を見る</span>
                            <ExternalLink className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </a>
        );
    }

    // Sidebar Style (Similar to YouTube related content or promotions)
    if (type === "sidebar" || type === "sidebar-minimal") {
        return (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-xl p-3 hover:border-purple-500/50 transition-all hover:shadow-sm relative z-10"
            >
                <div className="flex gap-3">
                    {imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                            <Image src={imageUrl} alt={title || "Product Image"} fill unoptimized priority={priority} sizes="64px" className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        {badge && (
                            <span className="inline-block px-1.5 py-0.5 bg-purple-900/40 text-purple-300 text-[10px] font-bold rounded mb-1 border border-purple-500/30 uppercase tracking-wider">
                                {badge}
                            </span>
                        )}
                        <h4 className="text-xs font-bold text-gray-100 line-clamp-2 leading-tight group-hover:text-purple-400">
                            {title}
                        </h4>
                        {price && <p className="text-purple-400 font-bold text-xs mt-1">{price}</p>}
                        {!imageUrl && type !== "sidebar-minimal" && description && (
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-snug">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {type === "sidebar" && (
                    <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-gray-500 border-t border-gray-800/50 pt-2 group-hover:text-purple-400 transition-colors">
                        <span>Check Details</span>
                        <ExternalLink className="w-3 h-3" />
                    </div>
                )}
            </a>
        );
    }

    // Banner Style (For the main content area, e.g., below game play)
    return (
        <div className="bg-gradient-to-r from-gray-900 to-black/40 border border-gray-800/50 rounded-2xl p-4 sm:p-6 my-8 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                {imageUrl && (
                    <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-white/5 border border-gray-700/30 shadow-inner flex-shrink-0 relative">
                        <Image src={imageUrl} alt={title || "Product Image"} fill unoptimized priority={priority} sizes="(max-width: 640px) 100vw, 128px" className="object-contain p-2" />
                    </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-purple-900/40 text-purple-300 text-[10px] font-bold rounded-full border border-purple-500/30 uppercase tracking-tighter">
                            SPONSORED
                        </span>
                        {badge && (
                            <span className="px-2 py-0.5 bg-amber-900/40 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/30 uppercase tracking-tighter">
                                {badge}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-extrabold text-gray-100 mb-2 leading-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 max-w-lg">
                        {description || "Explore this recommended tool to enhance your gaming and AI creation experience."}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span>ショップをチェック</span>
                            {price && <span className="ml-1 border-l border-purple-500 pl-3">{price}</span>}
                        </a>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Affiliate link
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
