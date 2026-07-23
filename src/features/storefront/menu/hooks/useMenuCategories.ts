import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/lib/api/storefront'

export function useMenuCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })
}
