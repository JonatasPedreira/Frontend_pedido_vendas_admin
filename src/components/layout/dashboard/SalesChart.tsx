"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";


const dadosFaturamento = [
    { mes: "Jan", faturamento: 12500 }, 
    { mes: "Fev", faturamento: 14800 }, 
    { mes: "Mar", faturamento: 13200 }, 
    { mes: "Abr", faturamento: 17600 }, 
    { mes: "Mai", faturamento: 19300 }, 
    { mes: "Jun", faturamento: 21800 }, 
    { mes: "Jul", faturamento: 20500 }, 
    { mes: "Ago", faturamento: 24200 }, 
    { mes: "Set", faturamento: 23100 }, 
    { mes: "Out", faturamento: 26800 }, 
    { mes: "Nov", faturamento: 29100 }, 
    { mes: "Dez", faturamento: 32400 },
];

function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(valor);
}

const SalesChart = () => {
    return (
        <div className="dashboard-chart-card">
            <div className="dashboard-chart-header">
                <div>
                    <h2>Faturamento</h2>
                    <p>Evoluçao do faturamento ao longo do ano</p>
                </div>
            </div>
            <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dadosFaturamento} margin={{top: 10, right: 10, left: 10, bottom: 0,}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="mes" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(valor) => `R$ ${(valor / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(valor) => [formatarMoeda(Number(valor)), "Faturamento"]} />
                        <Line type="monotone" dataKey="faturamento" stroke="var(--primary-color)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />        
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;