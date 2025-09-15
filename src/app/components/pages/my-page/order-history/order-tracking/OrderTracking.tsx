"use client";
import React, { useEffect } from "react";
import DateRange from "@/app/components/ui/DateRange/DateRange";
import styles from "./OrderTracking.module.css";
import { useParams } from "next/navigation";
import { mockOrders } from "@/app/components/data/mockOrders";
import ProductSection from "@/app/components/sections/ProductSection/ProductSection";
import Steps from "@/app/components/ui/steps/Steps";

interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  description: string;
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  brand: string;
}

interface OrderTrackingProps {
  orderId?: string;
  orderNumber?: string;
  currentStatus?: "ordered" | "preparing" | "shipped" | "delivered";
  item?: OrderItem;
  trackingEvents?: TrackingEvent[];
  orderInfo?: {
    orderNumber: string;
    recipient: string;
  };
  deliveryInfo?: {
    company: string;
    address: string;
    phone: string;
  };
}

export default function OrderTracking(props: OrderTrackingProps = {}) {
  const params = useParams();
  const orderId = props.orderId || (params?.orderId as string);

  // ✅ Find order from shared mockOrders (same as OrderDetail)
  const order = mockOrders.find((o) => o.orderNumber === orderId);

  useEffect(() => {
    if (orderId) {
      console.log("OrderTracking loaded for orderId:", orderId, order);
    }
  }, [orderId, order]);

  if (!order) {
    return (
      <div className={styles.container}>
        <p>주문 내역을 찾을 수 없습니다.</p>
      </div>
    );
  }

  // ✅ Extract real order data
  const { orderNumber, date, status, item } = order;

  // ✅ Map order status to tracking status
  const getTrackingStatus = (orderStatus: string) => {
    const statusMap: Record<
      string,
      "ordered" | "preparing" | "shipped" | "delivered"
    > = {
      주문접수: "ordered",
      "배송 시작": "preparing",
      배송중: "shipped",
      "배송 완료": "delivered",
      ordered: "ordered",
      preparing: "preparing",
      shipped: "shipped",
      delivered: "delivered",
    };
    return statusMap[orderStatus] || "ordered";
  };

  const currentStatus = getTrackingStatus(status);

  // ✅ Create tracking events based on current status
  const generateTrackingEvents = (
    currentStatus: string,
    orderDate: string
  ): TrackingEvent[] => {
    const baseEvents: TrackingEvent[] = [];
    const orderDateObj = new Date(orderDate);

    // Generate realistic timestamps
    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    const formatTime = (date: Date) => {
      return date.toTimeString().split(" ")[0];
    };

    // Always add order received event
    baseEvents.push({
      date: formatDate(orderDateObj),
      time: formatTime(orderDateObj),
      status: "주문접수",
      description: "주문이 접수되었습니다",
    });

    if (["preparing", "shipped", "delivered"].includes(currentStatus)) {
      const prepareDate = new Date(orderDateObj.getTime() + 2 * 60 * 60 * 1000); // +2 hours
      baseEvents.push({
        date: formatDate(prepareDate),
        time: formatTime(prepareDate),
        status: "상품 준비",
        description: "상품 준비 중입니다",
      });
    }

    if (["shipped", "delivered"].includes(currentStatus)) {
      const shipDate = new Date(orderDateObj.getTime() + 4 * 60 * 60 * 1000); // +4 hours
      baseEvents.push({
        date: formatDate(shipDate),
        time: formatTime(shipDate),
        status: "배송 시작",
        description: "상품이 배송을 시작했습니다",
      });
    }

    if (currentStatus === "delivered") {
      const deliverDate = new Date(
        orderDateObj.getTime() + 24 * 60 * 60 * 1000
      ); // +1 day
      baseEvents.push({
        date: formatDate(deliverDate),
        time: formatTime(deliverDate),
        status: "배송 완료",
        description: "배송이 완료되었습니다",
      });
    }

    return baseEvents.reverse(); // Show most recent first
  };

  // ✅ Use real data with fallbacks
  const trackingData = {
    orderNumber: orderNumber,
    currentStatus: currentStatus,
    item: {
      id: item.product.id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.discountPrice ?? item.product.price,
      originalPrice: item.product.discountPrice
        ? item.product.price
        : undefined,
      brand: item.product.brand || "브랜드명",
    },
    trackingEvents: generateTrackingEvents(currentStatus, date),
    orderInfo: {
      orderNumber: orderNumber,
      recipient: "CJ대한통운", // You can add recipient info to your mockOrders if needed
    },
    deliveryInfo: {
      company: "CJ대한통운",
      address: "서울특별시 중구 양화대교 407 5층", // You can add address info to mockOrders if needed
      phone: "010-1234-5678",
    },
  };

  const steps = [
    { key: "ordered", label: "주문접수" },
    { key: "preparing", label: "배송 시작" },
    { key: "shipped", label: "집화" },
    { key: "delivered", label: "배송중" },
    { key: "completed", label: "배송완료" },
  ];

  const getCurrentStepIndex = () => {
    const statusToIndex: Record<string, number> = {
      ordered: 0,
      preparing: 1,
      shipped: 2,
      delivered: 3,
      completed: 4,
    };
    return statusToIndex[trackingData.currentStatus] || 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const formatPrice = (price: number) => price.toLocaleString();

  // ✅ Get status message based on current status
  const getStatusMessage = (status: string) => {
    const messages: Record<string, string> = {
      ordered: "주문이 접수되었습니다!",
      preparing: "상품을 준비중입니다!",
      shipped: "상품이 택배사에 도착했어요!",
      delivered: "배송이 완료되었습니다!",
    };
    return messages[status] || "주문 처리중입니다!";
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <DateRange start={date} end={date} />
        <p className={styles.orderNumber}>
          주문번호 {trackingData.orderNumber}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className={styles.progressSection}>
        <h2 className={styles.progressTitle}>
          {getStatusMessage(trackingData.currentStatus)}
        </h2>

        <div className={styles.progressContainer}>
          {/* Progress Line */}
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{
                width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps Section */}
          <Steps steps={steps} currentStepIndex={currentStepIndex} />
        </div>
      </div>

      {/* Product Section */}
      <ProductSection
        mainContent={
          <div className={styles.productContent}>
            <img
              src={trackingData.item.image}
              alt={trackingData.item.name}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <h3 className={styles.productName}>{trackingData.item.name}</h3>
              <p className={styles.productBrand}>{trackingData.item.brand}</p>
              <div className={styles.productPricing}>
                {trackingData.item.originalPrice && (
                  <span className={styles.originalPrice}>
                    {formatPrice(trackingData.item.originalPrice)}원
                  </span>
                )}
                <span className={styles.currentPrice}>
                  {formatPrice(trackingData.item.price)}원
                </span>
              </div>
            </div>
          </div>
        }
      />

      {/* Tracking Timeline */}
      <div className={styles.timelineSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>배송기록</h3>
        </div>

        <div className={styles.timelineContent}>
          <div className={styles.timelineList}>
            {trackingData.trackingEvents.map((event, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.eventTime}>
                  <p className={styles.eventDate}>{event.date}</p>
                  <p className={styles.eventTimeStamp}>{event.time}</p>
                </div>
                <div className={styles.eventDetails}>
                  <p className={styles.eventStatus}>{event.status}</p>
                  <p className={styles.eventDescription}>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>송장번호</h3>
        </div>

        <div className={styles.infoContent}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>송장 번호</span>
            <span className={styles.infoValue}>
              {trackingData.orderInfo.orderNumber}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>택배사</span>
            <span className={styles.infoValue}>
              {trackingData.orderInfo.recipient}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>배송지 정보</h3>
        </div>

        <div className={styles.infoContent}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>받는분</span>
            <span className={styles.infoValue}>
              {trackingData.deliveryInfo.company}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>주소</span>
            <span className={styles.infoValueAddress}>
              {trackingData.deliveryInfo.address}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>연락처</span>
            <span className={styles.infoValue}>
              {trackingData.deliveryInfo.phone}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
