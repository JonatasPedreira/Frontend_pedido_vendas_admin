# GestorERP

A modern and responsive ERP sales management system built with **Next.js, React and TypeScript**.

GestorERP is designed to provide a centralized interface for managing sales, orders and customers, with a responsive layout suitable for desktop, tablet and mobile devices.

> 🚧 **Project Status:** In Development

---

## 📋 About the Project

GestorERP is a web-based ERP application focused on sales management.

The project was developed with a component-based architecture using Next.js and React, with a focus on:

- Clean and reusable components
- Responsive design
- Authentication and protected pages
- Sales and order management
- Dashboard visualization
- Light and dark themes
- API integration
- Maintainable project structure

The application is being developed with scalability in mind, allowing new ERP modules and features to be added in the future.

---

## ✨ Features

### 🔐 Authentication

- Login system
- User session management
- Protected application pages
- User account menu
- Logout functionality

### 📊 Dashboard

The dashboard provides an overview of sales activity through:

- Sales and revenue indicators
- Revenue evolution chart
- Orders by status chart
- Recent orders table
- Responsive dashboard cards

### 🛒 Order Management

- Order listing
- Order filtering
- Order status visualization
- Order details
- New order creation
- Customer and salesperson information
- Responsive order tables

### 🎨 Interface

- Responsive layout
- Desktop, tablet and mobile support
- Light and dark themes
- Reusable UI components
- Sidebar navigation
- Header with user account controls
- Responsive tables and dashboards

---

## 🛠️ Technologies

The project is built with the following technologies:

| Technology | Purpose |
|------------|---------|
| **Next.js** | React framework and application routing |
| **React** | User interface and component architecture |
| **TypeScript** | Static typing and safer development |
| **Recharts** | Dashboard charts and data visualization |
| **Axios** | HTTP requests and API communication |
| **Font Awesome** | Interface icons |
| **CSS** | Styling and responsive layouts |

---

## 📁 Project Structure

The project uses the **Next.js App Router** and a component-based architecture.

```text
vendas-next/
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── theme/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── clients.ts
│   │   │   ├── orders.ts
│   │   │   ├── payment-methods.ts
│   │   │   └── products.ts
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── novo-pedido/
│   │   │   └── page.tsx
│   │   │
│   │   ├── pedidos/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   │   ├── OrdersStatusChart.tsx
│   │   │   │   ├── RecentOrders.tsx
│   │   │   │   └── SalesChart.tsx
│   │   │   │
│   │   │   ├── header/
│   │   │   │   └── Header.tsx
│   │   │   │
│   │   │   ├── pagecontainer/
│   │   │   │   └── PageContainer.tsx
│   │   │   │
│   │   │   └── sidebar/
│   │   │       ├── Sidebar.tsx
│   │   │       └── MainLayout.tsx
│   │   │
│   │   └── themeToggle/
│   │       └── ThemeToggle.tsx
│   │
│   ├── styles/
│   │   ├── layout/
│   │   │   ├── Header.css
│   │   │   ├── MainLayout.css
│   │   │   └── Sidebar.css
│   │   │
│   │   ├── dashboard.css
│   │   ├── home.css
│   │   ├── login.css
│   │   ├── novo-pedido.css
│   │   ├── pedidos.css
│   │   ├── ThemeToggle.css
│   │   └── visualizar-pedido.css
│   │
│   └── types/
│
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
