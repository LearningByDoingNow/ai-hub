import { getProviders, getNews, getPapers, getHeroStats } from "@/lib/queries";
import HomeClient from "./HomeClient";

const featuredIds = ["openai", "anthropic", "deepseek", "google", "mistral", "alibaba"];

export default async function Home() {
  const [allProviders, latestNews, recentPapers, heroStats] = await Promise.all([
    getProviders(),
    getNews(6),
    getPapers(4),
    getHeroStats(),
  ]);

  const featuredProviders = allProviders.filter((p) =>
    featuredIds.includes(p.id)
  );

  return (
    <HomeClient
      featuredProviders={featuredProviders}
      latestNews={latestNews}
      recentPapers={recentPapers}
      heroStats={heroStats}
    />
  );
}
