import { ContactInquiry } from '../../types/contact/contact';
import { mockContactInquiries } from '@/app/components/data/mockContact';

// Keep an in-memory copy of inquiries for mock operations
let inquiries = [...mockContactInquiries];

export const contactService = {
  async getAllInquiries(): Promise<ContactInquiry[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(inquiries), 500);
    });
  },

  async getInquiryById(id: number): Promise<ContactInquiry | null> {
    return new Promise((resolve) => {
      console.log(
        'Searching for id:',
        id,
        'Current inquiries:',
        inquiries.map((i) => i.id)
      );
      const inquiry = inquiries.find((inq) => inq.id === id) || null;
      resolve(inquiry);
    });
  },

  async deleteInquiry(id: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        inquiries = inquiries.filter((inq) => inq.id !== id);
        resolve();
      }, 300);
    });
  },
};
