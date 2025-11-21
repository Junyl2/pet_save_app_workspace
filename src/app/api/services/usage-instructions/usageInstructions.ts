import { UsageInstruction } from '../../types/usageInstructions/usageInstructions';

interface UsageInstructionsParams {
  pickupLocation?: string;
  openingHourStart?: string | null;
  openingHourEnd?: string | null;
}

export const usageInstructionsService = {
  getAll: async (
    params?: UsageInstructionsParams
  ): Promise<UsageInstruction[]> => {
    const {
      pickupLocation = '픽업 장소 정보 없음',
      openingHourStart = '10:00',
      openingHourEnd = '18:00',
    } = params || {};

    const businessHours =
      openingHourStart && openingHourEnd
        ? `${openingHourStart} ~ ${openingHourEnd}`
        : '10:00 ~ 18:00';

    const instructions: UsageInstruction[] = [
      {
        id: 1,
        title: '이용 안내',
        description:
          '본 상품은 [택배 배송] 또는 [직접 픽업] 중 선택 가능합니다. 결제 단계에서 수령 방식을 선택해 주세요.',
      },
      {
        id: 2,
        title: '<배송 안내>',
        listItems: [
          '배송비: 3,000원 (30,000원 이상 구매 시 무료)',
          '배송 기간: 결제일로부터 2~3일 내 출고',
          '제주/도서산간 지역은 추가 배송비가 발생할 수 있습니다.',
        ],
      },
      {
        id: 3,
        title: '<픽업 안내>',
        listItems: [
          `픽업 장소: ${pickupLocation}`,
          `운영시간: 평일 ${businessHours}`,
          '결제 후 5일 이내 방문해 주세요.',
        ],
      },
      {
        id: 4,
        title: '<교환/반품 안내>',
        listItems: [
          '상품 수령 후 7일 이내 불량 또는 오배송에 한해 교환/환불 가능합니다.',
          '단순 변심 및 포장 훼손 시 교환/환불 불가합니다.',
        ],
        notes: [
          '※ 택배 배송의 경우, 반품 시 왕복 배송비가 부과될 수 있습니다.',
          '※ 픽업의 경우, 수령 매장에 직접 방문하여 접수하셔야 합니다.',
        ],
      },
    ];

    return Promise.resolve(instructions);
  },

  getById: async (
    id: number,
    params?: UsageInstructionsParams
  ): Promise<UsageInstruction | undefined> => {
    const all = await usageInstructionsService.getAll(params);
    return all.find((item) => item.id === id);
  },
};
