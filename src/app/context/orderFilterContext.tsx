'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface OrderFilterState {
  dateStart: string | null;
  dateEnd: string | null;
  keyword: string | null;
  shippingOption: 'DELIVERY' | 'PICKUP' | null;
}

interface OrderFilterContextType {
  filters: OrderFilterState;
  setDateStart: (date: string | null) => void;
  setDateEnd: (date: string | null) => void;
  setKeyword: (keyword: string | null) => void;
  setShippingOption: (option: 'DELIVERY' | 'PICKUP' | null) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  filterTrigger: number;
}

const OrderFilterContext = createContext<OrderFilterContextType | undefined>(undefined);

const initialFilters: OrderFilterState = {
  dateStart: null,
  dateEnd: null,
  keyword: null,
  shippingOption: null,
};

export function OrderFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<OrderFilterState>(initialFilters);
  const [filterTrigger, setFilterTrigger] = useState(0);

  const setDateStart = useCallback((date: string | null) => {
    setFilters((prev) => ({ ...prev, dateStart: date }));
  }, []);

  const setDateEnd = useCallback((date: string | null) => {
    setFilters((prev) => ({ ...prev, dateEnd: date }));
  }, []);

  const setKeyword = useCallback((keyword: string | null) => {
    setFilters((prev) => ({ ...prev, keyword: keyword }));
  }, []);

  const setShippingOption = useCallback((option: 'DELIVERY' | 'PICKUP' | null) => {
    setFilters((prev) => ({ ...prev, shippingOption: option }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setFilterTrigger((prev) => prev + 1);
  }, []);

  const applyFilters = useCallback(() => {
    setFilterTrigger((prev) => prev + 1);
  }, []);

  const value: OrderFilterContextType = {
    filters,
    setDateStart,
    setDateEnd,
    setKeyword,
    setShippingOption,
    resetFilters,
    applyFilters,
    filterTrigger,
  };

  return (
    <OrderFilterContext.Provider value={value}>
      {children}
    </OrderFilterContext.Provider>
  );
}

export function useOrderFilter() {
  const context = useContext(OrderFilterContext);
  if (context === undefined) {
    throw new Error('useOrderFilter must be used within an OrderFilterProvider');
  }
  return context;
}

