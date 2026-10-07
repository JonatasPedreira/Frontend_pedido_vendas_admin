"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const dadosStatus = [
    {
        nome: "Aguardando Faturamento",
        quantidade: 12,
    },
    {
        nome: "Em Separação",
        quantidade: 8,
    },
    {
        nome: "Faturado",
        quantidade: 25,
    },
    {
        nome: "Cancelado",
        quantidade: 5,
    },
];

const coresStatus = [
    "#f59e0b",
    "#3b82f6",
    "#22c55e",
    "#ef4444",
];

function formatarTooltip(valor: number | string, nome: string) {
    return [`${valor} pedidos`, nome];
}

const OrdersStatusChart = () => {
    return (
        <div className="dasboard-chart-card">
            <div className="dashboard-chart-header">
                <div>
                    <h2>Pedidos por Status</h2>
                    <p>Distribuição dos pedidos atuais</p>
                </div>
            </div>
            <div className="dashboard-status-chart">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={dadosStatus} dataKey="quantidade" nameKey="nome" cx="50%" cy="45%" innerRadius={65} outerRadius={95} paddingAngle={3}>
                            {dadosStatus.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={coresStatus[index]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(valor) => [`${valor ?? 0} pedidos`, "Quantidade",]} />
                        <Legend position="bottom" height={50} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default OrdersStatusChart;