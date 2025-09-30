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
  file?: File | null;
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

      // Create inquiry first (without file IDs)
      const inquiryRequest = {
        productId: inquiry.productId,
        category,
        content: inquiry.content,
        imageFileIds: [], // Don't include file IDs during creation
      };

      console.log('Creating inquiry with request:', inquiryRequest);

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

      // Handle file upload and attachment after inquiry creation
      if (inquiry.file && response.data) {
        console.log('Uploading file for inquiry:', {
          fileName: inquiry.file.name,
          fileSize: inquiry.file.size,
          fileType: inquiry.file.type,
        });

        try {
          // For now, let's just upload the file without trying to attach it
          // This will help us debug if the issue is with upload or attachment
          console.log('🔍 Attempting file upload only (no attachment for now)');

          const uploadResponse = await MemberInquiryService.uploadInquiryFile(
            inquiry.file,
            {
              entityType: 'INQUIRY',
              documentType: 'INQUIRY_ATTACHMENT',
              description: `Attachment for inquiry about product ${inquiry.productId}`,
            }
          );

          console.log(
            '🔍 File upload response:',
            JSON.stringify(uploadResponse, null, 2)
          );

          if (uploadResponse.error) {
            console.error('File upload failed:', uploadResponse.error);
            console.log('Inquiry created but file upload failed');
          } else {
            console.log('✅ File uploaded successfully');
            console.log('🔍 File ID:', uploadResponse.data?.data?.fileId);
            console.log('🔍 File URL:', uploadResponse.data?.data?.url);

            // TODO: We'll implement attachment later once we confirm upload works
            console.log(
              '📝 Note: File attachment will be implemented after confirming upload works'
            );
          }
        } catch (uploadError) {
          console.error('Error during file upload:', uploadError);
          console.log('Inquiry created but file upload failed');
        }
      } else if (inquiry.file) {
        console.log('No inquiry created, skipping file upload');
      } else {
        console.log('No file provided, inquiry created without attachments');
      }

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
