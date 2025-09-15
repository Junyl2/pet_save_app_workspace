import {
  ContactInquiry,
  CreateInquiryPayload,
} from '../../types/contact/contact';
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
  async createInquiry(
    payload: CreateInquiryPayload
  ): Promise<{ success: boolean; id?: number }> {
    // If your backend expects multipart (for images), use FormData. Otherwise JSON is fine.
    const hasFiles =
      Array.isArray(payload.images) && payload.images[0] instanceof File;

    if (hasFiles) {
      const fd = new FormData();
      fd.append('category', payload.category);
      fd.append('message', payload.message);
      (payload.images as File[]).forEach((f) => fd.append('images', f));

      const res = await fetch('/api/contact/inquiries', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error('Failed to create inquiry');
      return res.json();
    } else {
      const res = await fetch('/api/contact/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: payload.category,
          message: payload.message,
          images: payload.images ?? [],
        }),
      });
      if (!res.ok) throw new Error('Failed to create inquiry');
      return res.json();
    }
  },
};
