import { getNews } from "@/lib/queries";
import NewsClient from "./NewsClient";

export default async function NewsPage() {
  const newsItems = await getNews();
  return <NewsClient newsItems={newsItems} />;
}
