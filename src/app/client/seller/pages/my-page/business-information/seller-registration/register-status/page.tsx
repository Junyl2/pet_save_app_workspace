'use client';

import React, { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import SellerInformation from '@/app/components/auth/seller-form/SellerForm';

const STATUS_RULES: Record<string, { readOnly: boolean; banner: string }> = {
  작성중: { readOnly: false, banner: '필수 항목을 입력해 주세요.' },
  '승인 대기': { readOnly: true, banner: '사업자 등록 심사중' },
  '관리자 승인 완료': { readOnly: true, banner: '관리자 승인 완료됨' },
  'PG 등록 요청됨': { readOnly: true, banner: 'PG 등록 요청이 접수되었습니다' },
  '등록 완료': { readOnly: true, banner: '등록이 완료되었습니다' },
  반려: { readOnly: false, banner: '반려되었습니다. 수정 후 재제출하세요.' },
};

const BASE_INFO = {
  businessNumber: '2065-81-12345',
  representativeName: '홍길동',
  companyName: 'ㅇㅇ 동물병원',
  address: '서울특별시 관악구 신림로 157-1',
  bankName: '국민은행',
  accountNumber: '123554-25465',
  accountHolder: '홍길동',
  email: 'petsave10',
  emailDomain: 'naver.com',
  businessLicenseLabel: '등록증.pdf',
  bankbookLabel: '통장사본.pdf',
};

export default function RegisterStatusPage() {
  const params = useSearchParams();
  const router = useRouter();

  const raw = params.get('status') || '작성중';
  const status = decodeURIComponent(raw);
  const rule = useMemo(
    () => STATUS_RULES[status] ?? STATUS_RULES['작성중'],
    [status]
  );

  return (
    <>
      <ProductHeader />
      <SellerInformation
        initial={BASE_INFO}
        readOnly={rule.readOnly}
        banner={rule.banner}
        status={status}
        onDone={() => router.push('/client/pages/homepage')}
      />
    </>
  );
}
