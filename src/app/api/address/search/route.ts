import { NextRequest, NextResponse } from 'next/server';
import {
  AddressSearchRequest,
  ApiResponse,
  AddressSearchResponse,
} from '@/app/api/types/address/addressSearch';

// Kakao API configuration
const KAKAO_API_KEY = process.env.KAKAO_API_KEY || '';
const KAKAO_ADDRESS_API_URL =
  'https://dapi.kakao.com/v2/local/search/address.json';

// GET endpoint for address search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const currentPage = parseInt(searchParams.get('currentPage') || '1');
    const countPerPage = parseInt(searchParams.get('countPerPage') || '10');

    // Validate required parameters
    if (!keyword) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: 400,
        resultMsg: '키워드가 필요합니다.',
        divisionCode: 'ADDRESS_SEARCH_ERROR',
        data: {},
        errorId: 'MISSING_KEYWORD',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate pagination parameters
    if (currentPage < 1 || countPerPage < 1 || countPerPage > 15) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: 400,
        resultMsg: '잘못된 페이지 매개변수입니다.',
        divisionCode: 'ADDRESS_SEARCH_ERROR',
        data: {},
        errorId: 'INVALID_PAGINATION',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if Kakao API key is configured
    if (!KAKAO_API_KEY) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: 500,
        resultMsg: '주소 검색 서비스가 구성되지 않았습니다.',
        divisionCode: 'ADDRESS_SEARCH_ERROR',
        data: {},
        errorId: 'API_KEY_NOT_CONFIGURED',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Call Kakao API
    const kakaoResponse = await fetch(
      `${KAKAO_ADDRESS_API_URL}?query=${encodeURIComponent(
        keyword
      )}&page=${currentPage}&size=${countPerPage}`,
      {
        method: 'GET',
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!kakaoResponse.ok) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: kakaoResponse.status,
        resultMsg: '주소 검색 중 오류가 발생했습니다.',
        divisionCode: 'ADDRESS_SEARCH_ERROR',
        data: {},
        errorId: `KAKAO_API_ERROR_${kakaoResponse.status}`,
      };
      return NextResponse.json(errorResponse, { status: kakaoResponse.status });
    }

    const kakaoData = await kakaoResponse.json();

    // Transform Kakao API response to our format
    const transformedData: AddressSearchResponse = {
      meta: {
        total_count: kakaoData.meta?.total_count || 0,
        pageable_count: kakaoData.meta?.pageable_count || 0,
        is_end: kakaoData.meta?.is_end || true,
      },
      documents: (kakaoData.documents || kakaoData.results || []).map(
        (doc: any) => ({
          address_name: doc.address_name || doc.addressName || '',
          y: doc.y || doc.latitude || '',
          x: doc.x || doc.longitude || '',
          address_type: doc.address_type || doc.categoryName || '',
          address: {
            address_name: doc.address?.address_name || '',
            region_1depth_name: doc.address?.region_1depth_name || '',
            region_2depth_name: doc.address?.region_2depth_name || '',
            region_3depth_name: doc.address?.region_3depth_name || '',
            region_3depth_h_name: doc.address?.region_3depth_h_name || '',
            h_code: doc.address?.h_code || '',
            b_code: doc.address?.b_code || '',
            mountain_yn: doc.address?.mountain_yn || '',
            main_address_no: doc.address?.main_address_no || '',
            sub_address_no: doc.address?.sub_address_no || '',
            x: doc.address?.x || '',
            y: doc.address?.y || '',
          },
          road_address: {
            address_name: doc.road_address?.address_name || '',
            region_1depth_name: doc.road_address?.region_1depth_name || '',
            region_2depth_name: doc.road_address?.region_2depth_name || '',
            region_3depth_name: doc.road_address?.region_3depth_name || '',
            road_name: doc.road_address?.road_name || '',
            underground_yn: doc.road_address?.underground_yn || '',
            main_building_no: doc.road_address?.main_building_no || '',
            sub_building_no: doc.road_address?.sub_building_no || '',
            building_name: doc.road_address?.building_name || '',
            zone_no: doc.road_address?.zone_no || '',
            x: doc.road_address?.x || '',
            y: doc.road_address?.y || '',
          },
        })
      ),
    };

    const successResponse: ApiResponse<AddressSearchResponse> = {
      success: true,
      status: 200,
      resultMsg: '주소 검색이 완료되었습니다.',
      divisionCode: 'ADDRESS_SEARCH_SUCCESS',
      data: transformedData,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('Address search error:', error);

    const errorResponse: ApiResponse<{}> = {
      success: false,
      status: 500,
      resultMsg: '주소 검색 중 서버 오류가 발생했습니다.',
      divisionCode: 'ADDRESS_SEARCH_ERROR',
      data: {},
      errorId: 'INTERNAL_SERVER_ERROR',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST endpoint for address search (alternative method)
export async function POST(request: NextRequest) {
  try {
    const body: AddressSearchRequest = await request.json();
    const { keyword, currentPage = 1, countPerPage = 10 } = body;

    // Validate required parameters
    if (!keyword) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: 400,
        resultMsg: '키워드가 필요합니다.',
        divisionCode: 'ADDRESS_SEARCH_ERROR',
        data: {},
        errorId: 'MISSING_KEYWORD',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate pagination parameters
    if (currentPage < 1 || countPerPage < 1 || countPerPage > 15) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: 400,
        resultMsg: '잘못된 페이지 매개변수입니다.',
        divisionCode: 'ADDRESS_SEARCH_ERROR',
        data: {},
        errorId: 'INVALID_PAGINATION',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if Kakao API key is configured
    if (!KAKAO_API_KEY) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: 500,
        resultMsg: '주소 검색 서비스가 구성되지 않았습니다.',
        divisionCode: 'ADDRESS_SEARCH_ERROR',
        data: {},
        errorId: 'API_KEY_NOT_CONFIGURED',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Call Kakao API
    const kakaoResponse = await fetch(
      `${KAKAO_ADDRESS_API_URL}?query=${encodeURIComponent(
        keyword
      )}&page=${currentPage}&size=${countPerPage}`,
      {
        method: 'GET',
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!kakaoResponse.ok) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: kakaoResponse.status,
        resultMsg: '주소 검색 중 오류가 발생했습니다.',
        divisionCode: 'ADDRESS_SEARCH_ERROR',
        data: {},
        errorId: `KAKAO_API_ERROR_${kakaoResponse.status}`,
      };
      return NextResponse.json(errorResponse, { status: kakaoResponse.status });
    }

    const kakaoData = await kakaoResponse.json();

    // Transform Kakao API response to our format
    const transformedData: AddressSearchResponse = {
      meta: {
        total_count: kakaoData.meta?.total_count || 0,
        pageable_count: kakaoData.meta?.pageable_count || 0,
        is_end: kakaoData.meta?.is_end || true,
      },
      documents: (kakaoData.documents || kakaoData.results || []).map(
        (doc: any) => ({
          address_name: doc.address_name || doc.addressName || '',
          y: doc.y || doc.latitude || '',
          x: doc.x || doc.longitude || '',
          address_type: doc.address_type || doc.categoryName || '',
          address: {
            address_name: doc.address?.address_name || '',
            region_1depth_name: doc.address?.region_1depth_name || '',
            region_2depth_name: doc.address?.region_2depth_name || '',
            region_3depth_name: doc.address?.region_3depth_name || '',
            region_3depth_h_name: doc.address?.region_3depth_h_name || '',
            h_code: doc.address?.h_code || '',
            b_code: doc.address?.b_code || '',
            mountain_yn: doc.address?.mountain_yn || '',
            main_address_no: doc.address?.main_address_no || '',
            sub_address_no: doc.address?.sub_address_no || '',
            x: doc.address?.x || '',
            y: doc.address?.y || '',
          },
          road_address: {
            address_name: doc.road_address?.address_name || '',
            region_1depth_name: doc.road_address?.region_1depth_name || '',
            region_2depth_name: doc.road_address?.region_2depth_name || '',
            region_3depth_name: doc.road_address?.region_3depth_name || '',
            road_name: doc.road_address?.road_name || '',
            underground_yn: doc.road_address?.underground_yn || '',
            main_building_no: doc.road_address?.main_building_no || '',
            sub_building_no: doc.road_address?.sub_building_no || '',
            building_name: doc.road_address?.building_name || '',
            zone_no: doc.road_address?.zone_no || '',
            x: doc.road_address?.x || '',
            y: doc.road_address?.y || '',
          },
        })
      ),
    };

    const successResponse: ApiResponse<AddressSearchResponse> = {
      success: true,
      status: 200,
      resultMsg: '주소 검색이 완료되었습니다.',
      divisionCode: 'ADDRESS_SEARCH_SUCCESS',
      data: transformedData,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('Address search error:', error);

    const errorResponse: ApiResponse<{}> = {
      success: false,
      status: 500,
      resultMsg: '주소 검색 중 서버 오류가 발생했습니다.',
      divisionCode: 'ADDRESS_SEARCH_ERROR',
      data: {},
      errorId: 'INTERNAL_SERVER_ERROR',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
