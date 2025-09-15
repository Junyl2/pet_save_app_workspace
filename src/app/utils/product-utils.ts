import type { Product } from "@/app/components/types/refund";

export function createProductFromParams(
  searchParams: URLSearchParams
): Product | null {
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const price = searchParams.get("price");
  const originalPrice = searchParams.get("originalPrice");
  const brand = searchParams.get("brand");
  const image = searchParams.get("image");

  if (!id || !name || !price || !brand || !image) return null;

  return {
    id,
    name,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    brand,
    image,
  };
}

export function getMockProducts(passedProduct?: Product): Product[] {
  return passedProduct
    ? [passedProduct]
    : [
        {
          id: "1",
          name: "고양이 뽀짝한 간식 플러스 60g",
          price: 24000,
          originalPrice: 40000,
          brand: "굿펠러스",
          image: "/api/placeholder/60/60",
        },
        {
          id: "2",
          name: "뉴트리나 프라임켓 블루 20kg 고양이사료",
          price: 32000,
          originalPrice: 46000,
          brand: "굿펠러스",
          image: "/api/placeholder/60/60",
        },
      ];
}
