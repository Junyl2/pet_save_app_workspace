'use client';

import { useParams } from 'next/navigation';
import InquiryReply from '@/app/components/pages/contact-us/InquiryReply/InquiryReply';

export default function InquiryReplyPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  if (!id) return null;
  return <InquiryReply inquiryId={id} />;
}
