import { getProviders } from "@/lib/queries";
import ProvidersClient from "./ProvidersClient";

export default async function ProvidersPage() {
  const providers = await getProviders();
  return <ProvidersClient providers={providers} />;
}
