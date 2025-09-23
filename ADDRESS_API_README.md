# Address Search API Implementation

This document describes the implementation of the address search functionality using Kakao API.

## Overview

The address search API provides two endpoints for searching addresses by keyword:

- `GET /api/pet-save/address/search` - Search using query parameters
- `POST /api/pet-save/address/search` - Search using request body

## Setup

### Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
KAKAO_API_KEY=your_kakao_api_key_here
```

To get a Kakao API key:

1. Visit [Kakao Developers](https://developers.kakao.com/)
2. Create an account and register your application
3. Get your REST API key from the application settings
4. Add it to your environment variables

## API Endpoints

### GET /api/pet-save/address/search

**Parameters:**

- `keyword` (required): Search keyword for address
- `currentPage` (optional): Page number (default: 1)
- `countPerPage` (optional): Results per page (default: 10, max: 15)

**Example:**

```
GET /api/pet-save/address/search?keyword=서울특별시 동대문구&currentPage=1&countPerPage=10
```

### POST /api/pet-save/address/search

**Request Body:**

```json
{
  "keyword": "서울특별시 동대문구",
  "currentPage": 1,
  "countPerPage": 10
}
```

## Response Format

Both endpoints return the same response format:

```json
{
  "success": true,
  "status": 200,
  "resultMsg": "주소 검색이 완료되었습니다.",
  "divisionCode": "ADDRESS_SEARCH_SUCCESS",
  "data": {
    "meta": {
      "total_count": 10,
      "pageable_count": 10,
      "is_end": true
    },
    "documents": [
      {
        "address_name": "서울특별시 동대문구 청량리동",
        "y": "37.5838",
        "x": "127.0464",
        "address_type": "REGION",
        "address": {
          "address_name": "서울특별시 동대문구 청량리동",
          "region_1depth_name": "서울특별시",
          "region_2depth_name": "동대문구",
          "region_3depth_name": "청량리동",
          "region_3depth_h_name": "청량리동",
          "h_code": "1123010100",
          "b_code": "1123010100",
          "mountain_yn": "N",
          "main_address_no": "",
          "sub_address_no": "",
          "x": "127.0464",
          "y": "37.5838"
        },
        "road_address": {
          "address_name": "서울특별시 동대문구 청량리로 1",
          "region_1depth_name": "서울특별시",
          "region_2depth_name": "동대문구",
          "region_3depth_name": "청량리동",
          "road_name": "청량리로",
          "underground_yn": "N",
          "main_building_no": "1",
          "sub_building_no": "",
          "building_name": "",
          "zone_no": "02588",
          "x": "127.0464",
          "y": "37.5838"
        }
      }
    ]
  }
}
```

## Frontend Integration

### AddressService

The `AddressService` class provides methods for interacting with the address search API:

```typescript
import { AddressService } from '@/app/api/services/client/addressService/addressService';

// Search addresses using GET method
const response = await AddressService.searchAddressByKeyword(
  '서울특별시 동대문구',
  1,
  10
);

// Search addresses using POST method
const response = await AddressService.searchAddressByKeywordPost({
  keyword: '서울특별시 동대문구',
  currentPage: 1,
  countPerPage: 10,
});

// Format address for display
const formattedAddress = AddressService.formatAddress(addressResult);

// Extract postal code
const postalCode = AddressService.extractPostalCode(addressResult);

// Extract coordinates
const coordinates = AddressService.extractCoordinates(addressResult);
```

### Form Integration

The address search functionality has been integrated into:

- `SellerForm.tsx` - Business registration form
- `MembershipInformation.tsx` - User registration form

Both forms now include:

- Real-time address search using Kakao API
- Dropdown results with clickable address options
- Automatic postal code and address population
- Error handling and loading states

## Error Handling

The API handles various error scenarios:

- Missing or invalid API key
- Invalid search parameters
- Kakao API errors
- Network errors

All errors are returned in a consistent format with appropriate error messages in Korean.

## Rate Limiting

The Kakao API has rate limits. The implementation includes:

- Pagination support (max 15 results per page)
- Error handling for rate limit exceeded
- Proper error messages for users

## Security

- API key is stored as an environment variable
- No sensitive data is exposed in client-side code
- All API calls are made server-side through Next.js API routes
