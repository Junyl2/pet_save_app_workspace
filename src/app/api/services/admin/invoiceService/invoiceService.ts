import { apiClient, ApiResponse } from '@/app/api/apiClient';
import { InvoiceSearchParams, InvoiceSearchResponse } from './invoiceTypes';

/**
 * Invoice Service (ADMIN)
 * Provides invoice search functionality.
 */
export const invoiceService = {
  /**
   * Search invoices (ADMIN only)
   * GET /api/pet-save/invoices
   */
  searchInvoices: async (
    params: InvoiceSearchParams
  ): Promise<ApiResponse<InvoiceSearchResponse>> => {
    const query = new URLSearchParams();

    if (params.keyword) query.append('keyword', params.keyword);
    if (params.createdStart) query.append('createdStart', params.createdStart);
    if (params.createdEnd) query.append('createdEnd', params.createdEnd);
    if (params.status) query.append('status', params.status);
    if (params.invoiceType) query.append('invoiceType', params.invoiceType);
    if (params.invoiceNature)
      query.append('invoiceNature', params.invoiceNature);
    if (params.issuanceType) query.append('issuanceType', params.issuanceType);
    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.size !== undefined) query.append('size', String(params.size));
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.direction) query.append('direction', params.direction);

    const url = `/invoices?${query.toString()}`;
    return await apiClient.get<InvoiceSearchResponse>(url);
  },
};
