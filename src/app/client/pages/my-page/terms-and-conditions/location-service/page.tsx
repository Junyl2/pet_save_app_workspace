'use client';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './LocationService.module.css';

export default function LocationServicePage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <ProductHeader />

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>위치정보 서비스 이용약관</h1>
        
        <div className={styles.description}>
          본 약관은 "펫세이브"(이하 "회사")가 제공하는 위치기반서비스의 이용과
          관련하여, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로
          합니다. 회사는 위치정보사업자로부터 위치정보를 이용한 서비스 제공에
          필요한 사업자가 되는 경우를 별도 정의에 한해 본 서비스를 제공합니다.
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제1조 (목적)</h2>
          <div className={styles.sectionContent}>
            <p>
              이 약관은 회사가 제공하는 위치기반서비스와 관련하여 회사와 이용자 간
              의 권리, 의무 및 기타 필요한 사항을 정함으로써, 위치정보를 보호하고 적
              절히 이용하는 데 목적이 있습니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제2조 (위치기반서비스 내용)</h2>
          <div className={styles.sectionContent}>
            <p>회사는 이용자의 위치정보를 활용하여 다음과 같은 서비스를 제공합니다.</p>
            <ol className={styles.orderedList}>
              <li>주변 반려동물 용품점 또는 매장 안내</li>
              <li>위치 기반 맞춤 추천 서비스</li>
              <li>기타 위치를 기반으로 한 콘텐츠 또는 광고 제공 서비스</li>
            </ol>
            <p>※ 위치정보를 활용한 서비스는 사용자의 명시적 동의 후에만 제공되며, 사용자는 언제든지 동의를 철회할 수 있습니다.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제3조 (위치정보의 수집 및 이용 목적)</h2>
          <div className={styles.sectionContent}>
            <p>회사는 개인위치정보를 다음의 목적을 위해 수집·이용합니다.</p>
            <ul className={styles.bulletList}>
              <li>서비스 내 위치기반 맞춤형 정보 제공</li>
              <li>주변 오프라인 매장 정보 탐색 지원</li>
              <li>마케팅, 통계 분석 등 부가 서비스 제공 (단, 사전 동의 시에만 한함)</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제4조 (위치정보의 보유 및 이용기간)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 개인위치정보를 수집한 경우, 그 목적이 달성된 후 지체 없이 파기
              합니다.
            </p>
            <p>
              단, 이용자 동의 하에 일정 기간 보유할 수 있으며, 이 경우에도 동의 범위
              를 초과하여 이용하지 않습니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제5조 (개인위치정보 제3자 제공 시 동의 및 고지)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                회사는 개인위치정보를 제3자에게 제공하지 않으며, 향후 제공이 필요
                한 경우에는 이용자에게 사전에 제공받는 자, 제공 목적, 보유 기간, 제
                공 일시 등을 명확히 고지하고 별도 동의를 받습니다.
              </li>
              <li>
                개인위치정보를 제공한 경우, 제공일시 및 제공받는 자 등을 이용자에
                게 즉시 통보합니다.
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제6조 (8세 이하 등의 보호의무자의 권리)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 아래 대상자의 개인위치정보를 보호의무자의 동의를 받아 수집·이
              용·제공할 수 있습니다.
            </p>
            <ul className={styles.bulletList}>
              <li>만 8세 이하의 아동</li>
              <li>정신적 장애로 사리를 분별할 능력이 없는 자</li>
              <li>치매환자 등 인지능력이 떨어지는 보호대상자</li>
            </ul>
            <p>※ 이 경우 법정 보호의무자의 사전 동의가 필요하며, 보호자는 대상자의 권리를 대리 행사할 수 있습니다.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제7조 (이용자의 권리 및 행사방법)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                이용자는 언제든지 회사에 대해 다음 사항에 대한 권리를 행사할 수 있
                습니다.
                <ul className={styles.subList}>
                  <li>개인위치정보 이용 또는 제공에 대한 동의 철회</li>
                  <li>열람 또는 고지 요청</li>
                  <li>위치정보의 오류 정정 요구</li>
                </ul>
              </li>
              <li>
                권리 행사는 앱 내 설정, 고객센터 또는 이메일 등을 통해 요청할 수 있
                으며, 회사는 지체 없이 이에 응답합니다.
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제8조 (위치정보관리책임자)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 개인위치정보를 적절히 보호하고 관련 불만을 처리하기 위하여 다
              음과 같이 위치정보관리책임자를 지정합니다.
            </p>
            <ul className={styles.bulletList}>
              <li><strong>성명:</strong> 홍길동</li>
              <li><strong>직위:</strong> 개인정보보호책임자</li>
              <li><strong>이메일:</strong> privacy@petmarket.co.kr</li>
              <li><strong>전화:</strong> 1588-0000</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제9조 (손해배상)</h2>
          <div className={styles.sectionContent}>
            <p>
              이용자는 회사가 위치정보보호법 등 관련 법령을 위반하여 손해를 입은 경
              우, 민법 등 관계법령에 따라 손해배상을 청구할 수 있습니다. 단, 회사가
              고의 또는 중대한 과실이 없을 경우에는 그러하지 아니합니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제10조 (면책조항)</h2>
          <div className={styles.sectionContent}>
            <p>회사는 다음 각 호의 경우에는 책임을 지지 않습니다.</p>
            <ol className={styles.orderedList}>
              <li>천재지변 또는 이에 준하는 불가항력으로 인해 서비스를 제공할 수 없는 경우</li>
              <li>이용자의 고의 또는 과실로 위치정보가 부정확하게 제공된 경우</li>
              <li>위치정보 제공업체의 시스템 장애로 인한 서비스 중단 시</li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제11조 (분쟁 해결 및 관할법원)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                회사와 이용자는 위치정보의 관련된 분쟁 발생 시 상호간 협의하여 해
                결합니다.
              </li>
              <li>
                협의가 이루어지지 않을 경우 「위치정보 보호 및 이용 등에 관한 법률」
                에 따라 방송통신위원회 또는 한국인터넷진흥원의 조정을 신청할 수 있
                습니다.
              </li>
              <li>
                그 외 소송이 제기되는 경우, 회사 본점 소재지를 관할하는 법원을 제1
                심 관할법원으로 합니다.
              </li>
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
