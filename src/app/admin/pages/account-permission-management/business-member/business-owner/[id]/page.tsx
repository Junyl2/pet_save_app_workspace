import MemberDetailPanel from './MemberDetailPanel';

export default async function Page(props: {
  params?: Promise<{ id: string }>;
}) {
  const resolvedParams = (await props.params?.catch?.(() => undefined)) ?? {
    id: 'unknown',
  };
  const { id } = resolvedParams;

  const member = {
    name: '홍길동',
    nickname: '닝닝닝닝',
    email: 'osdfkald@naver.com',
    phone: '010-0000-0000',
    addressLine: '경기도 안양시 동안구 흥안대로427번길 57-2 (평촌동)',
    zipOrDetail: '121112호 546432동',
  };

  return <MemberDetailPanel key={id} {...member} />;
}
