'use client';
import React, { useEffect, useState } from 'react';
import DateRange from '@/app/components/ui/DateRange/DateRange';
import styles from './OrderTracking.module.css';
import { useParams } from 'next/navigation';
import { mockOrders } from '@/app/components/data/mockOrders';
import ProductSection from '@/app/components/sections/ProductSection/ProductSection';
import Steps from '@/app/components/ui/steps/Steps';
import { deliveryTrackingService } from '@/app/api/services/client/memberService/order/deliveryTrackingService';
import {
  DeliveryTrackingData,
  DeliveryInfoData,
} from '@/app/api/types/member/order/deliveryTracking';
import { orderDetailsService } from '@/app/api/services/client/memberService/order/oderDetailsService';
import { OrderItemResponse } from '@/app/api/types/member/order/orderDetails';

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
  currentStatus?: 'ordered' | 'preparing' | 'shipped' | 'delivered';
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

  // State for API data
  const [trackingData, setTrackingData] = useState<DeliveryTrackingData | null>(
    null
  );
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfoData | null>(
    null
  );
  const [orderItem, setOrderItem] = useState<OrderItemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Find order from shared mockOrders (same as OrderDetail)
  const order = mockOrders.find((o) => o.orderNumber === orderId);

  useEffect(() => {
    if (orderId) {
      console.log('OrderTracking loaded for orderId:', orderId, order);
      fetchTrackingData();
    }
  }, [orderId, order]);

  const fetchTrackingData = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      // First, get order details to find the orderItemId
      const orderResponse = await orderDetailsService.getOrderDetails(orderId);

      if (orderResponse.error) {
        setError(orderResponse.error);
        return;
      }

      if (
        !orderResponse.data?.data?.content ||
        orderResponse.data.data.content.length === 0
      ) {
        setError('주문 정보를 찾을 수 없습니다.');
        return;
      }

      // Get the first order item (they should all have the same order info)
      const firstOrderItem = orderResponse.data.data.content[0];
      setOrderItem(firstOrderItem);

      // Get delivery info using orderItemId
      const deliveryInfoResponse =
        await deliveryTrackingService.getDeliveryInfo(
          firstOrderItem.orderItemId
        );

      if (deliveryInfoResponse.error) {
        setError(deliveryInfoResponse.error);
        return;
      }

      if (!deliveryInfoResponse.data?.data) {
        setError('배송 정보를 찾을 수 없습니다.');
        return;
      }

      const deliveryData = deliveryInfoResponse.data.data;
      setDeliveryInfo(deliveryData);

      // If tracking number exists, get tracking details
      if (deliveryData.trackingNumber) {
        const trackingResponse = await deliveryTrackingService.trackDelivery(
          deliveryData.trackingNumber
        );

        if (trackingResponse.error) {
          // Don't set error here, just log it - we can still show delivery info
          console.warn(
            'Tracking details not available:',
            trackingResponse.error
          );
        } else if (trackingResponse.data?.data) {
          setTrackingData(trackingResponse.data.data);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '배송 조회 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>배송 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p>오류: {error}</p>
      </div>
    );
  }

  if (!orderItem) {
    return (
      <div className={styles.container}>
        <p>주문 내역을 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (!deliveryInfo) {
    return (
      <div className={styles.container}>
        <p>배송 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // ✅ Extract real order data from API
  const orderNumber = orderItem.orderNumber;
  const status = orderItem.status;

  // Format date from order number
  const formatDate = (orderNumber: string): string => {
    const dateMatch = orderNumber.match(/ORD-(\d{6})-/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const year = '20' + dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const day = dateStr.substring(4, 6);
      return `${year}.${month}.${day}`;
    }
    return new Date()
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\./g, '.')
      .replace(/\s/g, '');
  };

  const date = formatDate(orderNumber);

  // ✅ Map API tracking status to component status
  const getTrackingStatus = (apiStatus: string) => {
    const statusMap: Record<
      string,
      'ordered' | 'preparing' | 'shipped' | 'delivered'
    > = {
      PENDING: 'ordered',
      PENDING_PAYMENT: 'ordered',
      PAID: 'ordered',
      PREPARING: 'preparing',
      DELIVERY_STARTED: 'shipped',
      DELIVERED: 'delivered',
      COMPLETED: 'delivered',
      CANCELLED: 'ordered',
      주문접수: 'ordered',
      '배송 시작': 'preparing',
      배송중: 'shipped',
      '배송 완료': 'delivered',
      집화: 'shipped',
      배송완료: 'delivered',
      ordered: 'ordered',
      preparing: 'preparing',
      shipped: 'shipped',
      delivered: 'delivered',
    };
    return statusMap[apiStatus] || 'ordered';
  };

  const currentStatus = getTrackingStatus(deliveryInfo.currentStatus);

  // ✅ Use API data with fallbacks
  const displayData = {
    orderNumber: orderNumber,
    currentStatus: currentStatus,
    item: {
      id: orderItem.productId,
      name: orderItem.productName,
      image: orderItem.productImageUrl,
      price: orderItem.totalAmount,
      originalPrice:
        orderItem.appliedDiscountAmount > 0 ? orderItem.price : undefined,
      brand: orderItem.storeName,
    },
    trackingEvents:
      trackingData?.events?.map((event) => ({
        date: event.date,
        time: event.time,
        status: event.status,
        description: event.description,
      })) || [],
    orderInfo: {
      orderNumber: deliveryInfo.trackingNumber || orderNumber,
      recipient: deliveryInfo.courierName,
    },
    deliveryInfo: {
      company: deliveryInfo.courierName,
      address: deliveryInfo.receiverAddress,
      phone: deliveryInfo.receiverPhone,
    },
  };

  const steps = [
    { key: 'ordered', label: '주문접수' },
    { key: 'preparing', label: '배송 시작' },
    { key: 'shipped', label: '집화' },
    { key: 'delivered', label: '배송중' },
    { key: 'completed', label: '배송완료' },
  ];

  const getCurrentStepIndex = () => {
    const statusToIndex: Record<string, number> = {
      ordered: 0,
      preparing: 1,
      shipped: 2,
      delivered: 3,
      completed: 4,
    };
    return statusToIndex[displayData.currentStatus] || 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const formatPrice = (price: number) => price.toLocaleString();

  // ✅ Get status message based on current status
  const getStatusMessage = (status: string) => {
    const messages: Record<string, string> = {
      ordered: '주문이 접수되었습니다!',
      preparing: '상품을 준비중입니다!',
      shipped: '상품이 택배사에 도착했어요!',
      delivered: '배송이 완료되었습니다!',
    };
    return messages[status] || '주문 처리중입니다!';
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <DateRange start={date} end={date} />
        <p className={styles.orderNumber}>주문번호 {displayData.orderNumber}</p>
      </div>

      {/* Progress Indicator */}
      <div className={styles.progressSection}>
        <h2 className={styles.progressTitle}>
          {getStatusMessage(displayData.currentStatus)}
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
              src={displayData.item.image}
              alt={displayData.item.name}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <h3 className={styles.productName}>{displayData.item.name}</h3>
              <p className={styles.productBrand}>{displayData.item.brand}</p>
              <div className={styles.productPricing}>
                {displayData.item.originalPrice && (
                  <span className={styles.originalPrice}>
                    {formatPrice(displayData.item.originalPrice)}원
                  </span>
                )}
                <span className={styles.currentPrice}>
                  {formatPrice(displayData.item.price)}원
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
            {displayData.trackingEvents.map((event, index) => (
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
              {displayData.orderInfo.orderNumber}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>택배사</span>
            <span className={styles.infoValue}>
              {displayData.orderInfo.recipient}
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
              {deliveryInfo.receiverName}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>주소</span>
            <span className={styles.infoValueAddress}>
              {displayData.deliveryInfo.address}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>연락처</span>
            <span className={styles.infoValue}>
              {displayData.deliveryInfo.phone}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
