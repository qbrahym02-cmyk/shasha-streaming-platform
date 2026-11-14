// بيانات منصة شاشة الأولية — تشغيل: bun scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const P = (slug: string) => `/posters/${slug}.jpg`;
const B = (slug: string) => `/backdrops/${slug}.jpg`;

// روابط عامة معروفة وموثقة (HLS) — جميعها مُتحقق منها + نسخ احتياطية لنفس المحتوى عبر CDN مختلف
const SRC = {
  bunny: {
    type: 'hls',
    url: 'https://stream.mux.com/v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM.m3u8',
    fb: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  tos: {
    type: 'hls',
    url: 'https://test-streams.mux.dev/tos_ismc/main.m3u8',
    fb: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  },
  bipbop: {
    type: 'hls',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    fb: 'https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8',
  },
  quality: {
    type: 'hls',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    fb: 'https://stream.mux.com/v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM.m3u8',
  },
};

const genres = [
  { slug: 'action', nameAr: 'أكشن', nameEn: 'Action' },
  { slug: 'drama', nameAr: 'دراما', nameEn: 'Drama' },
  { slug: 'comedy', nameAr: 'كوميديا', nameEn: 'Comedy' },
  { slug: 'scifi', nameAr: 'خيال علمي', nameEn: 'Sci-Fi' },
  { slug: 'fantasy', nameAr: 'فانتازيا', nameEn: 'Fantasy' },
  { slug: 'romance', nameAr: 'رومانسي', nameEn: 'Romance' },
  { slug: 'mystery', nameAr: 'غموض', nameEn: 'Mystery' },
  { slug: 'thriller', nameAr: 'إثارة', nameEn: 'Thriller' },
  { slug: 'historical', nameAr: 'تاريخي', nameEn: 'Historical' },
  { slug: 'family', nameAr: 'عائلي', nameEn: 'Family' },
  { slug: 'anime', nameAr: 'أنمي', nameEn: 'Anime' },
  { slug: 'adventure', nameAr: 'مغامرات', nameEn: 'Adventure' },
  { slug: 'animation', nameAr: 'رسوم متحركة', nameEn: 'Animation' },
  { slug: 'tech', nameAr: 'تقني', nameEn: 'Tech' },
];

type SeedTitle = {
  slug: string;
  type: 'MOVIE' | 'SERIES';
  titleAr: string;
  titleEn: string;
  synopsisAr: string;
  synopsisEn: string;
  poster: string;
  backdrop?: string;
  year: number;
  ageRating: string;
  score: number;
  durationMin?: number;
  sourceType?: string;
  sourceUrl?: string;
  fallbackUrl?: string;
  isPremium?: boolean;
  releaseState?: 'released' | 'coming_soon';
  featured?: boolean;
  trending?: number;
  genres: string[];
  episodes?: {
    number: number;
    nameAr: string;
    nameEn: string;
    durationMin: number;
    sourceType: string;
    sourceUrl: string;
    fallbackUrl: string;
    isPremium: boolean;
  }[];
};

const titles: SeedTitle[] = [
  // ===== أعمال حقيقية قابلة للتشغيل (محتوى مفتوح / تجريبي قانوني) =====
  {
    slug: 'thil-al-sahra',
    type: 'SERIES',
    titleAr: 'ظل الصحراء',
    titleEn: 'Desert Shadow',
    synopsisAr:
      'في قلب الصحراء الكبرى، يتابع رجل غامض أثراً قديماً يقوده إلى قرية نائمة تخفي سراً يمتد لقرون. دراما تشويقية عن الذاكرة والانتقام والرمال التي لا تنسى.',
    synopsisEn:
      'Deep in the great desert, a mysterious man follows an old trail leading to a sleepy village hiding a centuries-old secret. A suspense drama about memory, revenge, and sand that never forgets.',
    poster: P('thil-al-sahra'),
    backdrop: B('thil-al-sahra'),
    year: 2025,
    ageRating: '+16',
    score: 9.1,
    durationMin: 45,
    releaseState: 'coming_soon',
    featured: true,
    trending: 1,
    genres: ['drama', 'mystery', 'thriller'],
  },
  {
    slug: 'saif-al-fajr',
    type: 'SERIES',
    titleAr: 'سيف الفجر',
    titleEn: 'Dawn Blade',
    synopsisAr:
      'شاب يتيم يرث سيفاً يلمع عند الفجر فقط، فيدخل عالماً من الصيادين والأرواح القديمة ليكشف حقيقة مقتل عائلته. أنمي مليء بالمعارك والمشاعر.',
    synopsisEn:
      'An orphan inherits a blade that glows only at dawn, pulling him into a world of hunters and ancient spirits as he uncovers the truth behind his family. An anime full of battles and heart.',
    poster: P('saif-al-fajr'),
    backdrop: B('saif-al-fajr'),
    year: 2025,
    ageRating: '+13',
    score: 8.8,
    durationMin: 24,
    releaseState: 'coming_soon',
    featured: true,
    trending: 2,
    genres: ['anime', 'action', 'fantasy'],
  },
  {
    slug: 'tears-of-steel',
    type: 'MOVIE',
    titleAr: 'دموع الفولاذ',
    titleEn: 'Tears of Steel',
    synopsisAr:
      'في أمستردام المستقبل، تحاول مجموعة من المحاربين والعلماء إنقاذ العالم من آلات ذكية سيطرت على المدينة، بينما تتشابك قصة حب قديمة بمصير البشرية. فيلم خيال علمي مفتوح المصدر من مؤسسة Blender.',
    synopsisEn:
      'In a future Amsterdam, warriors and scientists fight to save the world from machines that took over the city, while an old love story intertwines with the fate of humanity. An open-source sci-fi film by the Blender Foundation.',
    poster: P('tears-of-steel'),
    backdrop: B('tears-of-steel'),
    year: 2012,
    ageRating: '+13',
    score: 7.9,
    durationMin: 12,
    sourceType: SRC.tos.type,
    sourceUrl: SRC.tos.url,
    fallbackUrl: SRC.tos.fb,
    isPremium: true,
    featured: true,
    trending: 3,
    genres: ['scifi', 'action'],
  },
  {
    slug: 'sintel',
    type: 'MOVIE',
    titleAr: 'سينتل',
    titleEn: 'Sintel',
    synopsisAr:
      'محاربة شابة تعبر الجبال المتجمدة والصحاري بحثاً عن تنّين صغير أنقذته يوماً وصار صديقها الوحيد. رحلة ملحمية عن الوفاء والفقد. فيلم قصير مفتوح المصدر حائز على جوائز.',
    synopsisEn:
      'A lone young warrior crosses frozen mountains and deserts in search of a baby dragon she once rescued. An epic journey about loyalty and loss. An award-winning open-source short film.',
    poster: P('sintel'),
    backdrop: B('sintel'),
    year: 2010,
    ageRating: '+13',
    score: 8.4,
    durationMin: 15,
    releaseState: 'coming_soon',
    trending: 4,
    genres: ['fantasy', 'adventure', 'animation'],
  },
  {
    slug: 'big-buck-bunny',
    type: 'MOVIE',
    titleAr: 'الأرنب العملاق',
    titleEn: 'Big Buck Bunny',
    synopsisAr:
      'أرنب طيب القلب ضخم الجثة يقرر الانتقام بطريقته الكوميدية من ثلاثة قوارض مزعجة تقلب حياته الهادئة في الغابة. فيلم عائلي كوميدي من استوديو Blender المفتوح.',
    synopsisEn:
      'A good-natured giant rabbit decides to take hilarious revenge on three bullying rodents who disturb his peaceful forest life. A family comedy from the open Blender Studio.',
    poster: P('big-buck-bunny'),
    year: 2008,
    ageRating: 'للجميع',
    score: 8.2,
    durationMin: 10,
    sourceType: SRC.bunny.type,
    sourceUrl: SRC.bunny.url,
    fallbackUrl: SRC.bunny.fb,
    trending: 5,
    genres: ['comedy', 'family', 'animation'],
  },
  {
    slug: 'quality-lab',
    type: 'MOVIE',
    titleAr: 'مختبر الجودات',
    titleEn: 'Quality Lab',
    synopsisAr:
      'جرّب بنفسك خمسة مستويات جودة (من 240p حتى 1080p) لنفس الفيلم: افتح قائمة الجودة في المشغل وبدّل بينها وراقب الفرق لحظياً. عرض تفاعلي لتقنية البث المتكيف.',
    synopsisEn:
      'Try five quality levels (240p to 1080p) of the same film: open the quality menu in the player, switch levels and watch the difference live. An interactive adaptive-streaming demo.',
    poster: P('big-buck-bunny'),
    year: 2024,
    ageRating: 'للجميع',
    score: 7.7,
    durationMin: 10,
    sourceType: SRC.quality.type,
    sourceUrl: SRC.quality.url,
    fallbackUrl: SRC.quality.fb,
    genres: ['tech', 'family'],
  },
  {
    slug: 'elephants-dream',
    type: 'MOVIE',
    titleAr: 'حلم الفيلة',
    titleEn: "Elephants' Dream",
    synopsisAr:
      'رجلان يجولان في عالم آلي لا نهائي من الممرات والتروس الغريبة، بينما يكتشف أحدهما أن هذا العالم قد لا يكون حقيقياً. تجربة سريالية مبكرة في تاريخ الأفلام المفتوحة المصدر.',
    synopsisEn:
      "Two men wander a strange infinite machine world of corridors and gears, while one begins to suspect the world may not be real. A surreal milestone of open-source cinema.",
    poster: P('elephants-dream'),
    year: 2006,
    ageRating: '+13',
    score: 7.1,
    durationMin: 11,
    releaseState: 'coming_soon',
    genres: ['fantasy', 'mystery', 'animation'],
  },
  {
    slug: 'bipbop-showcase',
    type: 'MOVIE',
    titleAr: 'عرض المشغل التقني',
    titleEn: 'BipBop Showcase',
    synopsisAr:
      'عرض تقني يُبرهن على قدرات المشغل: جودات متعددة تتكيف مع سرعة إنترنتك، مسارات صوتية بلغات مختلفة، وترجمة مدمجة. جرّب تبديل الجودة والترجمة والصوت من إعدادات المشغل!',
    synopsisEn:
      'A technical showcase of the player: adaptive qualities, multiple audio tracks and embedded subtitles. Try switching quality, subtitles and audio from the player settings!',
    poster: P('bipbop-showcase'),
    year: 2024,
    ageRating: 'للجميع',
    score: 7.5,
    durationMin: 30,
    sourceType: SRC.bipbop.type,
    sourceUrl: SRC.bipbop.url,
    fallbackUrl: SRC.bipbop.fb,
    genres: ['tech'],
  },
  {
    slug: 'open-worlds',
    type: 'SERIES',
    titleAr: 'عوالم مفتوحة المصدر',
    titleEn: 'Open Worlds',
    synopsisAr:
      'أنثولوجيا تجمع أبرز تجارب البث المفتوحة في موسم واحد: من غابة الأرنب العملاق إلى معارك دموع الفولاذ وعرض المشغل متعدد اللغات. كل حلقة عالم مختلف، والحلقة الأولى مجانية للجميع.',
    synopsisEn:
      'An anthology bringing together the best open streaming experiments in one season: from the Big Buck Bunny forest to Tears of Steel battles and the multilingual player showcase. Every episode is a different world — the first episode is free for everyone.',
    poster: P('open-worlds'),
    year: 2024,
    ageRating: '+13',
    score: 8.6,
    trending: 6,
    genres: ['animation', 'adventure', 'scifi'],
    episodes: [
      { number: 1, nameAr: 'الأرنب العملاق', nameEn: 'Big Buck Bunny', durationMin: 10, sourceType: SRC.bunny.type, sourceUrl: SRC.bunny.url, fallbackUrl: SRC.bunny.fb, isPremium: false },
      { number: 2, nameAr: 'مختبر الجودات', nameEn: 'Quality Lab', durationMin: 10, sourceType: SRC.quality.type, sourceUrl: SRC.quality.url, fallbackUrl: SRC.quality.fb, isPremium: true },
      { number: 3, nameAr: 'دموع الفولاذ', nameEn: 'Tears of Steel', durationMin: 12, sourceType: SRC.tos.type, sourceUrl: SRC.tos.url, fallbackUrl: SRC.tos.fb, isPremium: true },
      { number: 4, nameAr: 'عرض المشغل التقني', nameEn: 'Player Showcase', durationMin: 30, sourceType: SRC.bipbop.type, sourceUrl: SRC.bipbop.url, fallbackUrl: SRC.bipbop.fb, isPremium: true },
    ],
  },

  // ===== كتالوج درامي (قريباً) =====
  {
    slug: 'layali-alger',
    type: 'SERIES',
    titleAr: 'ليالي الجزائر',
    titleEn: 'Algiers Nights',
    synopsisAr:
      'عائلة جزائرية تجتمع كل صيف في بيت العائلة العتيق فوق البحر، حيث تتقاطع أجيال ثلاثة وحكايات لم تُروَ من قبل. دراما عائلية دافئة عن الجذور والغفران.',
    synopsisEn:
      'An Algerian family gathers every summer in the old family house above the sea, where three generations and untold stories collide. A warm family drama about roots and forgiveness.',
    poster: P('layali-alger'),
    year: 2024,
    ageRating: '+13',
    score: 8.3,
    durationMin: 42,
    releaseState: 'coming_soon',
    genres: ['drama', 'family'],
  },
  {
    slug: 'qilat-al-riyah',
    type: 'SERIES',
    titleAr: 'قلعة الرياح',
    titleEn: 'Castle of Winds',
    synopsisAr:
      'في القرن السادس عشر، تقاوم قلعةٌ عزلاء في الأوراس حصاراً طويلاً، وتولد بين أسوارها قصة حب محرمة تهدد مصير الجميع. ملحمة تاريخية بأبعاد بشرية.',
    synopsisEn:
      'In the 16th century, an isolated castle in the Aurès resists a long siege, and a forbidden love story grows within its walls, threatening everyone. An epic with a deeply human core.',
    poster: P('qilat-al-riyah'),
    year: 2025,
    ageRating: '+16',
    score: 8.9,
    durationMin: 50,
    releaseState: 'coming_soon',
    isPremium: true,
    genres: ['historical', 'drama', 'action'],
  },
  {
    slug: 'al-wisam-al-maksour',
    type: 'MOVIE',
    titleAr: 'الوسام المكسور',
    titleEn: 'The Broken Medal',
    synopsisAr:
      'ضابط قوات خاصة يُطرد ظلماً بعد عملية سرية، فيقرر اقتفاء الحقيقة بنفسه ليجد نفسه في قلب مؤامرة أكبر من وطنه كله. أكشن متواصل بلا هوادة.',
    synopsisEn:
      'A special forces officer is wrongfully discharged after a covert operation and sets out to find the truth, only to land in the middle of a conspiracy bigger than his country. Relentless action.',
    poster: P('al-wisam-al-maksour'),
    year: 2025,
    ageRating: '+16',
    score: 8.1,
    durationMin: 118,
    releaseState: 'coming_soon',
    genres: ['action', 'thriller'],
  },
  {
    slug: 'tareeq-al-hareer',
    type: 'SERIES',
    titleAr: 'طريق الحرير',
    titleEn: 'Silk Road',
    synopsisAr:
      'قافلة تجار تخرج من سمرقند نحو الغرب، تحمل بضائع ثمينة وأسراراً أثمن. مغامرة ملحمية عن الثقة والخيانة على أشهر طرق التاريخ.',
    synopsisEn:
      'A merchant caravan leaves Samarkand heading west, carrying precious goods and even more precious secrets. An epic adventure about trust and betrayal on history\u2019s most famous road.',
    poster: P('tareeq-al-hareer'),
    year: 2024,
    ageRating: '+13',
    score: 8.5,
    durationMin: 46,
    releaseState: 'coming_soon',
    genres: ['adventure', 'drama', 'historical'],
  },
  {
    slug: 'hams-al-janoub',
    type: 'MOVIE',
    titleAr: 'همس الجنوب',
    titleEn: 'Whispers of the South',
    synopsisAr:
      'طبيبة تعود إلى بلدتها في الجنوب لحضور جنازة والدها، فتلتقي بحبها القديم وسط بساتين البرتقال، وتضطر للاختيار بين حياتين. رومانسي هادئ عميق.',
    synopsisEn:
      'A doctor returns to her southern hometown for her father\u2019s funeral and meets her old love among the orange groves, forced to choose between two lives. A quiet, profound romance.',
    poster: P('hams-al-janoub'),
    year: 2023,
    ageRating: '+13',
    score: 7.8,
    durationMin: 104,
    releaseState: 'coming_soon',
    genres: ['romance', 'drama'],
  },
  {
    slug: 'madinat-al-nujum',
    type: 'SERIES',
    titleAr: 'مدينة النجوم',
    titleEn: 'City of Stars',
    synopsisAr:
      'في مدينة معلقة تحت سديم بنفسجي، تكسب فتاة رسّامة قدرة على رؤية أحلام الآخرين، فتكتشف أن المدينة كلها تحلم حلماً واحداً مشتركاً. أنمي خيال علمي بصري مذهل.',
    synopsisEn:
      'In a city suspended beneath a purple nebula, a young painter gains the ability to see other people\u2019s dreams — and discovers the whole city shares one common dream. A visually stunning sci-fi anime.',
    poster: P('madinat-al-nujum'),
    year: 2024,
    ageRating: '+13',
    score: 8.7,
    durationMin: 24,
    releaseState: 'coming_soon',
    genres: ['anime', 'scifi', 'fantasy'],
  },
  {
    slug: 'rihlat-al-akhira',
    type: 'MOVIE',
    titleAr: 'الرحلة الأخيرة',
    titleEn: 'The Last Ride',
    synopsisAr:
      'فتاة وروبوت قديم يركبان قطاراً لا يتوقف عبر حقل نجوم لا نهائي، في طريقهما إلى وداع واحد أخير. فيلم أنمي قصير عن الحب والفقد والذكريات.',
    synopsisEn:
      'A girl and an old robot board a train that never stops, crossing an infinite starfield toward one final farewell. A short anime film about love, loss and memory.',
    poster: P('rihlat-al-akhira'),
    year: 2025,
    ageRating: 'للجميع',
    score: 9.0,
    durationMin: 96,
    releaseState: 'coming_soon',
    isPremium: true,
    genres: ['anime', 'drama'],
  },
  {
    slug: 'the-last-signal',
    type: 'MOVIE',
    titleAr: 'الإشارة الأخيرة',
    titleEn: 'The Last Signal',
    synopsisAr:
      'رائد فضاء وحيد على كوكب مهجور يلتقط إشارة غامضة تعرف اسمه. كلما اقترب من مصدرها، اكتشف أن العودة لم تعد خياراً. خيال علمي نفسي مقلق.',
    synopsisEn:
      'A lone astronaut on an abandoned planet picks up a mysterious signal that knows his name. The closer he gets to its source, the clearer it becomes that going home is no longer an option. A chilling psychological sci-fi.',
    poster: P('the-last-signal'),
    year: 2026,
    ageRating: '+16',
    score: 8.4,
    durationMin: 112,
    releaseState: 'coming_soon',
    genres: ['scifi', 'mystery', 'thriller'],
  },
  {
    slug: 'midnight-runners',
    type: 'MOVIE',
    titleAr: 'عدّاؤو منتصف الليل',
    titleEn: 'Midnight Runners',
    synopsisAr:
      'شابان يشهدان جريمة في مدينة مطرية بمنتصف الليل، فيجدان نفسيهما مطاردين ومطارِدين في سباق لا يتوقف حتى الفجر. إثارة بوتيرة قلب سريعة.',
    synopsisEn:
      'Two friends witness a crime in a rainy city at midnight and find themselves hunted and hunting in a race that won\u2019t stop until dawn. Fast-paced heart-pounding thriller.',
    poster: P('midnight-runners'),
    year: 2024,
    ageRating: '+16',
    score: 7.9,
    durationMin: 99,
    releaseState: 'coming_soon',
    genres: ['thriller', 'action'],
  },
  {
    slug: 'echoes-of-tomorrow',
    type: 'SERIES',
    titleAr: 'صدى الغد',
    titleEn: 'Echoes of Tomorrow',
    synopsisAr:
      'عالمة تلتقي بنسخة هولوغرامية من نفسها قادمة من المستقبل، تكشف لها يوماً واحداً فقط قبل وقوع كارثة. هل يكفي يوم واحد لتغيير كل شيء؟',
    synopsisEn:
      'A scientist meets a holographic copy of herself from the future, revealing one single day before a catastrophe. Is one day enough to change everything?',
    poster: P('echoes-of-tomorrow'),
    year: 2025,
    ageRating: '+16',
    score: 8.6,
    durationMin: 44,
    releaseState: 'coming_soon',
    isPremium: true,
    genres: ['scifi', 'mystery', 'drama'],
  },
];

const plans = [
  {
    code: 'monthly',
    nameAr: 'شهر واحد',
    nameEn: '1 Month',
    priceDzd: 499,
    originalDzd: null,
    months: 1,
    featuresAr: JSON.stringify(['بدون إعلانات', 'محتوى VIP حصري', 'جودة حتى 1080p', 'إلغاء في أي وقت']),
    featuresEn: JSON.stringify(['No ads', 'Exclusive VIP content', 'Up to 1080p quality', 'Cancel anytime']),
    highlight: false,
  },
  {
    code: 'quarterly',
    nameAr: '3 أشهر',
    nameEn: '3 Months',
    priceDzd: 1199,
    originalDzd: 1497,
    months: 3,
    featuresAr: JSON.stringify(['بدون إعلانات', 'محتوى VIP حصري', 'جودة حتى 4K', 'تنزيل للمشاهدة دون اتصال', 'شاشتان في وقت واحد', 'وفر 20%']),
    featuresEn: JSON.stringify(['No ads', 'Exclusive VIP content', 'Up to 4K quality', 'Offline downloads', '2 screens at once', 'Save 20%']),
    highlight: true,
  },
  {
    code: 'yearly',
    nameAr: 'سنة كاملة',
    nameEn: '12 Months',
    priceDzd: 3990,
    originalDzd: 5988,
    months: 12,
    featuresAr: JSON.stringify(['كل مزايا الباقة السابقة', 'إصدارات مبكرة قبل الجميع', 'جودة حتى 4K', 'تنزيل غير محدود', '4 شاشات في وقت واحد', 'وفر 33%']),
    featuresEn: JSON.stringify(['All previous benefits', 'Early releases', 'Up to 4K quality', 'Unlimited downloads', '4 screens at once', 'Save 33%']),
    highlight: false,
  },
];

async function main() {
  console.log('Seeding...');

  // التصنيفات
  for (const g of genres) {
    await prisma.genre.upsert({ where: { slug: g.slug }, update: g, create: g });
  }
  const genreMap = new Map((await prisma.genre.findMany()).map((g) => [g.slug, g.id]));

  // الباقات
  for (const p of plans) {
    await prisma.plan.upsert({ where: { code: p.code }, update: p, create: p });
  }

  // الأعمال
  for (const t of titles) {
    const data = {
      slug: t.slug,
      type: t.type,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      synopsisAr: t.synopsisAr,
      synopsisEn: t.synopsisEn,
      poster: t.poster,
      backdrop: t.backdrop ?? null,
      year: t.year,
      ageRating: t.ageRating,
      score: t.score,
      durationMin: t.durationMin ?? null,
      sourceType: t.sourceType ?? null,
      sourceUrl: t.sourceUrl ?? null,
      fallbackUrl: t.fallbackUrl ?? null,
      isPremium: t.isPremium ?? false,
      releaseState: t.releaseState ?? 'released',
      featured: t.featured ?? false,
      trending: t.trending ?? null,
    };
    const title = await prisma.title.upsert({ where: { slug: t.slug }, update: data, create: data });

    // ربط التصنيفات
    await prisma.titleGenre.deleteMany({ where: { titleId: title.id } });
    for (const gslug of t.genres) {
      const gid = genreMap.get(gslug);
      if (gid) await prisma.titleGenre.create({ data: { titleId: title.id, genreId: gid } });
    }

    // الحلقات
    if (t.episodes?.length) {
      await prisma.episode.deleteMany({ where: { titleId: title.id } });
      for (const e of t.episodes) {
        await prisma.episode.create({
          data: { ...e, titleId: title.id, season: 1 },
        });
      }
    }
  }

  // حسابات تجريبية
  const demoUsers = [
    { email: 'demo@shasha.app', name: 'مشترك VIP تجريبي', vipDays: 30 },
    { email: 'free@shasha.app', name: 'مستخدم مجاني تجريبي', vipDays: 0 },
  ];
  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { vipUntil: u.vipDays ? new Date(Date.now() + u.vipDays * 86400000) : null },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: hashPassword('demo1234'),
        vipUntil: u.vipDays ? new Date(Date.now() + u.vipDays * 86400000) : null,
      },
    });
  }

  const counts = {
    titles: await prisma.title.count(),
    episodes: await prisma.episode.count(),
    genres: await prisma.genre.count(),
    plans: await prisma.plan.count(),
    users: await prisma.user.count(),
  };
  console.log('Done:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
