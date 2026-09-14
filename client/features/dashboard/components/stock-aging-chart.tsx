'use client';

import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
} from 'recharts';

interface StockAgingData {
    name: string;
    value: number;
}

const stockAgingData: StockAgingData[] = [
    {
        name: 'Green (0–180d)',
        value: 65,
    },
    {
        name: 'Yellow (181–360d)',
        value: 35,
    },
];

const COLORS = [
    '#8FC5B0',
    '#D99800',
];

export function StockAgingChart() {
    return (
        <div className="h-full w-full">
            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <PieChart>
                    <Pie
                        data={stockAgingData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={72}
                        stroke="#ffffff"
                        strokeWidth={1}
                    >
                        {stockAgingData.map(
                            (entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={COLORS[index]}
                                />
                            ),
                        )}
                    </Pie>

                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                            <span className="text-xs text-muted-foreground">
                                {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}