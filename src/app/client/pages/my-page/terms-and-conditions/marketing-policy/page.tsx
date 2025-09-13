'use client';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './MarketingPolicy.module.css';

export default function MarketingPolicyPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <ProductHeader />

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>환불/취소/교환 정책</h1>
        
        <div className={styles.description}>
          "펫세이브"(이하 "회사")는 「전자상거래 등에서의 소비자 보호에 관한 법
          률」 및 관련 법령에 따라, 상품 구매 및 환불, 교환, 취소 등과 관련된 이용자
          의 권리를 보장하기 위하여 다음과 같은 정책을 수립·시행합니다.
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제1조 (주문 취소)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>이용자는 상품 결제 완료 후 '상품 준비중' 상태 이전까지 마이페이지를 통해 직접 주문 취소가 가능합니다.</li>
              <li>'상품 준비중' 이후에는 배송이 시작되어 주문 취소가 불가하며, 이 경우에는 상품 수령 후 반품 절차에 따라 처리됩니다.</li>
              <li>상품에 따라 제작이 시작된 후에는 취소가 제한될 수 있으며, 해당 내용은 상품 상세 페이지에 사전 고지합니다.</li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제2조 (반품 및 교환 신청)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                상품 수령일로부터 7일 이내에 고객은 반품 또는 교환을 신청할 수 있으며, 다음의 요건을 충족하여야 합니다.
                <ul className={styles.subList}>
                  <li>상품이 훼손되지 않았고, 개봉 또는 사용하지 않은 상태여야 합니다.</li>
                  <li>상품의 구성품(포장, 사은품, 설명서 등)이 모두 포함되어 있어야 합니다.</li>
                  <li>반품·교환 불가 상품에 해당하지 않아야 합니다.</li>
                </ul>
              </li>
              <li>반품·교환은 고객센터 또는 앱 내 마이페이지를 통해 신청하며, 회사의 승인 후 지정 택배사를 통해 회수됩니다.</li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제3조 (반품 및 교환이 불가능한 경우)</h2>
          <div className={styles.sectionContent}>
            <p>다음의 경우에는 「전자상거래법」 제17조 제2항에 따라 청약철회(환불·교환)가 제한될 수 있습니다.</p>
            <ol className={styles.orderedList}>
              <li>고객의 귀책으로 상품이 훼손된 경우</li>
              <li>상품을 사용하거나 개봉하여 상품의 가치가 현저히 감소한 경우</li>
              <li>시간이 경과하여 재판매가 곤란한 경우 (예: 유통기한 임박, 위생상품 등)</li>
              <li>복제가 가능한 상품의 포장을 훼손한 경우</li>
              <li>맞춤형 주문 제작 상품인 경우</li>
              <li>사전에 교환/환불 불가로 고지된 상품</li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제4조 (반품 배송비 부담)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>고객의 단순 변심에 의한 반품/교환 시 왕복 배송비는 고객 부담입니다. (예: 기본 왕복 6,000원 기준)</li>
              <li>상품 불량, 오배송 등 회사의 귀책 사유로 인한 반품/교환의 경우 배송비는 회사가 부담합니다.</li>
              <li>제주도 및 도서산간 지역은 추가 배송비가 부과될 수 있습니다.</li>
              <li>무료배송 혜택이 적용된 주문 건에서 반품으로 인해 최종 결제 금액이 무료배송 기준 미만일 경우, 초기 배송비가 차감될 수 있습니다.</li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제5조 (환불 처리 절차 및 기간)</h2>
          <div className={styles.sectionContent}>
            <p>반품 상품이 고객으로부터 회수되어 회사 또는 물류센터에서 검수 절차를 거쳐 이상이 없다고 확인되면, 이후 환불 처리가 진행됩니다.</p>
            <p>결제 수단에 따라 환불 방식과 소요 기간은 다음과 같습니다:</p>
            <ul className={styles.bulletList}>
              <li>
                <strong>신용카드 또는 체크카드로 결제한 경우</strong>는, 카드 승인취소 방식으로 카드사 정산일 요청이 접수되며, 영업일 기준 2~3일 내 환불이 완료됩니다.
              </li>
              <li>
                <strong>카카오페이, 네이버페이 등 간편결제 수단을 이용한 경우</strong>에는 해당 간편결제 서비스의 정책과 절차에 따라 환불이 이루어집니다. 환불 소요기간은 각 결제사(페이사)의 기준에 따릅니다.
              </li>
              <li>
                <strong>계좌이체(가상계좌 포함)를 통해 결제한 경우</strong>에는, 고객이 등록한 실명계좌로 환불 금액이 입금되며, 영업일 기준 2~3일 이내 환불이 처리됩니다.
              </li>
            </ul>
            <p>회사는 이용자의 정당한 환불 요청이 접수된 후, 특별한 사유가 없는 한 영업일 기준 3일 이내에 환불 절차를 완료하도록 최선을 다합니다.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제6조 (환불 지연에 대한 배상)</h2>
          <div className={styles.sectionContent}>
            <p>회사는 정당한 사유 없이 환불 처리가 지연될 경우 「전자상거래법 시행령」 제21조에 따라 지연일수에 해당하는 지연 배상금을 지급합니다.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제7조 (고객센터 및 반품 주소지 안내)</h2>
          <div className={styles.sectionContent}>
            <ul className={styles.bulletList}>
              <li><strong>고객센터:</strong> 1588-0000</li>
              <li><strong>이메일:</strong> help@petmarket.co.kr</li>
              <li><strong>상담 가능 시간:</strong> 평일 10:00~18:00 (점심시간 12:00~13:00, 주말·공휴일 제외)</li>
              <li><strong>반품 주소지:</strong> [택배사 회수지 또는 물류센터 주소 입력]</li>
            </ul>
            <p>※ 별도의 반품 승인 없이 임의 반송 시, 확인이 지연되거나 반송될 수 있습니다.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제8조 (기타 고지사항)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>회사는 본 정책을 이용자의 이해를 돕기 위해 앱 또는 웹사이트에 상시 게시하며, 개정 시 최소 7일 전 공지합니다.</li>
              <li>개정 내용이 이용자 권리·의무에 중대한 영향을 미치는 경우에는 사전 동의를 받거나 개별 고지합니다.</li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>부칙</h2>
          <div className={styles.sectionContent}>
            <ul className={styles.bulletList}>
              <li><strong>공고일자:</strong> 2025년 7월 25일</li>
              <li><strong>시행일자:</strong> 2025년 8월 1일</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
