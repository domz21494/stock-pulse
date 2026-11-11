import Dashboard from "@/components/Dashboard";
import { FEATURED } from "@/lib/market/catalog";

export default function Home() {
  return <Dashboard symbols={FEATURED} />;
}
