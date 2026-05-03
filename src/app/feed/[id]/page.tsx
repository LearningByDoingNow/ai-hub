import { getNews } from "@/lib/queries";
import FeedClient from "./FeedClient";

export default async function FeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allNews = await getNews();
  // Filter news that belong to sources bound to this module
  // For now show all news (modules will filter by source binding later)
  return <FeedClient moduleId={id} newsItems={allNews} />;
}
