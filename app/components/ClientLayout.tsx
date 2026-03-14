// app/components/ClientLayout.tsx
"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { readonly children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    
    // State for mobile sidebar
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Derive active tab purely from URL — no local state needed
    const currentTab = pathname === "/ranking" ? "ranking"
        : pathname === "/upload" ? "upload"
            : pathname === "/about" ? "about"
                : pathname.startsWith("/profile") ? "profile"
                    : tabParam || "home";

    return (
        <div className="flex min-h-screen bg-transparent pt-16 font-sans">
            <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <Sidebar 
                currentTab={currentTab} 
                onTabChange={() => setIsMobileMenuOpen(false)} 
                isOpenMobile={isMobileMenuOpen}
            />

            <main className="flex-1 w-full md:pl-60 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
