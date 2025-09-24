import type { Product } from "@/app/components/types/refund";

export function useProductSelection(
  products: Product[],
  selectedItems: string[],
  updateRefundData: (updates: { selectedItems: string[] }) => void
) {
  const handleProductSelect = (productId: string) => {
    const newSelectedItems = selectedItems.includes(productId)
      ? selectedItems.filter((id) => id !== productId)
      : [...selectedItems, productId];

    updateRefundData({ selectedItems: newSelectedItems });
  };

  const handleSelectAll = () => {
    const newSelectedItems =
      selectedItems.length === products.length ? [] : products.map((p) => p.id);

    updateRefundData({ selectedItems: newSelectedItems });
  };

  return {
    handleProductSelect,
    handleSelectAll,
  };
}
