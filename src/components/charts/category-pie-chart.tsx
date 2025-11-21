'use client';

import { TrendingUp } from 'lucide-react';
import { Pie, PieChart, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Student, CategoryData } from '@/types';

const categoryColors: Record<string, string> = {
    STEM: 'hsl(var(--category-stem))',
    Humanitar: 'hsl(var(--category-humanitarian))',
    İncəsənət: 'hsl(var(--category-art))',
    İdman: 'hsl(var(--category-sport))',
    Sahibkarlıq: 'hsl(var(--category-entrepreneurship))',
    Texnologiya: 'hsl(var(--category-technology))',
};

interface CategoryPieChartProps {
  students: Student[];
  categoriesData: CategoryData[];
}

export function CategoryPieChart({ students, categoriesData }: CategoryPieChartProps) {
    
  const categories = categoriesData.map(c => c.name);

  const chartData = categories.map((category) => ({
    name: category,
    value: students.filter((student) => student.category.includes(category)).length,
    fill: categoryColors[category] || 'hsl(var(--muted))',
  })).filter(d => d.value > 0);

  const chartConfig = {
    value: {
      label: 'Tələbələr',
    },
    ...Object.fromEntries(categories.map(cat => [cat, {label: cat}]))
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Kateqoriyalara Görə Paylanma</CardTitle>
        <CardDescription>İstedadların əsas kateqoriyalar üzrə bölgüsü</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex items-center justify-center gap-2 font-medium leading-none">
          Ən çox tələbə Texnologiya sahəsindədir <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Cari tələbə məlumatlarına əsasən.
        </div>
      </CardFooter>
    </Card>
  );
}
