'use client';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './PrivacyPolicy.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <ProductHeader />

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>개인정보 수집 및 이용 동의</h1>
        
        <div className={styles.description}>
          "펫세이브"(이하 "회사")는 개인정보 보호법 제30조에 따라 정보주체의
          개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있
          도록 하기 위해 다음과 같이 개인정보 처리방침을 수립·공개합니다.
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제1조(개인정보의 처리 목적)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 다음의 목적을 위해 개인정보를 처리합니다. 처리한 개인정보는 다
              음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경될 시에는
              별도의 동의를 받는 등 필요한 조치를 이행할 것입니다.
            </p>
            <ol className={styles.orderedList}>
              <li>
                <strong>회원가입 및 관리</strong>
                <p>회원제 서비스 제공, 개인식별, 가입 의사 확인, 각종 고지 및 통지, 고객상담, 분쟁 조정을 위한 기록 보존 등</p>
              </li>
              <li>
                <strong>재화 또는 서비스 제공</strong>
                <p>상품 배송, 결제, 정산, 콘텐츠 제공, 맞춤형 서비스 제공, 본인 인증 등</p>
              </li>
              <li>
                <strong>고객 문의 응대</strong>
                <p>문의 접수 및 처리, 민원 대응, 고객 불만사항 해결 등</p>
              </li>
              <li>
                <strong>마케팅 및 광고 활용(선택 동의 시)</strong>
                <p>이벤트 및 프로모션 정보 제공, 맞춤형 광고, 고객 분석, 신규 서비스 안내 등</p>
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제2조(개인정보의 처리 및 보유 기간)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 개인정보 수집 시 이용자로부터 동의받은 보유 기간 또는 법령에 따
              라 개인정보를 처리 및 보유합니다.
            </p>
            <ul className={styles.bulletList}>
              <li>
                <strong>회원가입 시 수집된 정보(이름, 연락처, 이메일 등)</strong>는 회원 탈퇴 후
                30일간 보관되며, 부정 이용 방지를 위한 최소한의 기록은 최대 90일
                까지 보관됩니다.
              </li>
              <li>
                <strong>상품 주문 및 결제와 관련된 정보(수령자명, 주소, 결제 수단, 거래 내역
                등)</strong>는 「전자상거래 등에서의 소비자 보호에 관한 법률」에 따라 5년간
                보관됩니다.
              </li>
              <li>
                <strong>고객 문의, 불만 처리 및 상담과 관련된 정보</strong>는 분쟁 해결 및 기록 보존
                을 위해 3년간 보관됩니다.
              </li>
              <li>
                <strong>서비스 이용 시 자동으로 생성되는 접속 기록(IP, 접속 시간 등)</strong>는 「통신
                비밀보호법」에 따라 3개월간 보관됩니다.
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제3조(처리하는 개인정보 항목)</h2>
          <div className={styles.sectionContent}>
            <p>회사는 다음의 개인정보 항목을 수집 및 처리합니다.</p>
            <ul className={styles.bulletList}>
              <li>
                <strong>필수항목:</strong> 이름, 이메일, 휴대폰 번호, 주소, 비밀번호, 결제정보, 구매
                내역
              </li>
              <li>
                <strong>선택항목:</strong> 반려동물 정보, 마케팅 수신동의 여부, 생년월일
              </li>
              <li>
                <strong>자동 수집:</strong> 접속 IP, 쿠키, 단말기 정보, 브라우저 정보, 접속 로그, 이용
                기록
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제4조(개인정보의 제3자 제공)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 원칙적으로 이용자의 동의 없이 개인정보를 외부에 제공하지 않습
              니다. 다만, 서비스 제공을 위해 불가피하게 다음과 같은 제공업체에 개인정
              보를 제공할 수 있으며, 해당 제공은 최소한의 범위 내에서 이루어집니다.
            </p>
            <ul className={styles.bulletList}>
              <li>
                <strong>**택배사(CJ대한통운 등)**</strong>에는 상품 배송을 목적으로, 수령자의 이
                름, 주소, 연락처 정보를 제공합니다. 이 정보는 배송 완료 후 3개월까
                지 보관됩니다.
              </li>
              <li>
                <strong>**결제대행사(KG이니시스 등)**</strong>에는 결제 처리를 목적으로, 결제 관
                련 정보 및 거래 내역이 제공되며, 관련 법령에서 정한 범위 보관기간
                동안 보유됩니다.
              </li>
            </ul>
            <p>
              이 외에 회사는 법령에서 요구하는 경우 또는 이용자의 별도 동의를 받은
              경우에 한해 추가로 개인정보를 제3자에게 제공할 수 있으며, 제공 시에는
              사전에 그 내용을 명확히 안내하고 동의를 받습니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제5조(개인정보 처리의 위탁)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 서비스의 원활한 운영과 고객 편의를 위해 일부 업무를 외부 전문업
              체에 위탁하고 있으며, 위탁 계약 체결 시 개인정보 보호 관련 법령을 준수
              하여 관리·감독하고 있습니다. 현재 회사가 개인정보 처리 업무를 위탁하고
              있는 사항은 다음과 같습니다.
            </p>
            <ul className={styles.bulletList}>
              <li>
                <strong>**Amazon Web Services(AWS)**</strong>는 회사의 데이터 보관 및 클라
                우드 서버 운영을 담당하며, 해당 정보는 위탁 계약이 종료될 때까지 보
                관됩니다.
              </li>
              <li>
                <strong>NICE평가정보</strong>는 회원가입 시 본인 인증 및 휴대폰 인증 업무를 수행하
                며, 이 과정에서 수집된 개인정보는 해당 목적이 달성될 때까지 이용·보
                유됩니다.
              </li>
            </ul>
            <p>
              회사는 위탁 업무 수행 시 수탁자가 개인정보를 안전하게 처리할 수 있도록
              계약을 체결하고 정기적인 관리 및 감독을 실시하고 있습니다. 위탁 업체
              변경 시에는 개인정보 처리방침을 통해 그 사실을 사전에 공지합니다.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제6조(정보주체의 권리·의무 및 행사방법)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>
                이용자는 언제든지 자신의 개인정보에 대해 다음 권리를 행사할 수 있
                습니다.
                <ul className={styles.subList}>
                  <li>개인정보 열람요구</li>
                  <li>정정 및 삭제요구</li>
                  <li>처리정지 요구</li>
                  <li>동의 철회 및 회원 탈퇴</li>
                </ul>
              </li>
              <li>
                권리 행사는 마이페이지, 고객센터, 이메일을 통해 요청하실 수 있으며,
                회사는 지체 없이 조치하겠습니다.
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제7조(개인정보의 파기)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 개인정보 보유 기간의 경과, 처리 목적의 달성 등 개인정보가 불필
              요하게 되었을 때에는 지체 없이 해당 정보를 파기합니다.
            </p>
            <ol className={styles.orderedList}>
              <li>
                <strong>파기 절차</strong>
                <ul className={styles.subList}>
                  <li>보관 기간이 경과한 개인정보는 별도 분리 보관 후 파기</li>
                </ul>
              </li>
              <li>
                <strong>파기 방법</strong>
                <ul className={styles.subList}>
                  <li>전자 파일: 복구 불가능한 기술적 방법으로 삭제</li>
                  <li>종이출력: 분쇄기로 분쇄 또는 소각</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제8조(개인정보의 안전성 확보조치)</h2>
          <div className={styles.sectionContent}>
            <p>회사는 다음과 같은 조치를 통해 개인정보의 안전성을 확보하고 있습니다.</p>
            <ul className={styles.bulletList}>
              <li><strong>관리적 조치:</strong> 내부관리계획 수립, 정기적 직원 교육</li>
              <li><strong>기술적 조치:</strong> 개인정보 접근 제한, 암호화, 보안프로그램 설치</li>
              <li><strong>물리적 조치:</strong> 전산실, 자료보관실의 접근 통제</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제9조(개인정보 자동 수집 장치의 설치 및 거부)</h2>
          <div className={styles.sectionContent}>
            <ol className={styles.orderedList}>
              <li>회사는 개인 맞춤형 서비스 제공을 위해 쿠키를 사용합니다.</li>
              <li>
                이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
                <ul className={styles.subList}>
                  <li>예시: [도구] > [인터넷 옵션] > [개인정보] > [고급] 설정에서 쿠키 차단</li>
                </ul>
              </li>
            </ol>
            <p>※ 쿠키 차단 시 일부 서비스 이용이 제한될 수 있습니다.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제10조(개인정보 보호책임자 및 고충처리)</h2>
          <div className={styles.sectionContent}>
            <p>
              회사는 개인정보 처리에 관한 업무를 총괄하여 책임지고, 개인정보 관련 문
              의·불만 처리 등을 위해 아래와 같이 개인정보 보호책임자를 지정하고 있습
              니다.
            </p>
            <ul className={styles.bulletList}>
              <li><strong>개인정보 보호책임자:</strong> 홍길동</li>
              <li><strong>이메일:</strong> privacy@petmarket.co.kr</li>
              <li><strong>전화번호:</strong> 1588-0000</li>
              <li><strong>주소:</strong> 서울특별시 강남구 테헤란로 123</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제11조(권익침해 구제 방법)</h2>
          <div className={styles.sectionContent}>
            <p>
              이용자는 아래 기관에 개인정보 침해에 대한 상담이나 분쟁 조정을 신청할
              수 있습니다.
            </p>
            <ul className={styles.bulletList}>
              <li><strong>개인정보침해신고센터</strong> (https://privacy.kisa.or.kr / 118)</li>
              <li><strong>개인정보분쟁조정위원회</strong> (https://kopico.go.kr / 1833-6972)</li>
              <li><strong>대검찰청 사이버범죄수사단</strong> (http://www.spo.go.kr / 1301)</li>
              <li><strong>경찰청 사이버안전국</strong> (https://cyberbureau.police.go.kr / 182)</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>제12조(개인정보 처리방침의 변경)</h2>
          <div className={styles.sectionContent}>
            <p>
              본 개인정보 처리방침은 시행일로부터 적용되며, 내용 추가, 삭제 및 수정
              이 있을 경우 사전 공지 후 시행합니다.
            </p>
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
