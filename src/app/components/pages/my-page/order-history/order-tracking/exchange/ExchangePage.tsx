"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { Product } from "@/app/components/types/order";
import { ProductSelectionPage } from "@/app/components/pages/my-page/order-history/order-tracking/exchange/exchange-steps/ProductSelectionPage";
import {
  ExchangeForm,
  ExchangeFormData,
} from "@/app/components/pages/my-page/order-history/order-tracking/exchange/exchange-steps/ExchangeForm";
import { SuccessScreen } from "@/app/components/pages/my-page/order-history/order-tracking/exchange/exchange-steps/SuccessScreen";
import { mockOrders } from "@/app/components/data/mockOrders";
import styles from "./ExchangePage.module.css";

type ExchangeStep = "product-selection" | "exchange-form" | "success";

export default function ExchangePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = params?.orderId as string;
  const [currentStep, setCurrentStep] =
    useState<ExchangeStep>("product-selection");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  // 1. Check if product details were passed via query params
  // 1. Check if product details were passed via query params
  const productFromQuery: Product | null = searchParams.get("id")
    ? {
        id: Number(searchParams.get("id")),
        name: searchParams.get("name") || "",
        price: Number(searchParams.get("price")),
        discountPrice: searchParams.get("discountPrice")
          ? Number(searchParams.get("discountPrice"))
          : undefined,
        brand: searchParams.get("brand") || "",
        image: searchParams.get("image") || "",
        deliveryType:
          (searchParams.get("deliveryType") as "pickup" | "delivery") ||
          "delivery", // ✅ added
      }
    : null;

  // 2. Find the order by orderNumber (from mockOrders for now)
  const order = mockOrders.find((o) => o.orderNumber === orderId);

  // 3. Build product list:
  //    - If query params exist → single product list
  //    - Else → mock products from the order
  const orderProducts: Product[] = productFromQuery
    ? [productFromQuery]
    : order
    ? [
        {
          id: 1,
          name: "고양이 파우파우 간식 플러스 60g",
          price: 40000,
          discountPrice: 24000,
          brand: "구멍토스",
          image: "/images/products/cat-treat.jpg",
          deliveryType: "pickup", // ✅ added
        },
        {
          id: 2,
          name: "뉴트리나 프리미엄 볼푸 20kg 고양이사료",
          price: 48000,
          discountPrice: 32070,
          brand: "구멍토스",
          image: "/images/products/cat-food.jpg",
          deliveryType: "delivery", // ✅ added
        },
      ]
    : [];

  // 4. Error handling
  if (!order && !productFromQuery) {
    return (
      <div className={styles.container}>
        <p>주문 정보를 찾을 수 없습니다. 주문번호를 확인해주세요.</p>
      </div>
    );
  }

  // Handlers
  const handleProductSelection = (products: Product[]) => {
    setSelectedProducts(products);
    setCurrentProductIndex(0);
    setCurrentStep("exchange-form");
  };

  const handleFormSubmit = (data: ExchangeFormData) => {
    console.log("Exchange form submitted:", data);

    if (currentProductIndex < selectedProducts.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1);
    } else {
      setCurrentStep("success");
    }
  };

  const handleBackFromForm = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1);
    } else {
      setCurrentStep("product-selection");
    }
  };

  const handleBackFromSuccess = () => {
    setCurrentStep("product-selection");
    setSelectedProducts([]);
    setCurrentProductIndex(0);
  };

  // Render steps
  switch (currentStep) {
    case "product-selection":
      return (
        <ProductSelectionPage
          products={orderProducts}
          onNext={handleProductSelection}
        />
      );

    case "exchange-form":
      const currentProduct = selectedProducts[currentProductIndex];
      return (
        <ExchangeForm
          product={currentProduct}
          onSubmit={handleFormSubmit}
          onBack={handleBackFromForm}
        />
      );

    case "success":
      return (
        <SuccessScreen
          orderId={orderId}
          product={selectedProducts[0]}
          onBack={handleBackFromSuccess}
        />
      );

    default:
      return null;
  }
}
