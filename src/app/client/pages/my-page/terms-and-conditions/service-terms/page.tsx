'use client';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './ServiceTerms.module.css';

export default function ServiceTermsPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <ProductHeader />

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>서비스 이용약관</h1>
        
        <div className={styles.description}>
          본 약관은 귀하가 "펫세이브(이하 '회사')"가 제공하는 서비스를 이용함에 
          있어, 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규
          정함을 목적으로 합니다.
        </div>


        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제1조 (목적)</h2>
          <div className={styles.sectionContent}>
            이 약관은 회사가 운영하는 모바일 애완동물용품 쇼핑몰 서비스(이하 "서
            비스")를 이용함에 있어, 회사와 회원 간의 권리·의무 및 책임사항을 명확히
            하고, 신뢰를 바탕으로 하는 전자상거래 서비스를 제공하는 데 그 목적이
            있습니다.
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제2조 (정의)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① "회원"이라 함은 본 약관에 따라 회원가입을 완료하고, 회사가 제공하는
              서비스를 이용하는 자를 말합니다.
            </div>
            <div className={styles.listItem}>
              ② "비회원"이라 함은 회원가입 없이 회사가 제공하는 일부 서비스를 이용
              하는 자를 말합니다.
            </div>
            <div className={styles.listItem}>
              ③ "상품"이라 함은 회사가 서비스를 통해 판매하는 애완동물 관련 제품을
              말합니다.
            </div>
            <div className={styles.listItem}>
              ④ "콘텐츠"라 함은 문자, 이미지, 영상 등 서비스에서 제공되는 모든 정보
              를 의미합니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제3조 (약관의 게시와 개정)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 회사는 본 약관의 내용을 서비스 초기화면 및 회원가입 시 화면에 게시
              합니다.
            </div>
            <div className={styles.listItem}>
              ② 회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며,
              변경 시 최소 7일 전 고지합니다.
            </div>
            <div className={styles.listItem}>
              ③ 회원은 변경된 약관에 동의하지 않을 경우, 회원 탈퇴를 요청할 수 있으
              며, 계속 이용 시 변경에 동의한 것으로 간주됩니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제4조 (서비스의 제공 및 변경)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 회사는 아래와 같은 서비스를 제공합니다.
              <ul className={styles.subList}>
                <li>애완동물용품 상품 정보 제공 및 구매 서비스</li>
                <li>회원을 위한 맞춤형 추천 서비스</li>
                <li>주문·결제·배송 관리 서비스</li>
                <li>이벤트 및 프로모션 제공 서비스</li>
              </ul>
            </div>
            <div className={styles.listItem}>
              ② 회사는 기술적 사양 변경 등으로 서비스 내용을 변경할 수 있으며, 이 경
              우 사전에 고지합니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제5조 (서비스 이용 시간 및 중단)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
            </div>
            <div className={styles.listItem}>
              ② 시스템 점검, 서버 장애, 전체시험 등의 사유로 일시적으로 서비스가 중
              단될 수 있으며, 회사는 사전 또는 사후에 이를 공지합니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제6조 (회원가입 및 계정관리)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 회원가입은 본인의 유효한 전화번호, 이메일 등을 입력하고 본 약관에
              동의함으로써 완료됩니다.
            </div>
            <div className={styles.listItem}>
              ② 회원은 가입 시 제공한 정보가 사실과 다를 경우, 서비스 이용이 제한될
              수 있습니다.
            </div>
            <div className={styles.listItem}>
              ③ 회원은 개인정보(연락처, 주소 등)를 최신 상태로 유지해야 하며, 변경
              시 즉시 수정해야 합니다.
            </div>
            <div className={styles.listItem}>
              ④ 하나의 회원이 다수의 계정을 운영하는 것은 금지되며, 위반 시 서비스
              이용 제한 또는 탈퇴 처리될 수 있습니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제7조 (회원의 의무)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.description}>
              회원은 다음 각 호의 행위를 하여서는 안 됩니다.
            </div>
            <ol className={styles.orderedList}>
              <li>타인의 개인정보 도용 또는 허위 정보 입력</li>
              <li>서비스 내 게시된 콘텐츠의 무단 복제·배포</li>
              <li>회사의 운영을 방해하는 행위</li>
              <li>악의적 후기 등록, 스팸성 댓글 작성 등</li>
              <li>불법적이거나 부당한 행위</li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제8조 (계약의 성립 및 상품 구매)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 회원은 상품을 선택 후, 결제 및 배송정보를 입력하여 구매 신청을 합니
              다.
            </div>
            <div className={styles.listItem}>
              ② 회사는 결제 확인 후 주문을 승인하며, 승인 통보를 회원에게 제공합니
              다.
            </div>
            <div className={styles.listItem}>
              ③ 상품의 재고 또는 시스템 오류로 인해 주문이 취소될 수 있으며, 이 경우
              전액 환불 처리됩니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제9조 (배송 및 수유권 이전)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 배송은 회사가 지정한 택배사를 통해 이루어지며, 일반적으로 결제일로
              부터 1~3영업일 이내 출고됩니다.
            </div>
            <div className={styles.listItem}>
              ② 배송 지연 시 회원에게 사전 고지하며, 배송비 정책은 서비스 내 별도로
              안내됩니다.
            </div>
            <div className={styles.listItem}>
              ③ 상품의 수유권은 구매완정 시 회원에게 이전됩니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제10조 (청약철회 및 환불 정책)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 상품 수령 후 7일 이내에 청약철회(환불 및 교환 요청)를 할 수 있습니
              다.
            </div>
            <div className={styles.listItem}>
              ② 단, 다음과 같은 경우 청약철회가 제한될 수 있습니다.
              <ul className={styles.subList}>
                <li>사용 또는 개봉된 상품</li>
                <li>시간이 경과해 상품 가치가 현저히 감소한 경우</li>
                <li>받을 시 구성품 누락, 포장 훼손 등이 있는 경우</li>
              </ul>
            </div>
            <div className={styles.listItem}>
              ③ 환불은 결제수단에 따라 승인취소 또는 계좌입금으로 처리됩니다.
            </div>
            <div className={styles.listItem}>
              ④ 고객 단순 변심에 의한 반품 시, 왕복 배송비는 고객 부담입니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제11조 (지적재산권)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 회사가 제공하는 모든 콘텐츠(텍스트, 이미지, 영상 등)는 회사 또는 제
              휴사의 지적재산으로 보호받습니다.
            </div>
            <div className={styles.listItem}>
              ② 회원은 서비스를 통해 얻은 콘텐츠를 상업적 목적 또는 무단 복제로 사
              용할 수 없습니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제12조 (계약 해지 및 회원 탈퇴)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 회원은 언제든지 마이페이지를 통해 탈퇴를 요청할 수 있습니다.
            </div>
            <div className={styles.listItem}>
              ② 회사는 다음 각 호에 해당하는 경우 회원자격을 제한 또는 해지할 수 있
              습니다.
              <ul className={styles.subList}>
                <li>약관을 위반하거나 위법 행위를 한 경우</li>
                <li>타 회원에게 피해를 주거나 부당 이득을 취한 경우</li>
                <li>장기간 로그인하지 않아 비활성화 상태가 지속된 경우</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제13조 (면책조항)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 회사는 천재지변, 통신장애 장애, 시스템 오류 등 불가항력적인 사유로 인
              한 서비스 이용 불가에 대해 책임을 지지 않습니다.
            </div>
            <div className={styles.listItem}>
              ② 회사는 회원의 귀책사유로 인한 문제에 대해 책임지지 않습니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제14조 (분쟁 해결 및 관할 법원)</h2>
          <div className={styles.sectionContent}>
            <div className={styles.listItem}>
              ① 회사는 이용자가 제기하는 정당한 의견이나 불만을 신속히 반영하고 처
              리합니다.
            </div>
            <div className={styles.listItem}>
              ② 회사와 이용자 간의 분쟁은 상호 협의로 해결하며, 협의가 되지 않을 경
              우 민사소송법상 관할 법원으로 합니다.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>부칙</h2>
          <div className={styles.sectionContent}>
            <ul className={styles.subList}>
              <li>본 약관은 2025년 8월 1일부터 시행됩니다.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
