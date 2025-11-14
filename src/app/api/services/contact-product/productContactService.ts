import { ProductService } from '@/app/api/services/client/productService/productService';
import { ProductSummary } from '@/app/api/types/products/productSummary';
import {
  MemberInquiryService,
  CreateInquiryRequest,
  CreateInquiryResponse,
} from '@/app/api/services/client/memberService/inquiry-details/memberInquiryService';
import { ApiResponse } from '@/app/api/apiClient';

export interface Inquiry {
  productId: string;
  inquiryType: string;
  content: string;
  encryptedIds?: string[];
}

// Map inquiry types to API categories
const inquiryTypeMapping: Record<string, CreateInquiryRequest['category']> = {
  '상품 문의': 'PRODUCT',
  '배송/픽업 문의': 'DELIVERY',
  '교환/환불/교환 문의': 'EXCHANGE_RETURN',
  '결제 문의': 'PAYMENT',
  '기타 문의': 'OTHER',
};

export const productContactService = {
  getProductById: async (id: string): Promise<ProductSummary | null> => {
    try {
      const response = await ProductService.getProductSummary(id);
      if (response.error || !response.data) {
        console.error('Failed to get product:', response.error);
        return null;
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  submitInquiry: async (
    inquiry: Inquiry
  ): Promise<ApiResponse<CreateInquiryResponse>> => {
    try {
      // Map inquiry type to API category
      const category = inquiryTypeMapping[inquiry.inquiryType] || 'OTHER';

      // Validate productId - it should always be provided in ContactProduct
      if (!inquiry.productId || inquiry.productId.trim() === '') {
        console.error('ProductId is required but was not provided');
        return {
          error: '상품 정보가 필요합니다.',
          data: null,
        };
      }

      // Create inquiry with encryptedIds (files should be uploaded before calling this)
      const trimmedProductId = inquiry.productId.trim();
      const inquiryRequest: CreateInquiryRequest = {
        productId: trimmedProductId,
        category,
        content: inquiry.content,
        imageFileIds: inquiry.encryptedIds || [],
      };

      console.log('🔍 [productContactService] Creating inquiry with request:', {
        productId: trimmedProductId,
        category,
        contentLength: inquiry.content.length,
        imageFileIdsCount: inquiry.encryptedIds?.length || 0,
      });
      console.log(
        '🔍 [productContactService] Full request object:',
        JSON.stringify(inquiryRequest, null, 2)
      );

      const response = await MemberInquiryService.createInquiry(inquiryRequest);

      if (response.error) {
        console.error('Failed to submit inquiry:', response.error);
        return response;
      }

      console.log('Inquiry submitted successfully:', response.data);
      console.log(
        '🔍 Full inquiry creation response:',
        JSON.stringify(response, null, 2)
      );

      return response;
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      return {
        error: 'Failed to submit inquiry',
        data: null,
      };
    }
  },
};
