"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const allocationData = [
    { name: "Arbitrum", value: 65, color: "#3b82f6" },
    { name: "Base", value: 35, color: "#cbd5e1" },
];

const apyHistory = [
    { time: "00:00", apy: 5.2 },
    { time: "04:00", apy: 5.3 },
    { time: "08:00", apy: 5.1 },
    { time: "12:00", apy: 7.8 },
    { time: "16:00", apy: 7.7 },
    { time: "20:00", apy: 7.84 },
];

export function AllocationChart() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold mb-4">Current Allocation</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={allocationData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {allocationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    {allocationData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium text-slate-400">{item.name} ({item.value}%)</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold mb-4">Yield Performance (APY %)</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={apyHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="apy"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ fill: '#10b981', r: 4 }}
                                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
