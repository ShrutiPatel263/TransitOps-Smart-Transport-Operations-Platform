# 🚛 TransitOps – Smart Transport Operations Platform

> A full-stack Transport Operations Management System that digitizes fleet management, driver management, dispatch operations, maintenance tracking, fuel & expense management, and business analytics using secure Role-Based Access Control (RBAC).

---

# 📌 Problem Statement

Many logistics companies still rely on spreadsheets and manual records to manage transport operations. This often leads to:

- Scheduling conflicts
- Underutilized vehicles
- Missed maintenance
- Expired driver licenses
- Inaccurate expense tracking
- Poor operational visibility

**TransitOps** provides a centralized platform to manage the complete lifecycle of transport operations—from vehicle registration to dispatching, maintenance, expense tracking, and analytics.

---

# ✨ Features

## 🔐 Authentication & Authorization

- Secure Email & Password Authentication
- Role-Based Access Control (RBAC)
- Protected Routes
- JWT Authentication

---

## 🚚 Fleet Management

- Register Vehicles
- Edit Vehicle Details
- Delete Vehicles
- Vehicle Status Management
- Vehicle Search & Filters
- Vehicle Availability Tracking

### Vehicle Status

- Available
- On Trip
- In Shop
- Retired

---

## 👨‍✈️ Driver Management

- Add Drivers
- Update Driver Details
- Delete Drivers
- License Tracking
- Safety Score Monitoring
- Driver Availability

### Driver Status

- Available
- On Trip
- Off Duty
- Suspended

---

## 🛣️ Trip Management

- Create Trips
- Draft Trips
- Dispatch Trips
- Complete Trips
- Cancel Trips
- Automatic Driver & Vehicle Assignment Validation

### Trip Lifecycle

Draft → Dispatched → Completed → Cancelled

---

## 🔧 Maintenance Management

- Create Maintenance Records
- Close Maintenance
- Automatic Vehicle Status Updates
- Maintenance History

---

## ⛽ Fuel & Expense Management

- Fuel Logs
- Maintenance Expenses
- Toll Expenses
- Other Operational Expenses
- Vehicle-wise Operational Cost

---

## 📊 Dashboard & Analytics

- Active Vehicles
- Available Vehicles
- Vehicles In Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization
- Fuel Efficiency
- Operational Cost
- Vehicle ROI

---

## 📈 Reports

- Fuel Efficiency Report
- Operational Cost Report
- Fleet Utilization Report
- Vehicle ROI Analysis
- CSV Export
- PDF Export *(Optional)*

---

## 🎨 UI Features

- Responsive Design
- Dark Mode
- Search
- Filters
- Sorting
- Interactive Charts
- Modern Dashboard

---

# 👥 User Roles

## 🟦 Fleet Manager

### Responsibilities

- Manage Fleet Assets
- Vehicle Registry
- Maintenance Management
- Fleet Analytics

### Permissions

- Add/Edit/Delete Vehicles
- Manage Vehicle Status
- Create Maintenance Records
- Close Maintenance
- Retire Vehicles
- View Fleet Reports

---

## 🟩 Driver / Dispatcher

### Responsibilities

- Trip Planning
- Dispatch Management
- Trip Completion
- Trip Cancellation

### Permissions

- Create Trips
- Assign Drivers
- Assign Vehicles
- Dispatch Trips
- Complete Trips
- Cancel Trips

---

## 🟨 Safety Officer

### Responsibilities

- Driver Compliance
- License Monitoring
- Safety Score Management

### Permissions

- Manage Drivers
- Update Driver Details
- Suspend Drivers
- Monitor License Expiry
- Update Safety Scores

---

## 🟥 Financial Analyst

### Responsibilities

- Fuel Tracking
- Expense Management
- Financial Analytics

### Permissions

- Manage Fuel Logs
- Manage Expenses
- View Reports
- Export CSV/PDF
- Analyze Vehicle ROI

---

# ✅ Business Rules Implemented

- ✔ Vehicle Registration Number must be unique.
- ✔ Retired vehicles cannot be dispatched.
- ✔ Vehicles under maintenance are hidden from dispatch.
- ✔ Drivers with expired licenses cannot be assigned.
- ✔ Suspended drivers cannot be assigned.
- ✔ A vehicle already on a trip cannot be assigned again.
- ✔ A driver already on a trip cannot be assigned again.
- ✔ Cargo weight cannot exceed vehicle capacity.
- ✔ Dispatch automatically changes Vehicle & Driver status to **On Trip**.
- ✔ Completing a trip restores Vehicle & Driver status to **Available**.
- ✔ Cancelling a dispatched trip restores Vehicle & Driver status to **Available**.
- ✔ Creating maintenance automatically changes Vehicle status to **In Shop**.
- ✔ Closing maintenance restores Vehicle status to **Available** (unless retired).

---

# 🗄️ Database Collections

- Users
- Vehicles
- Drivers
- Trips
- Maintenance Logs
- Fuel Logs
- Expenses

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- Bootstrap 5
- React Router DOM
- Axios
- Chart.js

## Backend

- Node.js
- Express.js
- JWT Authentication
- REST APIs

## Database

- MongoDB
- Mongoose

---

# 📁 Project Structure

```text
TransitOps/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/your-username/TransitOps.git
cd TransitOps
```

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

# 🔄 Application Workflow

1. User logs in using role-based authentication.
2. Fleet Manager registers vehicles.
3. Safety Officer manages driver records.
4. Dispatcher creates and dispatches trips.
5. Vehicle and Driver status automatically change to **On Trip**.
6. Dispatcher completes the trip by entering final odometer and fuel details.
7. Vehicle and Driver automatically become **Available**.
8. Fleet Manager creates a maintenance record.
9. Vehicle status changes to **In Shop** and becomes unavailable for dispatch.
10. Financial Analyst records fuel and expenses.
11. Dashboard and Reports update automatically.

---

# 📊 KPIs

- 🚚 Active Vehicles
- ✅ Available Vehicles
- 🔧 Vehicles in Maintenance
- 🚛 Active Trips
- ⏳ Pending Trips
- 👨 Drivers On Duty
- 📈 Fleet Utilization
- ⛽ Fuel Efficiency
- 💰 Operational Cost
- 📊 Vehicle ROI

---

# 📸 Screenshots
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/42d16f62-0b48-43e4-ab12-9023b731106a" />

# 🎯 Hackathon Deliverables

- ✅ Authentication with RBAC
- ✅ Responsive Web Interface
- ✅ Vehicle CRUD
- ✅ Driver CRUD
- ✅ Trip Management
- ✅ Business Rule Validations
- ✅ Automatic Status Transitions
- ✅ Maintenance Workflow
- ✅ Fuel & Expense Tracking
- ✅ Dashboard with KPIs
- ✅ Reports & Analytics
- ✅ Charts
- ✅ CSV Export
- ✅ Search, Filters & Sorting
- ✅ Dark Mode

---

# 👨‍💻 Team

Developed with ❤️ during the **TransitOps Smart Transport Operations Platform**.
