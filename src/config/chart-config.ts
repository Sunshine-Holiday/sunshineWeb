import { ChartData, ChartSeries } from '@/types/analytics';

export const analyticsData: ChartData[] = [
  { month: 'Jan', sales: 4000, users: 2400, stock: 2400 },
  { month: 'Feb', sales: 3000, users: 1398, stock: 2210 },
  { month: 'Mar', sales: 2000, users: 9800, stock: 2290 },
  { month: 'Apr', sales: 2780, users: 3908, stock: 2000 },
  { month: 'May', sales: 1890, users: 4800, stock: 2181 },
  { month: 'Jun', sales: 2390, users: 3800, stock: 2500 },
];

export const chartSeries: ChartSeries[] = [
  { dataKey: 'sales', name: 'Sales', color: '--chart-1' },
  { dataKey: 'users', name: 'Users', color: '--chart-2' },
  { dataKey: 'stock', name: 'Stock', color: '--chart-3' },
];