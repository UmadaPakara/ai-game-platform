"use client";

import { ExternalLink, ShoppingCart, Info } from "lucide-react";

interface AffiliateSlotProps {
    type: "sidebar" | "banner" | "sidebar-minimal" | "sidebar-tall";
    title?: string;
    description?: string;
    imageUrl?: string;
    link: string;
    price?: string;
    badge?: string;
}

export default function AffiliateSlot({
    type,
    title = "Recommended Gear",
    description,
    imageUrl,
    link,
    price,
    badge
}: AffiliateSlotProps) {

    // Sidebar Tall Style (Vertical layout, very prominent)
    if (type === "sidebar-tall") {
        return (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-200 transition-all hover:shadow-md"
            >
                {imageUrl && (
                    <div className="w-full aspect-square bg-gray-50 overflow-hidden relative">
                        <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        {badge && (
                            <div className="absolute top-2 left-2">
                                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg shadow-lg uppercase tracking-wider">
                                    {badge}
                                </span>
                            </div>
                        )}
                    </div>
                )}
                <div className="p-4 flex flex-col gap-2">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {title}
                    </h4>
                    {description && (
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-snug">
                            {description}
                        </p>
                    )}
                    <div className="mt-1 flex items-center justify-between">
                        {price && <span className="text-indigo-600 font-extrabold text-sm">{price}</span>}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <span>Check</span>
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
                className="group block bg-white border border-gray-100 rounded-xl p-3 hover:border-indigo-200 transition-all hover:shadow-sm"
            >
                <div className="flex gap-3">
                    {imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        {badge && (
                            <span className="inline-block px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded mb-1 uppercase tracking-wider">
                                {badge}
                            </span>
                        )}
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600">
                            {title}
                        </h4>
                        {price && <p className="text-indigo-600 font-bold text-xs mt-1">{price}</p>}
                        {!imageUrl && type !== "sidebar-minimal" && description && (
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-snug">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {type === "sidebar" && (
                    <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-gray-400 border-t border-gray-50 pt-2 group-hover:text-indigo-500 transition-colors">
                        <span>Check Details</span>
                        <ExternalLink className="w-3 h-3" />
                    </div>
                )}
            </a>
        );
    }

    // Banner Style (For the main content area, e.g., below game play)
    return (
        <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-4 sm:p-6 my-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                {imageUrl && (
                    <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-white shadow-inner flex-shrink-0">
                        <img src={imageUrl} alt={title} className="w-full h-full object-contain p-2" />
                    </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full border border-indigo-200 uppercase tracking-tighter">
                            SPONSORED
                        </span>
                        {badge && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 uppercase tracking-tighter">
                                {badge}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-extrabold text-gray-900 mb-2 leading-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 max-w-lg">
                        {description || "Explore this recommended tool to enhance your gaming and AI creation experience."}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span>View Deal</span>
                            {price && <span className="ml-1 border-l border-indigo-500 pl-3">{price}</span>}
                        </a>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Affiliate link
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
