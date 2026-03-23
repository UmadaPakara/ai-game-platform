/**
 * サムネイル生成 API
 * 1. ゲームコードを OpenAI で分析し、画像生成用プロンプト（英語）を作成。
 * 2. DALL-E 3 を呼び出してゲームのカバーアートを生成。
 */
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { htmlCode } = await req.json()

    if (!htmlCode) {
      return NextResponse.json({ error: "HTML code is required" }, { status: 400 })
    }

    // 🔹 1. OpenAI に内容を分析させ、DALL-E 3 用のプロンプトを生成させる
    const promptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an assistant that summarizes game content from HTML/JS code into a short, vivid image generation prompt for DALL-E 3. Focus on visual elements like characters, setting, and art style. Prompt should be in English."
          },
          {
            role: "user",
            content: `Analyze this game code and create a DALL-E 3 prompt (around 50 words) that represents it as a high-quality game cover art: \n\n${htmlCode.substring(0, 4000)}`
          }
        ],
        temperature: 0.7,
      }),
    })

    const promptData = await promptResponse.json()
    if (!promptResponse.ok) {
      return NextResponse.json({ error: promptData }, { status: promptResponse.status })
    }

    const imagePrompt = promptData.choices[0].message.content

    // 🔹 2. DALL-E 3 で画像を生成
    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      }),
    })

    const imageData = await imageResponse.json()
    if (!imageResponse.ok) {
      return NextResponse.json({ error: imageData }, { status: imageResponse.status })
    }

    // 生成された画像の URL と、OpenAI が調整した最終プロンプトを返す
    return NextResponse.json({
      imageUrl: imageData.data[0].url,
      revisedPrompt: imageData.data[0].revised_prompt
    })

  } catch (error) {
    console.error("Thumbnail Generation Error:", error)
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    )
  }
}
