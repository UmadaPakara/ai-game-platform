const fs = require('fs');
const path = require('path');
const http = require('http');

const SPEAKER_ID = 3; // ずんだもん（あまあま）
const BASE_URL = 'http://localhost:50021';
const OUTPUT_DIR = path.join(__dirname, 'public', 'audio');

// Shortened lines from the implementation plan
const lines = [
    { name: 'sec1_short.wav', text: 'AI Game Platformへようこそなのだ！' },
    { name: 'sec2_short.wav', text: '注目のランキング画面なのだ！激戦なのだ！' },
    { name: 'sec3_short.wav', text: 'どの作品も個性的！クリック一つですぐ遊べるのだ！' },
    { name: 'sec4_short.wav', text: '詳細ページでは遊び方を確認できるのだ。評価やコメントもチェックしてほしいのだ！' },
    { name: 'sec5_short.wav', text: 'いよいよプレイ開始なのだ！ブラウザでこの滑らかさ！ぜひ体験してほしいのだ！' },
    { name: 'sec6_short.wav', text: '君もゲームを創って投稿するのだ！待っているのだ、またねなのだ！' }
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

    // 1.5. Adjust speed - 1.25 for a bit more natural feel, previous was 1.5
    queryData.speedScale = 1.35; 
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
    console.log('Shortened audio generated successfully.');
}

run().catch(console.error);
