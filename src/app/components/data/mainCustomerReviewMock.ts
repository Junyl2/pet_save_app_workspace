import { MainCustomerReview } from '@/app/api/types/review/MainReview';

export const mainCustomerReviewMock: MainCustomerReview[] = [
  {
    id: 1,
    productId: 1,
    author: 'petsave100000',
    avatar: 'https://i.pravatar.cc/40?img=5',
    rating: 5,
    ratingComment: '만족해요',
    content:
      '이 사료는 뭐랄까… 닭고기랑 양고기, 신선한 채소들이 들어 있어서 그런지 하루가 너무 좋아해요! 가끔 까다로운 입맛을 가진 하루도 이 사료는 아주 잘 먹어요. 😊 재료가 깨끗하고 자연스러워서 더 믿음이 가는거 같아요!',
    images: [
      'https://cdn.pixabay.com/photo/2017/02/20/18/03/dog-2083492_1280.jpg',
      'https://cdn.pixabay.com/photo/2017/02/20/18/03/dog-2083492_1280.jpg',
      'https://cdn.pixabay.com/photo/2017/02/20/18/03/dog-2083492_1280.jpg',
    ],
    date: '2025-08-10',
  },
  {
    id: 2,
    productId: 1,
    author: '김철수',
    avatar: 'https://i.pravatar.cc/40?img=1',
    rating: 5,
    ratingComment: '만족해요',
    content: '이 사료는 강아지가 너무 좋아해요!',
    images: [
      'https://images.pexels.com/photos/5732463/pexels-photo-5732463.jpeg',
    ],
    date: '2025-08-05',
  },
  {
    id: 3,
    productId: 1,
    author: '박영희',
    avatar: 'https://i.pravatar.cc/40?img=2',
    rating: 4,
    ratingComment: '보통이에요',
    content: '입맛 까다로운 우리 강아지도 잘 먹네요.',
    images: [
      'https://images.pexels.com/photos/7210454/pexels-photo-7210454.jpeg',
    ],
    date: '2025-08-07',
  },
  {
    id: 4,
    productId: 2,
    author: '최수민',
    avatar: 'https://i.pravatar.cc/40?img=4',
    rating: 5,
    ratingComment: '만족해요',
    content: '치즈볼 간식 완전 추천!',
    images: ['https://placedog.net/400/300?id=3'],
    date: '2025-08-02',
  },
];
