import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register"; /* ✅ NEW: IMPORT FOR REGISTER */
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import ClientLayout from "../layouts/client/ClientLayout";
import AdminLayout from "../layouts/admin/AdminLayout";

import ClientDashboard from "../pages/client/Dashboard";
import MyOrders from "../pages/client/orders/MyOrders";
import CreateOrder from "../pages/client/orders/CreateOrder";



/* NEW CLIENT PAGES */
import ClientBarcodePrint
  from "../pages/client/BarcodePrint";

import WaybillRequest
  from "../pages/client/WaybillRequest";


import AdminDashboard from "../pages/admin/Dashboard";
import AllOrders from "../pages/admin/AllOrders";
import BranchOrders from "../pages/admin/BranchOrders";
import Profile from "../pages/admin/Profile";
import Reports from "../pages/admin/Reports";

import Users from "../pages/admin/users/Users";

import ProtectedRoute from "../components/ProtectedRoute";

import Invoices from "../pages/client/Invoices";

import ProcessingOrders from "../pages/client/ProcessingOrders";

import WaybillManagement from "../pages/admin/WaybillManagement";

import ClientProfile from "../pages/client/Profile";
import ComingSoon from "../pages/ComingSoon";

function AppRoutes() {

  return (

    <Routes>


      {/* ================= PUBLIC ================= */}

      <Route
        path="/"
        element={<Login />}
      />

      {/* ✅ NEW: LOGIN AND REGISTER ROUTES */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />






      {/* ================= CLIENT ================= */}

      <Route

        path="/client"

        element={

          <ProtectedRoute role="Client">

            <ClientLayout />

          </ProtectedRoute>

        }

      >


        <Route
          index
          element={<ClientDashboard />}
        />


        <Route
          path="dashboard"
          element={<ClientDashboard />}
        />



        {/* MY ORDERS */}

        <Route
          path="orders"
          element={<MyOrders />}
        />



        {/* CREATE ORDER */}

        <Route
          path="orders/create"
          element={<CreateOrder />}
        />

        <Route
          path="invoices"
          element={<Invoices />}
        />


<Route
path="processing"
element={<ProcessingOrders />}
/>

        {/* NEW CLIENT BARCODE PRINT */}

        <Route

          path="barcode"

          element={
            <ClientBarcodePrint />
          }

        />



        {/* NEW WAYBILL REQUEST */}

        <Route

          path="waybill-request"

          element={
            <WaybillRequest />
          }

        />

        <Route
          path="profile"
          element={<ClientProfile />}
        />

        {/* Coming Soon Routes */}
        <Route path="returned" element={<ComingSoon />} />
        <Route path="age" element={<ComingSoon />} />
        <Route path="receivable" element={<ComingSoon />} />
        <Route path="received" element={<ComingSoon />} />
        <Route path="pickups" element={<ComingSoon />} />

      </Route>







      {/* ================= ADMIN ================= */}

      <Route

        path="/admin"

        element={

          <ProtectedRoute role="Admin">

            <AdminLayout />

          </ProtectedRoute>

        }

      >


        <Route
          index
          element={<AdminDashboard />}
        />


        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />



        <Route
          path="reports"
          element={<Reports />}
        />



        <Route
          path="users"
          element={<Users />}
        />



        <Route
          path="orders"
          element={<AllOrders />}
        />



        <Route
          path="branch-orders"
          element={<BranchOrders />}
        />


        <Route
          path="profile"
          element={<Profile />}
        />

        {/* Coming Soon Routes */}
        <Route path="cities" element={<ComingSoon />} />
        <Route path="notify" element={<ComingSoon />} />

<Route
  path="waybill-management"
  element={
    <ProtectedRoute>
      <WaybillManagement />
    </ProtectedRoute>
  }
/>

      </Route>

    </Routes>

  );

}

export default AppRoutes;