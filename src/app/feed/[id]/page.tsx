import { getNews } from "@/lib/queries";
import * as sqlite from "@/lib/sqlite";
import FeedClient from "./FeedClient";

export default async function FeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moduleId = decodeURIComponent(id);

  // Get sources bound to this module
  const sources = sqlite.getSources();
  const boundSources = sources.filter((s) =>
    s.moduleIds.includes(moduleId) && s.enabled
  );
  const sourceNames = new Set(boundSources.map((s) => s.name));

  // Filter news by bound sources, or show empty if no sources bound
  const allNews = await getNews();
  const filtered = sourceNames.size > 0
    ? allNews.filter((n) => sourceNames.has(n.source))
    : [];

  const categoryMap = sqlite.getSourceCategoryMap();
  return <FeedClient moduleId={moduleId} newsItems={filtered} categoryMap={categoryMap} />;
}
