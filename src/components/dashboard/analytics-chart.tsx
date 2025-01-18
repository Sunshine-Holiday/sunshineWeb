import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
  } from 'recharts';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { analyticsData, chartSeries } from '@/config/chart-config';
  
  export function AnalyticsChart() {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={analyticsData} 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  {chartSeries.map(({ dataKey, color }) => (
                    <linearGradient key={dataKey} id={dataKey} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={`hsl(var(${color}))`} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={`hsl(var(${color}))`} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis 
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  width={60}
                />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                {chartSeries.map(({ dataKey, color }) => (
                  <Area
                    key={dataKey}
                    type="monotone"
                    dataKey={dataKey}
                    stroke={`hsl(var(${color}))`}
                    fillOpacity={1}
                    fill={`url(#${dataKey})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }