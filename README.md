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
```
<img width="1366" height="682" alt="image" src="https://github.com/user-attachments/assets/232ea258-f9e2-48c2-b7a7-1579abc8fed4" />
<img width="1366" height="644" alt="image" src="https://github.com/user-attachments/assets/98cdcc42-3e4a-4ce3-bec1-052b1a3a92e1" />
<img width="1365" height="646" alt="image" src="https://github.com/user-attachments/assets/697e5c06-826f-4778-8623-665b6e5e4802" />
<img width="1366" height="683" alt="WhatsApp Image 2026-10-02 at 11 52 31" src="https://github.com/user-attachments/assets/abe6c2fb-9cdd-42c3-ac62-79c104872c86" />
<img width="1364" height="647" alt="WhatsApp Image 2026-10-02 at 11 52 55" src="https://github.com/user-attachments/assets/5684b89b-746a-472b-9dc5-61864c3b8ecf" />
<img width="1364" height="642" alt="WhatsApp Image 2026-10-02 at 11 53 55" src="https://github.com/user-attachments/assets/1c372b7b-6f68-401b-bd27-8bf1ee731304" />
<img width="1365" height="644" alt="WhatsApp Image 2026-10-02 at 11 54 13" src="https://github.com/user-attachments/assets/d254f727-2c27-4da9-a55c-fe1e7cd49945" />
<img width="1366" height="642" alt="WhatsApp Image 2026-10-02 at 11 54 46" src="https://github.com/user-attachments/assets/6ea7be05-2918-4444-a4f1-a1b59614de01" />
<img width="1366" height="644" alt="WhatsApp Image 2026-10-02 at 11 55 09" src="https://github.com/user-attachments/assets/ea3a7321-3370-46a7-8437-e01e2bed717b" />
<img width="1366" height="642" alt="WhatsApp Image 2026-10-02 at 11 55 40" src="https://github.com/user-attachments/assets/b4287a0e-311f-4817-996d-7ae0767b51ba" />
<img width="1366" height="643" alt="WhatsApp Image 2026-10-02 at 11 56 19" src="https://github.com/user-attachments/assets/3d0533a1-dcf0-4aad-84cc-34f8481196a0" />
<img width="1366" height="643" alt="WhatsApp Image 2026-10-02 at 11 56 39" src="https://github.com/user-attachments/assets/dcebaed5-fea5-46ff-92d7-a0698dd7b879" />
<img width="1366" height="640" alt="WhatsApp Image 2026-10-02 at 11 57 08" src="https://github.com/user-attachments/assets/38f8d3cf-cb9f-446c-9140-b6470a126fdb" />
<img width="1366" height="642" alt="WhatsApp Image 2026-10-02 at 11 57 28" src="https://github.com/user-attachments/assets/d72cfb62-f6ac-4373-a088-71dd40ad3d2d" />
<img width="1366" height="644" alt="WhatsApp Image 2026-10-02 at 11 58 03" src="https://github.com/user-attachments/assets/ec5c22f2-5fdd-4203-a373-15c169c14eea" />
<img width="1366" height="643" alt="WhatsApp Image 2026-10-02 at 11 58 20" src="https://github.com/user-attachments/assets/93e580cf-0a66-4e17-bc44-416d586496c2" />
<img width="1366" height="641" alt="WhatsApp Image 2026-10-02 at 11 59 23" src="https://github.com/user-attachments/assets/7d607954-8d88-472b-90f6-c275feb3aa29" />
