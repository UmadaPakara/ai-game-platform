const fs = require('fs');
const path = require('path');
const http = require('http');

const SPEAKER_ID = 3; // ずんだもん（あまあま）
const BASE_URL = 'http://localhost:50021';
const OUTPUT_DIR = path.join(__dirname, 'public', 'audio');

const lines = [
    { name: 'gt1.wav', text: 'やっほー！ずんだもんなのだ！今日はこのエーアイ・ゲームプラットフォームで遊んでみるのだ！' },
    { name: 'gt2.wav', text: '見て！この爽快なアクション！スライムを動かして敵をなぎ倒すのが最高に楽しいのだ！' },
    { name: 'gt3.wav', text: 'うわー、囲まれたのだ！でも大丈夫、ボクのテクニックで華麗に切り抜けるのだ！' },
    { name: 'gt4.wav', text: '遊び疲れたら、次は自分でゲームを作ってみるのだ！' },
    { name: 'gt5.wav', text: 'このプラットフォームは、エーアイにお願いするだけで誰でもゲームが作れちゃうのだ。プログラミングは一切不要なのだ！' },
    { name: 'gt6.wav', text: 'ジェミニさんに、マリオみたいなゲームを作って、って言うだけで完成なのだ。すごい時代になったのだ！' },
    { name: 'sec1.wav', text: 'ヤバすぎるのだ！ずんだもんも驚愕のエーアイ・ゲームプラットフォームなのだ！' },
    { name: 'sec2.wav', text: '見て！エーアイに頼むだけで、一瞬でゲームが完成しちゃうのだ！' },
    { name: 'sec3.wav', text: 'さらに！既存のゲームを最強に改造して、ボクだけの作品を作ることも可能なのだ！' },
    { name: 'sec4.wav', text: 'ランキングの頂点を目指して、キミも天才クリエイターになるのだ！' }
];

async function postRequest(urlPath, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 50021,
            path: urlPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function generateAudio(text, filename) {
    console.log(`Generating: ${filename} for "${text}"`);
    
    // 1. Audio Query
    const queryPath = `/audio_query?text=${encodeURIComponent(text)}&speaker=${SPEAKER_ID}`;
    const queryBuffer = await postRequest(queryPath);
    const queryData = JSON.parse(queryBuffer.toString());

    // 1.5. Adjust speed
    queryData.speedScale = 1.5;
    const modifiedQuery = JSON.stringify(queryData);

    // 2. Synthesis
    const synthPath = `/synthesis?speaker=${SPEAKER_ID}`;
    const audioData = await postRequest(synthPath, Buffer.from(modifiedQuery));

    fs.writeFileSync(path.join(OUTPUT_DIR, filename), audioData);
    console.log(`Saved: ${filename}`);
}

async function run() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    for (const line of lines) {
        await generateAudio(line.text, line.name);
    }
    console.log('All audio generated successfully.');
}

run().catch(console.error);
