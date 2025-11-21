'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import DateRange from '@/app/components/ui/DateRange/DateRange';
import ProductSection from '@/app/components/sections/ProductSection/ProductSection';
import Steps from '@/app/components/ui/steps/Steps';
import OrderTrackingSkeleton from '@/app/components/ui/SkeletonLoading/OrderTrackingSkeleton/OrderTrackingSkeleton';
import styles from './OrderTracking.module.css';
import { deliveryTrackingService } from '@/app/api/services/client/memberService/order/deliveryTrackingService';
import { orderDetailsService } from '@/app/api/services/client/memberService/order/oderDetailsService';
import {
  DeliveryTrackingData,
  DeliveryInfoData,
  DeliveryEvent,
} from '@/app/api/types/member/order/deliveryTracking';
import { OrderItemResponse } from '@/app/api/types/member/order/orderDetails';

export default function OrderTracking() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params?.orderId as string;
  const orderItemId = searchParams?.get('orderItemId') as string | null;

  const [trackingData, setTrackingData] = useState<DeliveryTrackingData | null>(
    null
  );
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfoData | null>(
    null
  );
  const [trackingEvents, setTrackingEvents] = useState<DeliveryEvent[]>([]);
  const [orderItem, setOrderItem] = useState<OrderItemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackingData = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      let item: OrderItemResponse | null = null;

      // If orderItemId is provided, fetch only that specific item
      if (orderItemId) {
        const itemResponse = await orderDetailsService.getOrderDetailsByItemId(
          orderItemId
        );
        if (itemResponse.error || !itemResponse.data?.data) {
          throw new Error('주문 상품 정보를 찾을 수 없습니다.');
        }
        item = itemResponse.data.data;
      } else {
        // Fallback: use orderId to get first item (for backward compatibility)
        const orderResponse = await orderDetailsService.getOrderDetails(
          orderId
        );
        const content = orderResponse.data?.data?.content;
        if (!content || content.length === 0)
          throw new Error('주문 정보를 찾을 수 없습니다.');
        item = content[0];
      }

      if (!item) throw new Error('주문 상품 정보를 찾을 수 없습니다.');

      setOrderItem(item);

      // Delivery info
      const deliveryInfoRes = await deliveryTrackingService.getDeliveryInfo(
        item.orderItemId
      );
      const deliveryData = deliveryInfoRes?.data?.data;
      if (!deliveryData) throw new Error('배송 정보를 찾을 수 없습니다.');
      setDeliveryInfo(deliveryData);

      // Delivery events
      if (deliveryData.deliveryId) {
        const eventsRes = await deliveryTrackingService.getDeliveryEvents(
          deliveryData.deliveryId
        );
        const eventsData = eventsRes?.data?.data;
        if (Array.isArray(eventsData)) {
          const sorted = [...eventsData].sort(
            (a, b) =>
              new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
          );
          setTrackingEvents(sorted);
        }
      }

      // Full tracking data (for address, etc.)
      if (deliveryData.trackingNumber) {
        const trackingRes = await deliveryTrackingService.trackDelivery(
          deliveryData.trackingNumber
        );
        if (trackingRes?.data?.data) {
          setTrackingData(trackingRes.data.data);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '배송 조회 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, orderItemId]);

  useEffect(() => {
    if (orderId) fetchTrackingData();
  }, [orderId, fetchTrackingData]);

  if (loading)
    return <OrderTrackingSkeleton />;

  if (error)
    return (
      <div className={styles.container}>
        <p>오류: {error}</p>
      </div>
    );

  if (!deliveryInfo)
    return (
      <div className={styles.container}>
        <p>배송 정보를 찾을 수 없습니다.</p>
      </div>
    );

  if (!orderItem)
    return (
      <div className={styles.container}>
        <p>주문 내역을 찾을 수 없습니다.</p>
      </div>
    );

  const formatDate = (orderNumber: string): string => {
    const dateMatch = orderNumber.match(/ORD-(\d{6})-/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const year = '20' + dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const day = dateStr.substring(4, 6);
      return `${year}.${month}.${day}`;
    }
    return new Date().toLocaleDateString('ko-KR').replace(/\s/g, '');
  };

  const getTrackingStatus = (
    apiStatus: string
  ): 'ordered' | 'preparing' | 'shipped' | 'delivered' | 'completed' => {
    const map: Record<string, string> = {
      PENDING: 'ordered',
      PREPARING: 'preparing',
      STARTED: 'shipped',
      DELIVERED: 'completed',
    };
    return (
      (map[apiStatus] as
        | 'ordered'
        | 'preparing'
        | 'shipped'
        | 'delivered'
        | 'completed') ?? 'ordered'
    );
  };

  const currentStatus = getTrackingStatus(deliveryInfo.currentStatus);
  const steps = [
    { key: 'ordered', label: '주문접수' },
    { key: 'preparing', label: '배송 시작' },
    { key: 'shipped', label: '집하 완료' },
    { key: 'delivered', label: '배송 진행중' },
    { key: 'completed', label: '배송완료' },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === currentStatus);

  const formatPrice = (p: number) => p.toLocaleString();

  const formatEventDate = (iso: string): { date: string; time: string } => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const time = d.toLocaleTimeString('ko-KR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return { date, time };
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <DateRange
          start={formatDate(orderItem.orderNumber)}
          end={formatDate(orderItem.orderNumber)}
        />
        <p className={styles.orderNumber}>
          주문번호 {orderItem.orderNumber}
        </p>
      </div>

      {/* Progress */}
      <div className={styles.progressSection}>
        <h2 className={styles.progressTitle}>
          배송 상태: {deliveryInfo.currentStatus}
        </h2>
        <div className={styles.progressContainer}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{
                width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
          <Steps
            steps={steps}
            currentStepIndex={Math.max(currentStepIndex, 0)}
          />
        </div>
      </div>

      {/* Products */}
      <ProductSection
        key={orderItem.orderItemId}
        mainContent={
          <div className={styles.productContent}>
            <img
              src={orderItem.productImageUrl}
              alt={orderItem.productName}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <h3 className={styles.productName}>{orderItem.productName}</h3>
              <p className={styles.productBrand}>{orderItem.storeName}</p>
              <div className={styles.productPricing}>
                {orderItem.appliedDiscountAmount > 0 && (
                  <span className={styles.originalPrice}>
                    {formatPrice(orderItem.price)}원
                  </span>
                )}
                <span className={styles.currentPrice}>
                  {formatPrice(orderItem.totalAmount)}원
                </span>
              </div>
            </div>
          </div>
        }
      />

      {/* Delivery Information */}
      <div className={styles.infoContainer}>
        {/* Delivery record */}
        <div className={styles.timelineSection}>
          <h3 className={styles.sectionTitle}>배송기록</h3>
          <div className={styles.timelineList}>
            {trackingEvents.length > 0 ? (
              trackingEvents.map((e) => {
                const { date, time } = formatEventDate(e.eventTime);
                return (
                  <div key={e.deliveryEventId} className={styles.timelineItem}>
                    <div className={styles.eventTime}>
                      <p className={styles.eventDate}>{date}</p>
                      <p className={styles.eventTimeStamp}>{time}</p>
                    </div>
                    <div className={styles.eventDetails}>
                      <p className={styles.eventStatus}>{e.message}</p>
                      <p className={styles.eventDescription}>
                        {e.location || '-'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.noEvents}>배송 기록이 없습니다.</p>
            )}
          </div>
        </div>

        {/* Invoice */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>송장번호</h3>
          <div className={styles.infoContent}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>송장 번호</span>
              <span className={styles.infoValue}>
                {deliveryInfo.trackingNumber}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>택배사</span>
              <span className={styles.infoValue}>
                {deliveryInfo.courierName}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>배송지 정보</h3>
          <div className={styles.infoContent}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>받는분</span>
              <span className={styles.infoValue}>
                {trackingData?.receiverName ?? deliveryInfo.receiverName ?? '-'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>주소</span>
              <span className={styles.infoValueAddress}>
                {trackingData?.receiverAddress ??
                  deliveryInfo.receiverAddress ??
                  '-'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>연락처</span>
              <span className={styles.infoValue}>
                {trackingData?.receiverPhone ??
                  deliveryInfo.receiverPhone ??
                  '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
