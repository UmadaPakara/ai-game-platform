"use client";

import { useState, useEffect, useCallback } from "react";
import AffiliateSlot from "./AffiliateSlot";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdItem {
    title?: string;
    description?: string;
    imageUrl?: string;
    link: string;
    price?: string;
    badge?: string;
}

interface AffiliateCarouselProps {
    ads: AdItem[];
    interval?: number;
}

export default function AffiliateCarousel({ ads, interval = 5000 }: AffiliateCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, [ads.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
    };

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            nextSlide();
        }, interval);

        return () => clearInterval(timer);
    }, [nextSlide, interval, isPaused]);

    if (!ads || ads.length === 0) return null;

    return (
        <div
            className="relative group overflow-hidden rounded-xl border border-gray-800/50 bg-black/40 backdrop-blur-md"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Viewport */}
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {ads.map((ad, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                        <AffiliateSlot
                            type="sidebar-tall"
                            priority={true}
                            {...ad}
                        />
                    </div>
                ))}
            </div>

            {/* Controls */}
            {ads.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600 text-white border border-white/10 z-10"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600 text-white border border-white/10 z-10"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {ads.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${currentIndex === index ? "bg-purple-500 w-3" : "bg-gray-600"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
