/**
 * アフィリエイト広告のカテゴリ定義
 * CREATOR: 開発者向け機材
 * GEAR: ゲーミングデバイス
 * GENRE_ACTION: アクションゲーム関連
 * GENRE_RPG: RPG関連
 * GENRE_CASUAL: カジュアルゲーム関連
 * LIFESTYLE: 飲料・家具などのライフスタイル
 */
export type AffiliateCategory = "CREATOR" | "GEAR" | "GENRE_ACTION" | "GENRE_RPG" | "GENRE_CASUAL" | "LIFESTYLE";

/**
 * 広告データのインターフェース
 */
export interface AffiliateAd {
    title: string;       // 商品名
    description: string; // 商品説明
    badge?: string;      // 「おすすめ」などのバッジテキスト
    price: string;       // 価格
    link: string;        // アフィリエイトリンク
    imageUrl: string;    // 商品画像のパス
    category?: AffiliateCategory; // カテゴリ
}

/**
 * 固定枠用のアドバタイズ設定
 * サイドバーやゲーム詳細画面の特定の場所に表示される広告。
 */
export const AFFILIATE_ADS: { sidebar: AffiliateAd[], gameDetail: { banner: AffiliateAd, sidebar: AffiliateAd } } = {
    sidebar: [
        {
            title: "iPad (第10世代)",
            description: "創作もプレイも、この一台。究極のモバイルツール。",
            badge: "PICK UP",
            price: "¥58,800",
            link: "https://amzn.to/4ucimQF",
            imageUrl: "/images/affiliate/ipad.jpg",
            category: "CREATOR"
        },
        {
            title: "Logicool G PRO 2 LIGHTSPEED",
            description: "プロが選ぶ、超軽量ワイヤレスマウスの頂点。",
            badge: "おすすめ",
            price: "¥11,970",
            link: "https://amzn.to/4raGyQE",
            imageUrl: "/images/affiliate/gpro2.jpg",
            category: "GEAR"
        },
        {
            title: "G PRO ゲーミングキーボード",
            description: "競技向け、コンパクトなテンキーレスデザイン。",
            badge: "人気",
            price: "¥10,480",
            link: "https://amzn.to/4rS8KJa",
            imageUrl: "/images/affiliate/gpro_kb.jpg",
            category: "GEAR"
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
            category: "GEAR"
        },
        sidebar: {
            title: "iPad (第10世代)",
            description: "創作もプレイも、この一台。究極のモバイルツール。",
            badge: "PICK UP",
            link: "https://amzn.to/4ucimQF",
            price: "¥58,800",
            imageUrl: "/images/affiliate/ipad.jpg",
            category: "CREATOR"
        }
    }
};

/**
 * 動的に抽出される商品プール
 */
const PRODUCT_POOL: AffiliateAd[] = [
    // CREATOR: 開発効率を上げるデバイス
    {
        title: "Elgato Stream Deck MK.2",
        description: "15個のカスタムキーで制作を効率化。AIプロンプトの呼び出しにも最適。",
        badge: "クリエイター必携",
        price: "¥20,680",
        link: "https://amzn.to/3OWWzwm",
        imageUrl: "/images/affiliate/stream_deck.jpg",
        category: "CREATOR"
    },
    {
        title: "TourBox Elite",
        description: "クリエイティブ作業を加速させる左手デバイス。カスタムマクロで爆速開発。",
        badge: "作業効率UP",
        price: "¥39,960",
        link: "https://amzn.to/40e8G6U",
        imageUrl: "/images/affiliate/tourbox.jpg",
        category: "CREATOR"
    },
    // GENRE_ACTION: アクション/FPS向け
    {
        title: "Razer Viper V3 Pro",
        description: "54gの超軽量設計。アクションゲームで最高のエイムを実現。",
        badge: "プロ機材",
        price: "¥26,480",
        link: "https://amzn.to/4unynTW",
        imageUrl: "/images/affiliate/viper_v3.jpg",
        category: "GENRE_ACTION"
    },
    {
        title: "SteelSeries Apex Pro TKL",
        description: "世界最速のレスポンス。競技系ゲームで差をつけるキーボード。",
        badge: "最強反応",
        price: "¥24,800",
        link: "https://amzn.to/4b5P6DJ",
        imageUrl: "/images/affiliate/apex_pro.jpg",
        category: "GENRE_ACTION"
    },
    // GENRE_RPG: 没入感を高める
    {
        title: "Sony INZONE H9",
        description: "立体音響で世界に没入。RPGの壮大な物語を最高の音で。",
        badge: "没入体験",
        price: "¥32,000",
        link: "https://amzn.to/4upYucN",
        imageUrl: "/images/affiliate/inzone.jpg",
        category: "GENRE_RPG"
    },
    {
        title: "ELDEN RING 公式設定画集",
        description: "唯一無二の世界観を凝縮。創作のインスピレーション源に。",
        badge: "ファン必見",
        price: "¥4,400",
        link: "https://amzn.to/4sGUC5G",
        imageUrl: "/images/affiliate/elden_art.jpg",
        category: "GENRE_RPG"
    },
    // LIFESTYLE: 長時間の作業・プレイをサポート
    {
        title: "Herman Miller Embody Chair",
        description: "究極の座り心地。長時間のゲームプレイと制作を支える最高峰の椅子。",
        badge: "一生モノ",
        price: "¥240,000",
        link: "https://amzn.to/4s8LcQB",
        imageUrl: "/images/affiliate/embody.jpg",
        category: "LIFESTYLE"
    },
    {
        title: "Monster Energy 24本セット",
        description: "徹夜のデバッグも、白熱の対戦も。アゲていくならコレ。",
        badge: "定番",
        price: "¥4,800",
        link: "https://amzn.to/4lvGdHi",
        imageUrl: "/images/affiliate/monster.jpg",
        category: "LIFESTYLE"
    }
];

/**
 * カテゴリに基づいて広告をランダムに取得する
 * @param category 対象のカテゴリ
 * @param count 取得する件数
 * @returns 広告データの配列
 */
export function getAdsByCategory(category: AffiliateCategory, count = 1): AffiliateAd[] {
    const filtered = PRODUCT_POOL.filter(ad => ad.category === category);
    return filtered.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * ゲームのタイトルや説明文からジャンル（広告カテゴリ）を判定する
 * 簡易的なキーワードマッチングを行っています。
 * @param title ゲームタイトル
 * @param description ゲームの説明文
 * @returns 判定されたアフィリエイトカテゴリ
 */
export function detectGenre(title: string, description: string): AffiliateCategory {
    const text = (title + " " + description).toLowerCase();
    
    // RPG判定キーワード
    if (text.match(/rpg|ロールプレイング|冒険|物語|クエスト|ストーリー/)) return "GENRE_RPG";
    // アクション/FPS判定キーワード
    if (text.match(/アクション|シューティング|fps|格闘|バトル|対戦|エイム/)) return "GENRE_ACTION";
    // カジュアル判定キーワード
    if (text.match(/パズル|カジュアル|簡単|誰でも|ひまつぶし|ミニゲーム/)) return "GENRE_CASUAL";
    
    // デフォルトは汎用デバイスカテゴリ
    return "GEAR";
}

/**
 * 今週のトレンド広告を取得する（週替わりで内容が固定されるシミュレーション）
 * 日時をシード値として使用し、その週の間は同じ順序でシャッフルされます。
 * @param count 取得件数
 * @returns シャッフルされた広告配列
 */
export function getWeeklyTrendingAds(count = 5) {
    const now = new Date();
    const WEEK_MS = 604800000;
    const weekNumber = Math.floor(now.getTime() / WEEK_MS);
    
    // 簡易的なシード付き乱数
    const randomSeed = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const shuffled = [...PRODUCT_POOL].sort((a, b) => {
        const seedA = weekNumber + a.title.length;
        const seedB = weekNumber + b.title.length;
        return randomSeed(seedA) - randomSeed(seedB);
    });

    return shuffled.slice(0, count);
}
// Clean build signal: 2026-03-13 03:05