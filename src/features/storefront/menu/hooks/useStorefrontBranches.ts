import { useQuery } from '@tanstack/react-query'
import { getBranches } from '@/lib/api/storefront'

export function useStorefrontBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  })
}
