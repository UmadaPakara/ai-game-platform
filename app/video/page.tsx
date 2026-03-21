"use client";

import { useState } from "react";
import { Player } from "@remotion/player";
import { MyVideo } from "@/remotion/MyVideo";
import { AIShortVideo } from "@/remotion/AIShortVideo";

export default function VideoPage() {
    const [composition, setComposition] = useState<"MyVideo" | "AIShortVideo">("AIShortVideo");

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-purple-400">Remotion Preview</h1>
                <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-gray-800">
                    <button
                        onClick={() => setComposition("MyVideo")}
                        className={`px-4 py-2 rounded-md transition-all ${composition === "MyVideo" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
                    >
                        Standard
                    </button>
                    <button
                        onClick={() => setComposition("AIShortVideo")}
                        className={`px-4 py-2 rounded-md transition-all ${composition === "AIShortVideo" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
                    >
                        YouTube Short
                    </button>
                </div>
            </div>

            <div className={`rounded-2xl overflow-hidden border border-gray-800 shadow-[0_0_30px_rgba(168,85,247,0.2)] bg-black ${composition === "AIShortVideo" ? "aspect-[9/16] max-w-[400px] mx-auto" : "aspect-video"}`}>
                {composition === "MyVideo" ? (
                    <Player
                        component={MyVideo}
                        durationInFrames={150}
                        compositionWidth={1920}
                        compositionHeight={1080}
                        fps={30}
                        controls
                        loop
                        inputProps={{
                            titleText: "AI Game Platform",
                            titleColor: "#a855f7",
                        }}
                        style={{ width: "100%", height: "100%" }}
                    />
                ) : (
                    <Player
                        component={AIShortVideo}
                        durationInFrames={900}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        fps={30}
                        controls
                        loop
                        style={{ width: "100%", height: "100%" }}
                    />
                )}
            </div>

            <div className="mt-8 p-6 bg-black/40 border border-gray-800 rounded-xl text-gray-400">
                <p className="text-sm">
                    {composition === "AIShortVideo" 
                        ? "YouTube Short形式 (9:16) のプレビューです。ずんだもんの音声と連動しています。"
                        : "標準的な16:9形式のプレビューです。"}
                </p>
                <p className="text-sm mt-2">
                    レンダリングして動画ファイル（デスクトップの動画フォルダ）に出力するには：<br/>
                    <code className="bg-purple-900/40 text-purple-300 px-2 py-1 rounded inline-block mt-1">
                        npm run remotion:render
                    </code>
                </p>
            </div>
        </div>
    );
}
