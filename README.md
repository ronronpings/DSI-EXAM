# Sales and Inventory System (DSI-EXAM)

This is a simple POS and Inventory Management System built using Laravel and React.

## How it works (Frontend-Backend Connection)

The system works by using the frontend as the user interface and the backend as the data processor.

1.  **API Requests**: The React app sends data requests to the Laravel server through the BASE URL: `http://127.0.0.1:8000/api`.
2.  **Security**: We use **Laravel Sanctum** for protection. When you login, the server gives a "Token". This token is saved in your browser and is sent back to the server in every request so the system knows you are authorized.
3.  **Data Flow**: When you click something (like "Save Sale"), Axios sends that data to the API controllers. The backend checks the permissions, saves it to the Database, and sends back a success message to the React UI.

---

## Installation and Quick Start

Para mapagana mo 'to uli sa ibang computer o sa presentation, follow these simple steps:

### 1. Database Setup
*   Open your XAMPP or MySQL server.
*   Create a new database named `sales`.

### 2. Backend Setup (Laravel)
*   Open your terminal in the `backend` folder.
*   Copy `.env.example` to `.env` (if not yet existing).
*   Run `composer install`.
*   Run `php artisan key:generate`.
*   Connect the `.env` to your `sales` database.
*   Run `php artisan migrate --seed` (This will create the tables and the default users like Admin/Cashier).
*   Start the server: `php artisan serve`.

### 3. Frontend Setup (React)
*   Open your terminal in the `frontend` folder.
*   Run `npm install`.
*   Start the app: `npm run dev`.
*   Open the browser at `http://localhost:5173`.

---

## Default Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| Admin | admin@gmail.com | password |
| Cashier | cashier@gmail.com | password |

---

## Features
*   **Sales Tracking**: Create and track invoices.
*   **Stock Monitoring**: Alerts you when products are low on stock.
*   **Returns**: Easily handle item returns and inventory adjustments.
*   **Reports**: Print or download sales summaries.
*   **Permissions**: Different access for Admin, Manager, and Cashier.
