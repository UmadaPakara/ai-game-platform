// lib/affiliate.ts

export const AFFILIATE_ADS = {
    sidebar: [
        {
            title: "Logicool G PRO 2 LIGHTSPEED",
            description: "プロが選ぶ、超軽量ワイヤレスマウスの頂点。",
            badge: "おすすめ",
            price: "¥11,970",
            link: "https://amzn.to/4raGyQE",
            imageUrl: "/images/affiliate/gpro2.jpg",
        },
        {
            title: "G PRO ゲーミングキーボード",
            description: "競技向け、コンパクトなテンキーレスデザイン。",
            badge: "人気",
            price: "¥10,480",
            link: "https://amzn.to/4rS8KJa",
            imageUrl: "/images/affiliate/gpro_kb.jpg",
        },
        {
            title: "Radeon RX 9070 XT",
            description: "圧倒的なフレームレートで最高画質を体験。",
            badge: "NEW",
            price: "¥100,800",
            link: "https://amzn.to/4lcEiXU",
            imageUrl: "/images/affiliate/rx9070xt.jpg",
        },
        {
            title: "DualSense ミッドナイト ブラック",
            description: "PS5純正、ハプティックフィードバックで直感的なゲームプレイ。",
            badge: "人気",
            price: "¥11,480",
            link: "https://www.amazon.co.jp/dp/B094R8KF9V?tag=umadapakara11-22",
            imageUrl: "/images/affiliate/dualsense.jpg",
        },
        {
            title: "Flydigi Vader 4 PRO",
            description: "究極の操作性を誇る多機能コントローラー。",
            badge: "プロ仕様",
            price: "¥10,404",
            link: "https://www.amazon.co.jp/dp/B0D9VBBFDR?tag=umadapakara11-22",
            imageUrl: "/images/affiliate/flydigi.jpg",
        }
    ],
    gameDetail: {
        banner: {
            title: "REDMAGIC 11 Pro【日本公式】",
            description: "冷却ファン内蔵、最強のゲーミング体験をその手に。",
            badge: "最強スマホ",
            price: "¥129,800",
            link: "https://amzn.to/409mm6T",
            imageUrl: "/images/affiliate/redmagic.jpg",
        },
        sidebar: {
            title: "iPad (第10世代)",
            description: "創作もプレイも、この一台。究極のモバイルツール。",
            badge: "PICK UP",
            link: "https://amzn.to/4ucimQF",
            price: "¥58,800",
            imageUrl: "/images/affiliate/ipad.jpg",
        }
    }
};

// 週次ローテーション用の商品プール (20個程度用意しておく)
const TRENDING_POOL = [
    {
        title: "Razer Viper V3 Pro",
        description: "54gの超軽量設計、次世代の35Kセンサー搭載。プロゲーマー愛用率No.1マウス。",
        badge: "2025トレンド",
        price: "¥26,480",
        link: "https://amzn.to/4unynTW",
        imageUrl: "/images/affiliate/viper_v3.jpg",
    },
    {
        title: "SteelSeries Apex Pro TKL",
        description: "世界最速レベルのレスポンスを実現する可変アクチュエーションスイッチ。",
        badge: "最強キーボード",
        price: "¥24,800",
        link: "https://amzn.to/4b5P6DJ",
        imageUrl: "/images/affiliate/apex_pro.jpg",
    },
    {
        title: "Logicool G PRO X SUPERLIGHT 2",
        description: "8Kポーリングレート対応に進化したワイヤレスマウスの完成形。",
        badge: "人気",
        price: "¥20,727",
        link: "https://amzn.to/3OX8Tg7",
        imageUrl: "/images/affiliate/superlight.jpg",
    },
    {
        title: "Razer Huntsman V3 Pro TKL",
        description: "ラピッドトリガー搭載のアナログ光スイッチ。競技シーンに最適なスピード。",
        badge: "プロ仕様",
        price: "¥36,980",
        link: "https://amzn.to/4sh7TC7",
        imageUrl: "/images/affiliate/huntsman.jpg",
    },
    {
        title: "HyperX Cloud III",
        description: "快適な着け心地と高精細な音質。耐久性抜群のベストセラーヘッドセット。",
        badge: "快適設計",
        price: "¥12,000",
        link: "https://amzn.to/4lvGdHi",
        imageUrl: "/images/affiliate/cloud3.jpg",
    },
    {
        title: "Elgato Stream Deck MK.2",
        description: "15個のカスタムキーで操作を効率化。ライブ配信や作業の必須アイテム。",
        badge: "配信ツール",
        price: "¥20,680",
        link: "https://amzn.to/3OWWzwm",
        imageUrl: "/images/affiliate/stream_deck.jpg",
    },
    {
        title: "Logicool G915 TKL (G913)",
        description: "薄型メカニカルスイッチの最高峰。高級感のあるアルミニウム外装。",
        badge: "ハイエンド",
        price: "¥23,000",
        link: "https://amzn.to/4sGUC5G",
        imageUrl: "/images/affiliate/g915.jpg",
    },
    {
        title: "Razer Wolverine V2 Pro",
        description: "競技向けワイヤレスコントローラー。超高速連射とカスタマイズ性が魅力。",
        badge: "ガチ勢向け",
        price: "¥24,800",
        link: "https://amzn.to/4s7nPqz",
        imageUrl: "/images/affiliate/wolverine.jpg",
    },
    {
        title: "ASUS ROG Swift 360Hz",
        description: "360Hzの超高リフレッシュレートでeスポーツの頂点を目指す。",
        badge: "究極",
        price: "¥89,800",
        link: "https://amzn.to/4s8LcQB",
        imageUrl: "/images/affiliate/rog_swift.jpg",
    },
    {
        title: "Sony INZONE H9",
        description: "ノイズキャンセリング搭載、立体音響ゲーミングヘッドセット。",
        badge: "没入感",
        price: "¥32,000",
        link: "https://amzn.to/4upYucN",
        imageUrl: "/images/affiliate/inzone.jpg",
    }
];

// その週のトレンドを取得する関数
// 1970年からの経過週をシードとして、1週間同じアイテム群を返す
export function getWeeklyTrendingAds(count = 5) {
    // 日本標準時の現在のタイムスタンプ
    const now = new Date();
    // 1週間のミリ秒 = 7 * 24 * 60 * 60 * 1000
    const WEEK_MS = 604800000;

    // 現在の週番号 (UNIXエポックからの経過週)
    const weekNumber = Math.floor(now.getTime() / WEEK_MS);

    // 週番号をシードにした簡単な擬似乱数ジェネレータ
    const randomSeed = (seed) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    // 配列のコピーを作成してシャッフル
    const shuffled = [...TRENDING_POOL].sort((a, b) => {
        // 各アイテムの一意性を保ちつつ週番号を絡める
        const seedA = weekNumber + a.title.length;
        const seedB = weekNumber + b.title.length;
        return randomSeed(seedA) - randomSeed(seedB);
    });

    return shuffled.slice(0, count);
}
