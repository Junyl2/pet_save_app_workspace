import { UsageInstruction } from '../../types/usageInstructions/usageInstructions';

import { usageInstructionsMock } from '@/app/components/data/usageInstructionMock';

export const usageInstructionsService = {
  getAll: async (): Promise<UsageInstruction[]> => {
    // simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(usageInstructionsMock), 500);
    });
  },

  getById: async (id: number): Promise<UsageInstruction | undefined> => {
    return new Promise((resolve) => {
      setTimeout(
        () => resolve(usageInstructionsMock.find((item) => item.id === id)),
        300
      );
    });
  },
};
