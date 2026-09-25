import "@/styles/home.css";

export default function HomePage() {
    return (
        <div className="home-page">

            <div className="home-header">
                <h1>Início</h1>

                <p>
                    Bem-vindo ao GestorERP
                </p>
            </div>


            <div className="home-stats">

                <div className="home-stat-card">
                    <p className="home-stat-title">
                        Pedidos
                    </p>

                    <p className="home-stat-value">
                        0
                    </p>

                    <p className="home-stat-description">
                        Pedidos realizados
                    </p>
                </div>


                <div className="home-stat-card">
                    <p className="home-stat-title">
                        Vendas
                    </p>

                    <p className="home-stat-value">
                        R$ 0,00
                    </p>

                    <p className="home-stat-description">
                        Total de vendas
                    </p>
                </div>


                <div className="home-stat-card">
                    <p className="home-stat-title">
                        Clientes
                    </p>

                    <p className="home-stat-value">
                        0
                    </p>

                    <p className="home-stat-description">
                        Clientes cadastrados
                    </p>
                </div>


                <div className="home-stat-card">
                    <p className="home-stat-title">
                        Produtos
                    </p>

                    <p className="home-stat-value">
                        0
                    </p>

                    <p className="home-stat-description">
                        Produtos cadastrados
                    </p>
                </div>

            </div>


            <div className="quick-access">

                <div className="quick-access-header">
                    <h2>
                        Acesso rápido
                    </h2>

                    <p>
                        Acesse rapidamente os principais módulos do sistema.
                    </p>
                </div>


                <div className="quick-access-grid">

                    <a
                        href="/pedidos"
                        className="quick-access-card"
                    >
                        <h3>
                            Pedidos de Venda
                        </h3>

                        <p>
                            Consulte e gerencie seus pedidos.
                        </p>
                    </a>


                    <a
                        href="/clientes"
                        className="quick-access-card"
                    >
                        <h3>
                            Clientes
                        </h3>

                        <p>
                            Consulte seus clientes.
                        </p>
                    </a>


                    <a
                        href="/compras"
                        className="quick-access-card"
                    >
                        <h3>
                            Compras
                        </h3>

                        <p>
                            Acesse o módulo de compras.
                        </p>
                    </a>

                </div>

            </div>

        </div>
    );
}