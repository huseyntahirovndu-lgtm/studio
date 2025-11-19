'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { faculties, students } from '@/lib/data';

const chartData = faculties.map(faculty => ({
    name: faculty.split(' ')[0],
    total: students.filter(student => student.faculty === faculty).length
}));


const chartConfig = {
  total: {
    label: 'Tələbə sayı',
    color: 'hsl(var(--chart-1))',
  },
};

export function FacultyBarChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fakültələr Üzrə İstedadlar</CardTitle>
        <CardDescription>Hər fakültədəki qeydiyyatdan keçmiş istedadlı tələbələrin sayı</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart 
            accessibilityLayer
            data={chartData}
            margin={{
                left: -20
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
