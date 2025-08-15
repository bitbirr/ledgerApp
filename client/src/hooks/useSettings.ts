import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/api/settings';

export function useSettings() {
  const queryClient = useQueryClient();

  const getSetting = (key: string) => {
    return useQuery({
      queryKey: ['setting', key],
      queryFn: async () => {
        const response = await fetch(`${API_BASE}/${key}`);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error('Failed to fetch setting');
        }
        const data = await response.json();
        return data.value;
      },
    });
  };

  const getSettingsByCategory = (category: string) => {
    return useQuery({
      queryKey: ['settings', 'category', category],
      queryFn: async () => {
        const response = await fetch(`${API_BASE}/category/${category}`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
      },
    });
  };

  const updateSetting = useMutation({
    mutationFn: async ({ key, value, type, category, description }: {
      key: string;
      value: any;
      type?: string;
      category?: string;
      description?: string;
    }) => {
      const response = await fetch(`${API_BASE}/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, type, category, description }),
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ['setting', key] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return {
    getSetting,
    getSettingsByCategory,
    updateSetting,
  };
}