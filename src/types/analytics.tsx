export interface ChartData {
    month: string;
    sales: number;
    users: number;
    stock: number;
  }
  
  export interface ChartSeries {
    dataKey: keyof Omit<ChartData, 'month'>;
    name: string;
    color: string;
  }
  
  export interface StatCardData {
    title: string;
    value: string;
    icon: any; // Using any here because LucideIcon type is already handled in the component
    description: string;
    trend: {
      value: string;
      isPositive: boolean;
    };
  }