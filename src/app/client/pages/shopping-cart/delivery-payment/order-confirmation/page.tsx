import OrderConfirmationClient from './OrderConfirmationClient';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './styles.module.css';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Sp = Record<string, string | string[] | undefined>;
const one = (sp: Sp, k: string) =>
  Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Sp>;
}) {
  const sp = await searchParams;

  const mode = one(sp, 'mode') === 'pickup' ? 'pickup' : 'delivery';
  const orderNo = one(sp, 'orderNo') ?? '';
  const itemCount = Number(one(sp, 'itemCount') ?? 0);
  const amount = Number(one(sp, 'amount') ?? 0);
  const paymentLabel = one(sp, 'paymentLabel') ?? '';
  const dateIso = one(sp, 'date') ?? new Date().toISOString();
  const date = new Date(dateIso);

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        <OrderConfirmationClient
          mode={mode}
          orderNo={orderNo}
          itemCount={itemCount}
          amount={amount}
          paymentLabel={paymentLabel}
          date={date}
        />
      </div>
    </>
  );
}
