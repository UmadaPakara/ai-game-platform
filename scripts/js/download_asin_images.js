const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const products = [
    { title: "Razer Viper V3 Pro", link: "https://amzn.to/4unynTW", file: "viper_v3.jpg" },
    { title: "SteelSeries Apex Pro TKL (2023)", link: "https://amzn.to/4b5P6DJ", file: "apex_pro.jpg" },
    { title: "Logicool G PRO X SUPERLIGHT 2", link: "https://amzn.to/3OX8Tg7", file: "superlight.jpg" },
    { title: "Razer Huntsman V3 Pro TKL", link: "https://amzn.to/4sh7TC7", file: "huntsman.jpg" },
    { title: "HyperX Cloud III", link: "https://amzn.to/4lvGdHi", file: "cloud3.jpg" },
    { title: "Elgato Stream Deck MK.2", link: "https://amzn.to/3OWWzwm", file: "stream_deck.jpg" },
    { title: "Logicool G915 TKL (G913)", link: "https://amzn.to/4sGUC5G", file: "g915.jpg" },
    { title: "Razer Wolverine V2 Pro", link: "https://amzn.to/4s7nPqz", file: "wolverine.jpg" },
    { title: "ASUS ROG Swift 360Hz", link: "https://amzn.to/4s8LcQB", file: "rog_swift.jpg" },
    { title: "Sony INZONE H9", link: "https://amzn.to/4upYucN", file: "inzone.jpg" },
    { title: "iPad (第10世代)", link: "https://amzn.to/4ucimQF", file: "ipad.jpg" },
    { title: "Logicool G PRO 2 LIGHTSPEED", link: "https://amzn.to/4raGyQE", file: "gpro2.jpg" },
    { title: "G PRO ゲーミングキーボード", link: "https://amzn.to/4rS8KJa", file: "gpro_kb.jpg" },
    { title: "REDMAGIC 11 Pro", link: "https://amzn.to/409mm6T", file: "redmagic.jpg" },
    { title: "Radeon RX 9070 XT", link: "https://amzn.to/4lcEiXU", file: "rx9070xt.jpg" },
    { title: "DualSense ミッドナイト ブラック", link: "https://www.amazon.co.jp/dp/B094R8KF9V", file: "dualsense.jpg" },
    { title: "Flydigi Vader 4 PRO", link: "https://www.amazon.co.jp/dp/B0D9VBBFDR", file: "flydigi.jpg" }
];

const outDir = path.join(__dirname, 'public', 'images', 'affiliate');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

function getRedirectUrl(url) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                resolve(res.headers.location);
            } else {
                resolve(url);
            }
        }).on('error', () => {
            resolve(url);
        });
    });
}

function extractAsin(url) {
    const match = url.match(/\/(?:dp|aso|product|asin)\/([A-Z0-9]{10})/i);
    return match ? match[1] : null;
}

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const client = url.startsWith('https') ? https : http;
        client.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadImage(response.headers.location, dest).then(resolve).catch(reject);
            } else {
                file.close();
                fs.unlink(dest, () => reject(new Error(`Failed with status code: ${response.statusCode}`)));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    for (const p of products) {
        try {
            console.log(`Processing: ${p.title}`);
            const fullUrl = await getRedirectUrl(p.link);
            const asin = extractAsin(fullUrl);
            if (asin) {
                console.log(`  ASIN: ${asin}`);
                // Try Amazon's image server using ASIN
                // Large image using old format format
                const imgUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`;
                const destPath = path.join(outDir, p.file);
                try {
                    await downloadImage(imgUrl, destPath);
                    const stats = fs.statSync(destPath);
                    if (stats.size < 1000) {
                        // Probably a 1x1 pixel 
                        console.log(`  File too small. Trying alternative format.`);
                        const imgUrl2 = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&Format=_SL1000_&ASIN=${asin}&MarketPlace=JP&ID=AsinImage&ServiceVersion=20070822`;
                        await downloadImage(imgUrl2, destPath);
                        console.log(`  Downloaded via adsystem: ${p.file}`);
                    } else {
                        console.log(`  Downloaded: ${p.file}`);
                    }
                } catch (e) {
                    console.log(`  Error downloading image: ${e.message}`);
                }
            } else {
                console.log(`  Could not find ASIN for ${fullUrl}`);
            }
        } catch (e) {
            console.log(`  Error: ${e.message}`);
        }
    }
}

run();
