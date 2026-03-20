import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/supabase/client'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, name_es, emoji, slug')
        .order('sort_order')
      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}
