import { getProviders, getNews, getPapers } from "@/lib/queries";
import HomeClient from "./HomeClient";

const featuredIds = ["openai", "anthropic", "deepseek", "google", "mistral", "alibaba"];

export default async function Home() {
  const [allProviders, allNews, allPapers] = await Promise.all([
    getProviders(),
    getNews(3),
    getPapers(4),
  ]);

  const featuredProviders = allProviders.filter((p) =>
    featuredIds.includes(p.id)
  );

  return (
    <HomeClient
      featuredProviders={featuredProviders}
      latestNews={allNews}
      recentPapers={allPapers}
      totalProviders={allProviders.length}
      totalNews={allNews.length}
      totalPapers={allPapers.length}
    />
  );
}
