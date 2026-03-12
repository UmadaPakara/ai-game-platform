const fs = require('fs');
const path = require('path');
const https = require('https');

const products = [
    { title: "Razer Viper V3 Pro", link: "https://amzn.to/4unynTW", file: "viper_v3_pro.jpg" },
    { title: "SteelSeries Apex Pro TKL (2023)", link: "https://amzn.to/4b5P6DJ", file: "apex_pro.jpg" },
    { title: "Logicool G PRO X SUPERLIGHT 2", link: "https://amzn.to/3OX8Tg7", file: "superlight_2.jpg" },
    { title: "Razer Huntsman V3 Pro TKL", link: "https://amzn.to/4sh7TC7", file: "huntsman.jpg" },
    { title: "HyperX Cloud III", link: "https://amzn.to/4lvGdHi", file: "cloud_3.jpg" },
    { title: "Elgato Stream Deck MK.2", link: "https://amzn.to/3OWWzwm", file: "streamdeck.jpg" },
    { title: "Logicool G915 TKL (G913)", link: "https://amzn.to/4sGUC5G", file: "g915.jpg" },
    { title: "Razer Wolverine V2 Pro", link: "https://amzn.to/4s7nPqz", file: "wolverine.jpg" },
    { title: "ASUS ROG Swift 360Hz", link: "https://amzn.to/4s8LcQB", file: "rog_swift.jpg" },
    { title: "Sony INZONE H9", link: "https://amzn.to/4upYucN", file: "inzone_h9.jpg" },
    { title: "iPad (第10世代)", link: "https://amzn.to/4ucimQF", file: "ipad_10.jpg" },
    { title: "Logicool G PRO 2 LIGHTSPEED", link: "https://amzn.to/4raGyQE", file: "gpro2.jpg" },
    { title: "G PRO ゲーミングキーボード", link: "https://amzn.to/4rS8KJa", file: "gpro_kb.jpg" },
    { title: "REDMAGIC 11 Pro", link: "https://amzn.to/409mm6T", file: "redmagic11.jpg" },
    { title: "Radeon RX 9070 XT", link: "https://amzn.to/4lcEiXU", file: "rx9070xt.jpg" }
];

const outDir = path.join(__dirname, 'public', 'images', 'affiliate');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function fetchHtml(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
        },
        redirect: 'follow'
    });
    return res.text();
}

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    for (const p of products) {
        try {
            console.log(`Fetching HTML for ${p.title} ...`);
            const html = await fetchHtml(p.link);
            const match = html.match(/data-a-dynamic-image="([^"]+)"/);
            if (match) {
                const decoded = match[1].replace(/&quot;/g, '"');
                const urls = Object.keys(JSON.parse(decoded));
                if (urls.length > 0) {
                    const imgUrl = urls[0];
                    console.log(`  Found Image: ${imgUrl}`);
                    const destPath = path.join(outDir, p.file);
                    await downloadImage(imgUrl, destPath);
                    console.log(`  Downloaded: ${p.file}`);
                } else {
                    console.log(`  Image not found in array`);
                }
            } else {
                console.log(`  Regex match failed for ${p.title}`);
            }
        } catch (e) {
            console.log(`  Error: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 1000)); // sleep
    }
}

run();
