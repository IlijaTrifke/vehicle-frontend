# 🚗 Vehicle Frontend

A **React + TypeScript** application developed as part of the Mühlbauer technical assignment.  
The project implements the required **Create, Read, and Delete (CRD)** functionality for managing vehicle records through a modern, responsive user interface, following clean architecture principles and best practices.

---

## 🎯 Purpose

The application provides a graphical user interface for users to interact with the vehicle management system. Users can perform CRD operations on vehicles through an intuitive interface, creating new vehicle records, viewing all available vehicles, and deleting existing records.

---

## 🧩 Tech Stack

- **React 19**
- **TypeScript**
- **Vite** (Build tool and dev server)
- **Material UI (MUI)** — Component library
- **React Router** — Client-side routing
- **React Hook Form** — Form state management
- **Zod** — Schema validation
- **Axios** — HTTP client
- **Notistack** — Toast notifications

---

## ⚙️ Architecture Overview

```
src/
├── api/           → API client configuration and vehicle endpoints
├── components/    → Reusable UI components (Layout: Header, Footer, AppLayout)
├── hooks/         → Custom React hooks (useVehicles, useCreateVehicle, useDeleteVehicle)
├── pages/         → Page components (VehiclesPage, NewVehiclePage, NotFoundPage)
├── types/         → TypeScript type definitions (Vehicle, ApiError)
├── router.tsx     → React Router configuration
└── App.tsx        → Root component with providers
```

The application follows a component-based architecture with clear separation of concerns, custom hooks for data fetching and mutations, and centralized API configuration.

---

## 📋 Core Features

### Vehicle Management Pages

#### Page 1: Vehicles Overview

- Display all available vehicles in a table format
- Delete button for each vehicle record
- Button to navigate to "Add new vehicle" page
- Loading states and error handling
- Empty state message when no vehicles are available

#### Page 2: Add New Vehicle

- Form with all required fields as defined in the specification
- Real-time validation using Zod schema
- Save button to send data to the server via RESTful API
- Success/error notifications

### Data Validation

Implemented using **Zod** schema validation with React Hook Form:

| Field                 | Type   | Constraints                                    |
| --------------------- | ------ | ---------------------------------------------- |
| model                 | String | Required, max length 40                        |
| firstRegistrationYear | String | Required, exactly 4 digits (`^\d{4}$`)         |
| cubicCapacity         | Number | Required, positive, max 9999                   |
| fuel                  | Enum   | Required, One of: `diesel`, `petrol`, `hybrid` |
| mileage               | Number | Required, min 0, max 9,999,999                 |

### Error Handling

- Centralized error handling via Axios interceptors
- RFC 7807 Problem Details format support
- User-friendly error messages via Notistack notifications
- Field-specific validation error display

---

## 🧠 Additional Enhancements

Although not required by the specification, several improvements were added for better user experience, code quality, and maintainability:

- **Custom React hooks** (`useVehicles`, `useCreateVehicle`, `useDeleteVehicle`) for reusable data fetching and mutation logic
- **React Hook Form + Zod** for robust form validation and type-safe form handling
- **Notistack** for elegant toast notifications (success/error messages)
- **Delete confirmation dialog** with vehicle details preview before deletion
- **Layout components** (Header, Footer, AppLayout) for consistent page structure
- **Optimistic updates** for immediate UI feedback on delete operations
- **Loading states** with disabled form fields and buttons during API calls
- **Error handling** with RFC 7807 Problem Details format support from backend
- **404 Not Found page** for better navigation experience
- **TypeScript** throughout the application for type safety
- **Axios interceptors** for centralized error handling and notification display

---

## 🚀 Run Instructions

### Prerequisites

- **Node.js 18+** (or use the latest LTS version)
- **npm** (comes with Node.js)

### Installation

Install dependencies:

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory with the following variable:

```env
VITE_API_URL=http://localhost:8080
```

Replace `http://localhost:8080` with your backend API URL if different.

### Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Build for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 📚 Usage Examples

### Creating a Vehicle

1. Navigate to the home page (Vehicles Overview)
2. Click the "New" button in the top right
3. Fill in the form fields:
   - **Model**: e.g., "BMW 320"
   - **First Registration Year**: e.g., "2021" (exactly 4 digits)
   - **Cubic Capacity**: e.g., 2000 (1-9999)
   - **Fuel**: Select from dropdown (Diesel, Petrol, or Hybrid)
   - **Mileage**: e.g., 50000 (0-9,999,999)
4. Click "Save" to create the vehicle
5. You will be redirected to the overview page with a success notification

### Viewing Vehicles

All vehicles are automatically displayed in a table on the home page with the following columns:

- ID
- Model
- First Registration Year
- Cubic Capacity
- Fuel
- Mileage

### Deleting a Vehicle

1. Find the vehicle in the table
2. Click the "Delete" button in the corresponding row
3. A confirmation dialog will appear showing vehicle details
4. Confirm deletion or cancel
5. Upon confirmation, the vehicle will be removed with a success notification

---

## ❗ Error Handling

The application handles errors using the **RFC 7807 Problem Details** format returned by the backend:

- **Network errors** are caught and displayed via toast notifications
- **Validation errors** are shown both as toast notifications and inline form errors
- **404 errors** are handled with a dedicated Not Found page
- **API errors** are processed through Axios interceptors and displayed to users

### Error Response Format

The frontend expects error responses in the following format (matching backend):

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/api/vehicles",
  "code": "VALIDATION_ERROR",
  "errors": {
    "model": "must not be blank",
    "mileage": "must be greater than or equal to 0"
  },
  "traceId": "c1a9c7b1-7b7f-4b3a-9a3e-f9a1b2c3d4e5"
}
```

---

## 📄 Notes

- The application scope strictly follows the **Create, Read, and Delete** requirements defined in the specification.
- Features such as authentication, update operations, or advanced filtering were **excluded by design** to align with the project scope.
- Some additional improvements were made for code quality, user experience, and developer experience.
- The frontend communicates with the backend REST API using Axios, following RESTful conventions.
- All API requests are configured through the centralized Axios instance in `src/api/axios.ts`.

---

© 2025 — Developed by **Ilija Trifunović** as part of the Mühlbauer interview assignment.
