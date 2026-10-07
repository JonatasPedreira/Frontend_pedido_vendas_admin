"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../contexts/AuthContext";
import "@/styles/dashboard.css";
import { faChartLine, faClock, faDollarSign, faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import SalesChart from "@/components/layout/dashboard/SalesChart";
import OrdersStatusChart from "@/components/layout/dashboard/OrdersStatusChart";
import RecentOreders from "@/components/layout/dashboard/RecentOrders";

const Dashboard = () => {
    const {user} = useAuth();

    return (
        <div className="dashboard">
            
            {/** Cabeçalho do Dashboard */}
            <div className="dashboard-header">
                <div>
                    <h1>
                        Bem-Vindo de volta, {" "}
                        {user?.name || "Usuário"}
                    </h1>
                    <p>
                        Confira o resumo das suas vendas e pedidos.
                    </p>
                </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="dashboard-cards">
                {/* Pedidos */}
                <div className="dashboard-stat-card">
                    <div className="stat-header">
                        <p className="stat-title">
                            Pedidos
                        </p>
                        <p className="stat-icon">
                            <FontAwesomeIcon icon={faFileInvoice} />
                        </p>
                    </div>
                    <p className="stat-value">
                        0
                    </p>
                    <p className="stat-description">
                        Pedidos realizados
                    </p>
                </div>
                {/* Faturamento */}
                <div className="dashboard-stat-card">
                    <div className="stat-header">
                        <p className="stat-title">
                            Faturamento
                        </p>
                        <div className="stat-icon">
                            <FontAwesomeIcon icon={faDollarSign} />
                        </div>
                    </div>
                    <p className="stat-value">
                        R$ 0,00
                    </p>
                    <p className="stat-description">
                        Total faturado
                    </p>
                </div>
                {/* Ticket médio */}
                <div className="dashboard-stat-card">
                    <div className="stat-header">
                        <p className="stat-title">
                            Ticket Médio
                        </p>
                        <div className="stat-icon">
                            <FontAwesomeIcon icon={faChartLine} />
                        </div>
                    </div>
                    <p className="stat-value">
                        R$ 0,00
                    </p>
                    <p className="stat-description">
                        Valor médio por pedido
                    </p>
                </div>
                {/* Pedidos em aberto */}
                <div className="dashboard-stat-card">
                    <div className="stat-header">
                        <p className="stat-title">
                            Em Aberto
                        </p>
                        <div className="stat-icon">
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                    </div>
                    <p className="stat-value">
                        0
                    </p>
                    <p className="stat-description">
                        Pedidos em andamento
                    </p>
                </div>
            </div>
            <div className="dashboard-charts">
                <SalesChart />
                <OrdersStatusChart />
            </div>
            <div className="dashboard-recent-orders">
                <RecentOreders />
            </div>
        </div>
    );
}

export default Dashboard