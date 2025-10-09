'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ContactInquiry } from '@/app/api/types/contact/contact';
import { contactService } from '@/app/api/services/contact-service/contactService';
import { MemberInquiryService } from '@/app/api/services/client/memberService/inquiry-details/memberInquiryService';
import { MyInquiry } from '@/app/api/types/member/inquiry-details/inquiry';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { MemberInfo } from '@/app/api/types/member/member';
import styles from './DeleteInquiry.module.css';
import { DotMenu } from '@/app/components/ui/DotMenu/DotMenu';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Loading from '@/app/components/ui/Loading/Loading';

// Helper function to transform API response to ContactInquiry format
const transformMyInquiryToContactInquiry = (
  myInquiry: MyInquiry
): ContactInquiry => {
  return {
    id: parseInt(myInquiry.inquiryId.split('-')[0], 16) || 0, // Convert UUID to number for compatibility
    inquiryId: myInquiry.inquiryId,
    date: myInquiry.createdAt,
    shopName: myInquiry.store.name,
    shopLocation: myInquiry.store.address,
    shopImage: myInquiry.store.profileUrl || '/images/shops/shop1.png', // fallback image
    category: myInquiry.category,
    message: myInquiry.content,
    responseMessage: myInquiry.answer || '',
    status: myInquiry.status === 'ANSWERED' ? '답변 완료' : '답변 대기 중',
    productId: myInquiry.product.productId, // Store productId for routing
  };
};

export default function DeleteInquiryPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string; // Now expecting productId (string UUID)

  const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<MemberInfo | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    const fetchInquiry = async () => {
      setLoading(true);
      try {
        // Fetch all inquiries and find the one with matching productId
        const response = await MemberInquiryService.getMyInquiries({
          sortBy: 'createdAt',
          direction: 'desc',
          size: 100, // Get more items to find the specific inquiry
        });

        if (response.error || !response.data) {
          console.error('Failed to fetch inquiries:', response.error);
          // Fallback to mock data if API fails
          const mockData = await contactService.getInquiryById(1); // fallback
          setInquiry(mockData);
        } else {
          // Find inquiry with matching productId
          const matchingInquiry = response.data.data.content.find(
            (inq) => inq.product.productId === productId
          );

          if (matchingInquiry) {
            const transformedInquiry =
              transformMyInquiryToContactInquiry(matchingInquiry);
            setInquiry(transformedInquiry);
          } else {
            console.error('Inquiry not found for productId:', productId);
            setInquiry(null);
          }
        }
      } catch (error) {
        console.error('Error fetching inquiry:', error);
        // Fallback to mock data on error
        const mockData = await contactService.getInquiryById(1);
        setInquiry(mockData);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiry();
  }, [productId]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await MemberService.getMyInfo();
        if (response.data && !response.error) {
          setUserProfile(response.data.data);
        } else {
          console.error('Failed to fetch user profile:', response.error);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleDelete = async () => {
    if (!inquiry || !inquiry.inquiryId) return;
    const res = await MemberInquiryService.deleteInquiry(inquiry.inquiryId);
    if (!res.error) {
      toast.success(`문의가 삭제되었습니다`, {
        style: {
          background: '#f87171',
        },
        iconTheme: {
          primary: '#f87171',
          secondary: '#fff',
        },
      });
      router.push('/contact-us');
    } else {
      toast.error('삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const formatKoreanDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  if (loading) return <Loading />;
  if (!inquiry) return <p>Inquiry not found</p>;

  return (
    <>
      <ProductHeader />

      <div className={styles.container}>
        {/* User profile */}
        <div className={styles.userProfile}>
          <Image
            src={
              userProfile?.profileImageUrl ||
              '/images/icons/profile-default.png'
            }
            alt="User Profile"
            className={styles.profileImage}
            width={40}
            height={40}
          />
          <span className={styles.userName}>
            {userProfile?.name || userProfile?.nickname || '펫세이브'}
          </span>
        </div>

        <p className={styles.header}>
          <span className={styles.inquiryCat}>{inquiry.category}</span> |
          <span className={styles.shopName}> [{inquiry.shopName}] </span> |{' '}
          <span className={styles.date}>{formatKoreanDate(inquiry.date)}</span>
        </p>

        <div className={styles.messageBox}>
          <DotMenu mode="deletePage" onDelete={handleDelete} />
          <div className={styles.messageContent}>
            <p>{inquiry.message}</p>
          </div>
        </div>

        <div className={styles.divider}> </div>

        {inquiry.status === '답변 완료' && (
          <div className={styles.responseBox}>
            <h2 className={styles.responseLabel}>답변드립니다.</h2>
            <div className={styles.messageContent}>
              <p>
                문의 주셔서 감사합니다. [{inquiry.shopName}]에 대한 질문에 대해
                아래와 같이 답변 드리겠습니다.
              </p>

              <p>{inquiry.responseMessage}</p>
            </div>
          </div>
        )}

        {inquiry.status === '답변 대기 중' && (
          <div className={styles.responseBox}>
            <h2 className={styles.responseLabel}>답변 대기 중</h2>
            <div className={styles.messageContent}>
              <p>
                문의 주셔서 감사합니다. [{inquiry.shopName}]에 대한 질문에 대해
                답변이 준비되는 대로 연락드리겠습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
