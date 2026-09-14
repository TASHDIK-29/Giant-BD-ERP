'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import type {
    DashboardBatches,
} from '../types';

interface BatchPeriodChartProps {
    data: DashboardBatches;
}

export function BatchPeriodChart({
    data,
}: BatchPeriodChartProps) {
    const chartData = [
        {
            name: 'Today',
            value: data.today,
        },
        {
            name: 'Yesterday',
            value: data.yesterday,
        },
        {
            name: 'This Week',
            value: data.thisWeek,
        },
        {
            name: 'This Month',
            value: data.thisMonth,
        },
    ];

    return (
        <div className="rounded-2xl border bg-background shadow-sm">
            <div className="border-b px-4 py-4">
                <h2 className="text-sm font-semibold">
                    Batch by Period
                </h2>
            </div>

            <div className="h-64 w-full p-4">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="name"
                            tick={{
                                fontSize: 11,
                            }}
                        />

                        <YAxis
                            allowDecimals={false}
                            tick={{
                                fontSize: 11,
                            }}
                        />

                        <Tooltip />

                        <Bar
                            dataKey="value"
                            name="Batches"
                            fill="#ef4444"
                            radius={[
                                6,
                                6,
                                0,
                                0,
                            ]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}