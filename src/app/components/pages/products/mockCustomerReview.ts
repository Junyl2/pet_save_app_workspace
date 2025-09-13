import { Review } from '@/app/api/types/review/review';

export const mockReviews: (Review & { productId: number })[] = [
  {
    id: 1,
    productId: 1,
    author: '김철수',
    avatar: 'https://i.pravatar.cc/40?img=1',
    rating: 5,
    content: '이 사료는 강아지가 너무 좋아해요!',
  },
  {
    id: 2,
    productId: 1,
    author: '박영희',
    avatar: 'https://i.pravatar.cc/40?img=2',
    rating: 4,
    content: '입맛 까다로운 우리 강아지도 잘 먹네요.',
  },
  {
    id: 3,
    productId: 1,
    author: '박영희',
    avatar: 'https://i.pravatar.cc/40?img=2',
    rating: 4,
    content: '입맛 까다로운 우리 강아지도 잘 먹네요.',
  },
  {
    id: 4,
    productId: 1,
    author: '이민호',
    avatar: 'https://i.pravatar.cc/40?img=3',
    rating: 2,
    content: '별로예요, 다신 안 사려고요.',
  },
  {
    id: 5,
    productId: 2,
    author: '최수민',
    avatar: 'https://i.pravatar.cc/40?img=4',
    rating: 5,
    content: '치즈볼 간식 완전 추천!',
  },
];
