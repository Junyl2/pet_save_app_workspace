'use client';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './LocationTerms.module.css';

export default function LocationTermsPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <ProductHeader />

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>전자금융거래 이용약관</h1>

        <div className={styles.description}>
          본 약관은 "펫세이브"(이하 "회사")가 제공하는 전자금융거래 서비스의 이
          용에 관한 권리·의무 및 책임사항을 규정함을 목적으로 하며, 「전자금융거
          래법」 및 관계 법령에 근거하여 작성되었습니다.
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제1조 (목적)</h2>
          <div className={styles.sectionContent}>
            <p>
              이 약관은 회사가 운영하는 애완동물용품 모바일 쇼핑몰에서 제공하는
              전 자금융결제서비스, 간편결제서비스 등 전자금융거래에 관한 사항을
              정 함으로써, 이용자와 회사 간의 권리와 의무, 책서 등을 명확히
              규정하는 것 을 목적으로 합니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제2조 (정의)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                전자금융거래란 회사가 전자적 장치를 통하여 금융상품 및 서비스를
                제공하고, 이용자가 이를 이용하는 거래를 말합니다.
              </li>
              <li>
                전자금융결제서비스(PG)란 결제수단 제공자와 이용자 간의 전자지급
                거래를 중개하는 서비스를 말합니다.
              </li>
              <li>
                간편결제서비스란 회원이 등록한 결제수단을 통해 추가 인증 없이
                간편하게 결제할 수 있도록 하는 서비스를 말합니다.
              </li>
              <li>
                이용자란 본 약관에 따라 회사의 전자금융서비스를 이용하는 자를
                의미합니다.
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제3조 (전자금융거래의 성립)</h2>
          <div className={styles.sectionContent}>
            <p>
              이용자가 회사가 제공하는 결제 서비스를 통해 결제를 진행하면,
              회사는 그 내용을 확인한 후 거래를 처리하고 이에 대한 확인을
              제공합니다. 이로써 전자금융거래는 성립됩니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제4조 (접근매체의 관리)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                이용자는 결제 시 본인의 인증 수단(비밀번호, OTP, 생체정보 등)을
                타인에게 제공하거나 공유해서는 안 됩니다.
              </li>
              <li>
                회사는 접근매체의 위조, 변조, 도용 등으로 발생한 피해에 대해
                고의 또는 과실이 없는 한 책임을 지지 않습니다.
              </li>
              <li>
                이용자는 본인의 접근매체 분실, 도난 등의 사실을 인지한 경우 즉시
                회사에 통지해야 하며, 통지 전까지 발생한 손해는 이용자의
                책임입니다.
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제5조 (이용시간)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사가 제공하는 전자금융결제 서비스는 연중무휴 1일 24시간 제공을
              원 칙으로 합니다. 단, 시스템 점검, 장애, 기타 불가피한 사유로 인해
              일시적 으로 중단될 수 있으며, 이 경우 사전에 고지합니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제6조 (거래내용의 확인 및 정정)
          </h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                이용자는 서비스 내 [마이페이지] &gt; [주문내역] 또는
                전자영수증을 통해 자신의 거래 내역을 확인할 수 있습니다.
              </li>
              <li>
                이용자가 거래 내용에 오류가 있음을 발견한 경우, 즉시 회사에
                정정을 요청할 수 있으며, 회사는 2영업일 이내 그 결과를
                통보합니다.
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            제7조 (전자금융거래 기록의 보존)
          </h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 이용자의 전자금융거래에 관한 기록을 다음과 같이 보존합니다.
            </p>
            <ul className={styles.bulletList}>
              <li>거래에 관한 기록: 5년</li>
              <li>계약 및 철회, 해지에 관한 기록: 5년</li>
              <li>접속기록 및 오류 정정요청 기록: 1년</li>
              <li>기타 관련 기록: 관련 법령에서 정한 기간 동안</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제8조 (손해배상)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                회사는 전자금융거래 중 회사의 고의 또는 과실로 인해 이용자에게
                손해가 발생한 경우, 이에 대해 손해를 배상합니다.
              </li>
              <li>
                다만, 다음의 경우에는 회사가 책임을 지지 않습니다.
                <ul className={styles.subList}>
                  <li>이용자의 귀책 사유로 접근매체가 유출된 경우</li>
                  <li>천재지변, 시스템 장애 등 불가항력적 사유로 인한 경우</li>
                  <li>이용자가 본 약관 및 관련 법령을 위반하여 발생한 손해</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제9조 (거래지시의 철회)</h2>
          <div className={styles.sectionContent}>
            <p>
              이용자는 결제가 완료되기 전까지 거래지시(결제 요청)을 철회할 수
              있으 며, 결제가 완료된 이후에는 전자상거래법 또는 관불취소 정책에
              따라 처 리됩니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제10조 (분쟁처리 및 조정)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                이용자는 전자금융거래와 관련한 불만사항 또는 분쟁 발생 시 회사
                고객센터를 통해 문제 해결을 요청할 수 있습니다.
              </li>
              <li>
                회사는 이용자의 정당한 이의제기에 대해 신속하고 성실하게
                응답합니다.
              </li>
              <li>
                필요시 금융감독원, 전자거래분쟁조정위원회 등의 외부기관을 통해
                분쟁조정을 신청할 수 있습니다.
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제11조 (준거법 및 관할)</h2>
          <div className={styles.sectionContent}>
            <p>
              본 약관은 대한민국 법령에 따라 해석되며, 본 약관과 관련한 분쟁에
              대해 서는 회사의 본사 소재지를 관할하는 법원을 제1심 전속
              관할법원으로 합 니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>부칙</h2>
          <div className={styles.sectionContent}>
            <ul className={styles.bulletList}>
              <li>이 약관은 2025년 8월 1일부터 시행됩니다.</li>
              <li>
                회사는 본 약관의 내용을 사전 공지 후 변경할 수 있으며, 변경된
                약관은 공지사항 또는 이메일을 통해 안내합니다.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
