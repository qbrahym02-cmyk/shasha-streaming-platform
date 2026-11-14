// يولّد بيانات العرض الثابتة من قاعدة البيانات → src/lib/demo-data.json
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const titles = await prisma.title.findMany({
    include: {
      genres: { include: { genre: true } },
      episodes: { orderBy: [{ season: 'asc' }, { number: 'asc' }] },
    },
  });

  const genres = await prisma.genre.findMany({ orderBy: { slug: 'asc' } });
  const plans = await prisma.plan.findMany({ orderBy: { months: 'asc' } });

  const out = {
    generatedAt: new Date().toISOString(),
    titles: titles.map((t: any) => ({
      id: t.id,
      slug: t.slug,
      type: t.type,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      synopsisAr: t.synopsisAr,
      synopsisEn: t.synopsisEn,
      poster: t.poster,
      backdrop: t.backdrop,
      year: t.year,
      ageRating: t.ageRating,
      score: t.score,
      durationMin: t.durationMin,
      sourceType: t.sourceType,
      sourceUrl: t.sourceUrl,
      fallbackUrl: t.fallbackUrl,
      isPremium: t.isPremium,
      releaseState: t.releaseState,
      featured: t.featured,
      trending: t.trending,
      genres: t.genres.map((g: any) => ({ slug: g.genre.slug, nameAr: g.genre.nameAr, nameEn: g.genre.nameEn })),
      episodes: t.episodes.map((e: any) => ({
        id: e.id,
        season: e.season,
        number: e.number,
        nameAr: e.nameAr,
        nameEn: e.nameEn,
        durationMin: e.durationMin,
        sourceType: e.sourceType,
        sourceUrl: e.sourceUrl,
        fallbackUrl: e.fallbackUrl,
        isPremium: e.isPremium,
      })),
    })),
    genres: genres.map((g: any) => ({ slug: g.slug, nameAr: g.nameAr, nameEn: g.nameEn })),
    plans: plans.map((p: any) => ({
      code: p.code,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      priceDzd: p.priceDzd,
      originalDzd: p.originalDzd,
      months: p.months,
      featuresAr: JSON.parse(p.featuresAr || '[]'),
      featuresEn: JSON.parse(p.featuresEn || '[]'),
      highlight: p.highlight,
    })),
  };

  fs.writeFileSync('/home/z/my-project/src/lib/demo-data.json', JSON.stringify(out, null, 1));
  console.log(`demo-data.json: ${out.titles.length} titles, ${out.genres.length} genres, ${out.plans.length} plans`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
