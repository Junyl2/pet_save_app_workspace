'use client';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './MarketingConsent.module.css';

export default function MarketingConsentPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <ProductHeader />

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>광고/마케팅 정보 수신 동의</h1>
        
        <div className={styles.description}>
          "펫세이브"(이하 "회사")는 이용자에게 더 나은 서비스 제공을 위해, 각종
          혜택 정보, 이벤트 소식 등을 안내하고자 합니다. 아래와 같은 내용에 대한 사
          전 동의를 요청합니다.
          이 동의는 선택사항이며, 동의를 거부하셔도 서비스 이용에는 제한이 없습
          니다. 다만, 마케팅 정보 및 혜택 제공에 대한 안내를 받을 수 없습니다.
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제1조 (광고성 정보 수신의 목적)</h2>
          <div className={styles.sectionContent}>
            <p>회사는 다음의 목적에 따라 광고성 정보를 전송할 수 있습니다.</p>
            <ol className={styles.orderedList}>
              <li>할인 및 프로모션 이벤트, 신상품 안내, 쿠폰 발송</li>
              <li>개인 맞춤형 추천, 구매 유도 또는 고객 참여 유도</li>
              <li>설문조사, 후기 작성 유도, 마케팅 분석 목적의 정보 제공</li>
              <li>앱 내 광고·배너 및 외부 제휴 이벤트 안내</li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제2조 (광고성 정보의 전송 방법 및 수신 항목)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                회사는 광고성 정보를 다음의 방법으로 발송할 수 있습니다.
                <ul className={styles.subList}>
                  <li>문자메시지 (SMS, LMS, MMS)</li>
                  <li>이메일 (E-mail)</li>
                  <li>푸시 알림 (App Push)</li>
                  <li>메신저 (카카오톡 채널 메시지, 알림톡 등)</li>
                  <li>앱/웹 페이지 내 배너 또는 팝업</li>
                </ul>
              </li>
              <li>
                광고성 정보 전송에 사용되는 개인정보 항목은 다음과 같습니다.
                <ul className={styles.subList}>
                  <li>이름, 휴대폰 번호, 이메일 주소, 기기정보(푸시토큰 등)</li>
                  <li>구매 내역, 이용 이력, 관심 상품 등 비식별화된 이용 패턴 정보</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제3조 (맞춤형 광고 안내 및 수신 대상 설정)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 이용자의 서비스 이용 이력, 구매 이력, 접속 기록 등을 바탕으로 이
              용자에게 맞춤형 광고 및 정보를 제공할 수 있으며, 이 과정에서 광고 대상
              자는 자동화된 방식으로 분류됩니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제4조 (광고성 정보 수신 동의 철회 방법)</h2>
          <div className={styles.sectionContent}>
            <p>
              이용자는 언제든지 수신 동의를 철회할 수 있습니다. 수신 거부 후에는 회
              사로부터 더 이상 광고성 정보를 받지 않으며, 재수신을 원하는 경우 언제
              든지 설정을 변경할 수 있습니다.
            </p>
            <p><strong>수신 거부 방법:</strong></p>
            <ul className={styles.bulletList}>
              <li>마이페이지 {`>`} 설정 {`>`} 마케팅 수신 동의 관리</li>
              <li>수신된 문자 또는 이메일 내 [수신거부] 링크 클릭</li>
              <li>고객센터(1588-0000 또는 help@petmarket.co.kr) 문의</li>
            </ul>
            <p><strong>수신 거부 방법:</strong></p>
            <ul className={styles.bulletList}>
              <li>마이페이지 {`>`} 설정 {`>`} 마케팅 수신 동의 관리</li>
              <li>수신된 문자 또는 이메일 내 [수신거부] 링크 클릭</li>
              <li>고객센터(1588-0000 또는 help@petmarket.co.kr) 문의</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제5조 (광고 표시 및 이용자의 권리 보장)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                회사는 전송하는 광고성 정보에 <strong>**광고 표시 문구**(예: [광고], [무료구
                독], [이벤트])**</strong>를 명확히 표기하며, 발신자명, 수신거부 방법을 명확
                하게 고지합니다.
              </li>
              <li>
                이용자는 광고성 정보 수신에 동의하지 않을 권리가 있으며, 수신 동의
                철회 시 즉시 처리됩니다.
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제6조 (광고성 정보 전송과 관련한 책임)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 정보통신망법 및 관련 법령에 따라 불법유해거나 허위 않은 광고로
              인해 이용자에게 불편을 주지 않도록 관리하며,
            </p>
            <p>불법 스팸 발송 등 위법 행위가 발생하지 않도록 예방합니다.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제7조 (개정 및 고지)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 본 동의서의 내용을 변경하는 경우, 변경 사항을 최소 7일 전 서비
              스 내 공지사항 또는 이메일을 통해 사전 고지하며,
            </p>
            <p>이용자의 추가 동의가 필요한 경우에는 별도로 동의를 받습니다.</p>
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
