import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  paramPrefix?: string;
}

export const usePagination = (options: PaginationOptions = {}) => {
  const {
    initialPage = 1,
    initialLimit = 10,
    paramPrefix = '',
  } = options;
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [page, setPage] = useState<number>(
    Number(searchParams.get(`${paramPrefix}page`) || initialPage)
  );
  const [limit, setLimit] = useState<number>(
    Number(searchParams.get(`${paramPrefix}limit`) || initialLimit)
  );
  const [total, setTotal] = useState<number>(0);

  const pageCount = Math.ceil(total / limit);
  
  const updateUrlParams = (newPage: number, newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(`${paramPrefix}page`, newPage.toString());
    params.set(`${paramPrefix}limit`, newLimit.toString());
    
    router.push(`?${params.toString()}`);
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pageCount) return;
    setPage(newPage);
    updateUrlParams(newPage, limit);
  };

  const nextPage = () => {
    if (page < pageCount) {
      goToPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      goToPage(page - 1);
    }
  };

  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
    updateUrlParams(1, newLimit);
  };

  return {
    page,
    limit,
    total,
    setTotal,
    pageCount,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
  };
};

export default usePagination;