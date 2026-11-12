import type { AnalyticsData, AnalyticsRange } from '@/types';
import { api } from './api/client';

export const analyticsService = {
  async get(range: AnalyticsRange): Promise<AnalyticsData> {
    const { data } = await api.get<AnalyticsData>('/admin/analytics', { params: { range } });
    return data;
  },
};
