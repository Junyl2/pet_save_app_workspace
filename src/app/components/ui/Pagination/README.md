# Pagination Component

A reusable pagination component for your Next.js app.

## Usage

```tsx
import { Pagination, PaginationInfo } from '@/app/components/ui/Pagination';

// In your component
const [currentPage, setCurrentPage] = useState(0);
const [pageInfo, setPageInfo] = useState<PaginationInfo>({
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  first: true,
  last: false,
  hasNext: false,
  hasPrevious: false,
});

const handlePageChange = (page: number) => {
  setCurrentPage(page);
  // Make API call with new page
};

// In your JSX
<Pagination
  pageInfo={pageInfo}
  onPageChange={handlePageChange}
  className="custom-pagination" // optional
/>;
```

## Props

- `pageInfo`: PaginationInfo object with pagination metadata
- `onPageChange`: Function called when page changes (receives new page number)
- `className`: Optional CSS class for custom styling

## Features

- ✅ Smart page number display with ellipsis
- ✅ Previous/Next navigation
- ✅ First/Last page shortcuts
- ✅ Responsive design
- ✅ Green primary color theme
- ✅ Disabled states for navigation buttons
- ✅ TypeScript support

## Styling

The component uses CSS modules. You can override styles by passing a `className` prop or by targeting the component's CSS classes.
