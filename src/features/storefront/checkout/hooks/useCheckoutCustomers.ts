import { useQuery } from '@tanstack/react-query'
import { getCustomers } from '@/lib/api/storefront'

export function useCheckoutCustomers() {
  return useQuery({
    queryKey: ['customers', 'checkout'],
    queryFn: getCustomers,
  })
}
