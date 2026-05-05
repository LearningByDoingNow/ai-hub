import { getNews } from "@/lib/queries";
import * as sqlite from "@/lib/sqlite";
import NewsClient from "./NewsClient";

export default async function NewsPage() {
  const newsItems = await getNews();
  const categoryMap = sqlite.getSourceCategoryMap();
  return <NewsClient newsItems={newsItems} categoryMap={categoryMap} />;
}
