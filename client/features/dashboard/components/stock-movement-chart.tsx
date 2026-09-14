'use client';

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import type {
    StockMovement,
} from '../types';

interface StockMovementChartProps {
    data: StockMovement[];
}

function formatDate(date: string) {
    return new Date(
        `${date}T00:00:00`,
    ).toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
        },
    );
}

export function StockMovementChart({
    data,
}: StockMovementChartProps) {
    const chartData = data.map(
        (item) => ({
            ...item,
            displayDate:
                formatDate(item.date),
        }),
    );

    return (
        <div className="rounded-2xl border bg-background shadow-sm">
            <div className="border-b px-4 py-4">
                <h2 className="text-sm font-semibold">
                    Stock In & Out (30 Days)
                </h2>
            </div>

            <div className="h-72 w-full p-4">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={true}
                        />

                        <XAxis
                            dataKey="displayDate"
                            tick={{
                                fontSize: 11,
                            }}
                            interval="preserveStartEnd"
                        />

                        <YAxis
                            tick={{
                                fontSize: 11,
                            }}
                            tickFormatter={(
                                value,
                            ) =>
                                value.toLocaleString()
                            }
                        />

                        <Tooltip
                            formatter={(
                                value,
                            ) =>
                                Number(
                                    value,
                                ).toLocaleString()
                            }
                        />

                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="stockIn"
                            name="Stock In"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 4,
                            }}
                        />

                        <Line
                            type="monotone"
                            dataKey="stockOut"
                            name="Stock Out"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 4,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}