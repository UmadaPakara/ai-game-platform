const puppeteer = require('puppeteer-core');
const fs = require('fs');
const https = require('https');
const path = require('path');

const outDir = path.join(__dirname, 'public', 'images', 'affiliate');

const missing = [
    { name: "dualsense.jpg", url: "https://www.amazon.co.jp/dp/B094R8KF9V" },
    { name: "flydigi.jpg", url: "https://www.amazon.co.jp/dp/B0D9VBBFDR" },
    { name: "redmagic.jpg", url: "https://www.amazon.co.jp/dp/B0FR58VQJN" }
];

async function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', err => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            headless: 'new'
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        for (const item of missing) {
            console.log("Navigating to", item.url);
            await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            const imgSrc = await page.evaluate(() => {
                const img = document.querySelector('#landingImage') || document.querySelector('#imgBlkFront');
                if (img) {
                    const dynamicAttr = img.getAttribute('data-a-dynamic-image');
                    if (dynamicAttr) {
                        try {
                            const urls = Object.keys(JSON.parse(dynamicAttr));
                            if (urls.length > 0) return urls[0];
                        } catch (e) { }
                    }
                    return img.src;
                }
                return null;
            });

            if (imgSrc) {
                console.log(`Found image for ${item.name}: ${imgSrc}`);
                await download(imgSrc, path.join(outDir, item.name));
            } else {
                console.log(`Not found for ${item.name}`);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close();
    }
})();
