import { getPapers } from "@/lib/queries";
import PapersClient from "./PapersClient";

export default async function PapersPage() {
  const papers = await getPapers();
  return <PapersClient papers={papers} />;
}
