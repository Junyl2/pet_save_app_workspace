'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TopBar from '@/app/components/sections/TopBar/TopBar';
import BottomBar from '@/app/components/sections/BottomBar/BottomBar';

interface MockRefundItem {
  id: string;
  image: string;
  title: string;
  option: string;
  buyer: string;
  tags: Array<{ label: string; tone: 'red' | 'green' | 'purple' | 'gray' }>;
  actions?: Array<{ label: string; tone: 'green' | 'red' }>;
}

const mockRefunds: MockRefundItem[] = [
  {
    id: 'refund-1',
    image: '/images/products/dogfood.png',
    title: '6free 강아지 사료 치킨 레시피, 6kg',
    option: '옵션: 6kg/2개',
    buyer: '구매자: puplover',
    tags: [
      { label: '반품', tone: 'red' },
      { label: '대기중', tone: 'gray' },
    ],
    actions: [
      { label: '승인', tone: 'green' },
      { label: '반려', tone: 'red' },
    ],
  },
  {
    id: 'refund-2',
    image: '/images/products/cat-snacks.png',
    title: '펫사랑 유기농 강아지 간식, 200g',
    option: '옵션: 200g/2개',
    buyer: '구매자: catmit',
    tags: [
      { label: '교환', tone: 'purple' },
      { label: '처리완료', tone: 'green' },
    ],
    actions: [
      { label: '승인', tone: 'green' },
      { label: '반려', tone: 'red' },
    ],
  },
  {
    id: 'refund-3',
    image: '/images/products/reptomin.png',
    title: '올바른 선택 고양이 모래, 5kg',
    option: '옵션: 5kg/1개',
    buyer: '구매자: catmit',
    tags: [
      { label: '교환', tone: 'purple' },
      { label: '대기중', tone: 'gray' },
    ],
    actions: [
      { label: '승인', tone: 'green' },
      { label: '반려', tone: 'red' },
    ],
  },
];

const toneToStyles: Record<string, { bg: string; text: string }> = {
  red: { bg: 'rgba(255,228,230,1)', text: 'rgba(199,0,54,1)' },
  green: { bg: 'rgba(231, 246, 241, 1)', text: 'rgba(47,125,113,1)' },
  purple: { bg: 'rgba(224,231,255,1)', text: 'rgba(67,45,215,1)' },
  gray: { bg: 'rgba(217,217,217,1)', text: 'rgba(255,255,255,1)' },
};

export default function RefundRequestPage() {
  const pathname = usePathname();

  return (
    <>
      <TopBar />
      <div style={{ background: 'rgba(242,244,247,1)' }}>
        {/* Top Tab Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 48,
            padding: '0 16px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            boxSizing: 'border-box',
            marginTop: 71.59,
          }}
        >
          <Link
            href="/client/seller/pages/seller-product-list"
            style={{
              color:
                pathname === '/client/seller/pages/seller-product-list'
                  ? 'rgb(102, 191, 167)'
                  : 'rgba(0,0,0,0.6)',
              fontSize: 14,
              lineHeight: '16px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            상품 리스트
          </Link>
          <Link
            href="/client/seller/pages/seller-product-list/refund-request"
            style={{
              color:
                pathname ===
                '/client/seller/pages/seller-product-list/refund-request'
                  ? 'rgb(102, 191, 167)'
                  : 'rgba(0,0,0,0.6)',
              fontSize: 14,
              lineHeight: '16px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            반품/교환 요청
          </Link>
        </div>

        <div style={{ padding: 16 }}>
          {/* Filters: 전체 / 반품 / 교환 / 상태 태그 */}
          <div style={{ display: 'flex', gap: 12, marginTop: 74 - 48 }}>
            {['전체', '반품', '교환'].map((label, idx) => {
              const isActive = idx === 0;
              const bg = isActive ? 'rgba(102,191,167,1)' : '#fff';
              const border = isActive ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.1)';
              const color = isActive ? '#fff' : 'rgba(0,0,0,0.6)';
              return (
                <div
                  key={label}
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 5,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    color,
                    fontSize: 14,
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* Cards */}
          <div style={{ marginTop: 22, display: 'grid', gap: 16 }}>
            {mockRefunds.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.1)',
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr',
                  padding: '12px 8px',
                  alignItems: 'center',
                }}
              >
                <div style={{ paddingLeft: 1 }}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={90}
                    height={90}
                    style={{ objectFit: 'cover', borderRadius: 5 }}
                  />
                </div>
                <div style={{ display: 'grid', rowGap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {item.tags.map((t) => {
                      const tone = toneToStyles[t.tone];
                      return (
                        <span
                          key={`${item.id}-${t.label}`}
                          style={{
                            background: tone.bg,
                            color: tone.text,
                            borderRadius: 10,
                            fontSize: 12,
                            padding: '3px 10px',
                            height: 20,
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {t.label}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 14 }}>{item.title}</div>
                  <div style={{ fontSize: 14 }}>{item.option}</div>
                  <div style={{ fontSize: 14 }}>{item.buyer}</div>
                </div>

                <div
                  style={{
                    gridColumn: '1 / span 2',
                    display: 'flex',
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      flex: '0 0 260px',
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 5,
                      height: 26,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                    }}
                  >
                    상세보기
                  </div>
                  {item.actions?.map((a) => {
                    const tone = toneToStyles[a.tone];
                    return (
                      <div
                        key={`${item.id}-${a.label}`}
                        style={{
                          flex: '0 0 40px',
                          background: tone.bg,
                          borderRadius: 5,
                          height: 26,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          color: tone.text,
                        }}
                      >
                        {a.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomBar />
    </>
  );
}
