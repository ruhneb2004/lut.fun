import { MARKET_DATA } from "@/app/lib/data";
import ProductDetailsClient from "./ProductDetailsClient";

export async function generateStaticParams() {
  return MARKET_DATA.map((item) => ({
    slug: item.id.toString(),
  }));
}

export default function ProductDetailsPage({ params }: { params: { slug: string } }) {
  return <ProductDetailsClient params={params} />;
}
