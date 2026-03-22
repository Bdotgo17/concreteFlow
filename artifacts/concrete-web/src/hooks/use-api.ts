// Wrapper hooks to add cache invalidation logic on top of generated hooks
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateQuoteRequest as useGeneratedCreateQuoteRequest,
  useCreateQuote as useGeneratedCreateQuote,
  useUpdateQuote as useGeneratedUpdateQuote,
  useMarkInvoicePaid as useGeneratedMarkInvoicePaid,
  getListQuoteRequestsQueryKey,
  getListQuotesQueryKey,
  getGetQuoteQueryKey,
  getListInvoicesQueryKey,
  getGetInvoiceQueryKey,
  getGetDashboardStatsQueryKey,
} from "@workspace/api-client-react";

export function useCreateQuoteRequestWrapper() {
  const queryClient = useQueryClient();
  return useGeneratedCreateQuoteRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListQuoteRequestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    },
  });
}

export function useCreateQuoteWrapper() {
  const queryClient = useQueryClient();
  return useGeneratedCreateQuote({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListQuotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    },
  });
}

export function useUpdateQuoteWrapper() {
  const queryClient = useQueryClient();
  return useGeneratedUpdateQuote({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListQuotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetQuoteQueryKey(data.id) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    },
  });
}

export function useMarkInvoicePaidWrapper() {
  const queryClient = useQueryClient();
  return useGeneratedMarkInvoicePaid({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetInvoiceQueryKey(data.id) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    },
  });
}
