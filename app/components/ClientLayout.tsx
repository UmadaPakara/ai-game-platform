// app/components/ClientLayout.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { readonly children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");

    // Derive active tab purely from URL — no local state needed
    const currentTab = pathname === "/ranking" ? "ranking"
        : pathname === "/upload" ? "upload"
            : pathname === "/about" ? "about"
                : pathname.startsWith("/profile") ? "profile"
                    : tabParam || "home";

    return (
        <div className="flex min-h-screen bg-transparent pt-16 font-sans">
            <Header />

            <Sidebar currentTab={currentTab} onTabChange={() => { }} />

            <main className="flex-1 w-full md:pl-60 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
