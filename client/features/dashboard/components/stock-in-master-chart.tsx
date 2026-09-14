'use client';

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';

import type {
    StockInByMasterProduct,
} from '../types';

interface StockInMasterChartProps {
    data: StockInByMasterProduct[];
}

const COLORS = [
    '#ec4899',
    '#ef4444',
    '#3b82f6',
    '#10b981',
    '#8b5cf6',
    '#f59e0b',
];

export function StockInMasterChart({
    data,
}: StockInMasterChartProps) {
    const chartData = data.map(
        (item) => ({
            name: item.masterProductName,
            value: item.quantity,
        }),
    );

    return (
        <div className="rounded-2xl border bg-background shadow-sm">
            <div className="border-b px-4 py-4">
                <h2 className="text-sm font-semibold">
                    Stock In : Master (30 Days)
                </h2>
            </div>

            <div className="h-64 w-full p-4">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            innerRadius={42}
                            outerRadius={70}
                            paddingAngle={2}
                        >
                            {chartData.map(
                                (_, index) => (
                                    <Cell
                                        key={
                                            index
                                        }
                                        fill={
                                            COLORS[
                                                index %
                                                    COLORS.length
                                            ]
                                        }
                                    />
                                ),
                            )}
                        </Pie>

                        <Tooltip
                            formatter={(
                                value,
                            ) =>
                                Number(
                                    value,
                                ).toLocaleString()
                            }
                        />

                        <Legend
                            verticalAlign="bottom"
                            height={35}
                            wrapperStyle={{
                                fontSize: 11,
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}