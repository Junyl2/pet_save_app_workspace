import { NextRequest, NextResponse } from 'next/server';
import {
  ApiResponse,
  ZipCodeSearchResponse,
} from '@/app/api/types/address/addressSearch';

// Kakao API configuration
const KAKAO_API_KEY = process.env.KAKAO_API_KEY || '';
const KAKAO_ZIPCODE_API_URL =
  'https://dapi.kakao.com/v2/local/geo/coord2address.json';

// GET endpoint for zip code search by coordinates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const x = searchParams.get('x');
    const y = searchParams.get('y');

    // Validate required parameters
    if (!x || !y) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: 400,
        resultMsg: '좌표(x, y)가 필요합니다.',
        divisionCode: 'ZIPCODE_SEARCH_ERROR',
        data: {},
        errorId: 'MISSING_COORDINATES',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate coordinate format
    const xNum = parseFloat(x);
    const yNum = parseFloat(y);

    if (isNaN(xNum) || isNaN(yNum)) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: 400,
        resultMsg: '유효한 좌표 형식이 아닙니다.',
        divisionCode: 'ZIPCODE_SEARCH_ERROR',
        data: {},
        errorId: 'INVALID_COORDINATES',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if Kakao API key is configured
    if (!KAKAO_API_KEY) {
      const errorResponse: ApiResponse<{}> = {
        success: false,
        status: 500,
        resultMsg: '우편번호 검색 서비스가 구성되지 않았습니다.',
        divisionCode: 'ZIPCODE_SEARCH_ERROR',
        data: {},
        errorId: 'API_KEY_NOT_CONFIGURED',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Call Kakao API
    const kakaoResponse = await fetch(
      `${KAKAO_ZIPCODE_API_URL}?x=${x}&y=${y}&input_coord=WGS84`,
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
        resultMsg: '우편번호 검색 중 오류가 발생했습니다.',
        divisionCode: 'ZIPCODE_SEARCH_ERROR',
        data: {},
        errorId: `KAKAO_API_ERROR_${kakaoResponse.status}`,
      };
      return NextResponse.json(errorResponse, { status: kakaoResponse.status });
    }

    const kakaoData = await kakaoResponse.json();

    // Transform Kakao API response to our format
    const transformedData: ZipCodeSearchResponse = {
      meta: {
        total_count: kakaoData.meta?.total_count || 0,
      },
      documents: (kakaoData.documents || []).map((doc: any) => ({
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
      })),
    };

    const successResponse: ApiResponse<ZipCodeSearchResponse> = {
      success: true,
      status: 200,
      resultMsg: '우편번호 검색이 완료되었습니다.',
      divisionCode: 'ZIPCODE_SEARCH_SUCCESS',
      data: transformedData,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('Zip code search error:', error);

    const errorResponse: ApiResponse<{}> = {
      success: false,
      status: 500,
      resultMsg: '우편번호 검색 중 서버 오류가 발생했습니다.',
      divisionCode: 'ZIPCODE_SEARCH_ERROR',
      data: {},
      errorId: 'INTERNAL_SERVER_ERROR',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
