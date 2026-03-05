import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "You are an expert HTML game generator. Output only clean HTML."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    // 🔥 ここが重要：OpenAI側エラーチェック
    if (!response.ok) {
      return NextResponse.json(
        { error: data },
        { status: response.status }
      )
    }

    return NextResponse.json({
      result: data.choices[0].message.content
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    )
  }
}