import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register"; /* ✅ NEW: IMPORT FOR REGISTER */
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import ClientLayout from "../layouts/client/ClientLayout";
import AdminLayout from "../layouts/admin/AdminLayout";
import SortingLayout from "../layouts/sorting/SortingLayout";

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
import OrderDetails from "../pages/admin/OrderDetails";
import BranchOrders from "../pages/admin/BranchOrders";
import Profile from "../pages/admin/Profile";
import Reports from "../pages/admin/Reports";

import Users from "../pages/admin/users/Users";
import Administration from "../pages/admin/users/Administration";

import ProtectedRoute from "../components/ProtectedRoute";

import Invoices from "../pages/client/Invoices";

import ProcessingOrders from "../pages/client/ProcessingOrders";

import WaybillManagement from "../pages/admin/WaybillManagement";

import ClientProfile from "../pages/client/Profile";
import ComingSoon from "../pages/ComingSoon";
import Cities from "../pages/admin/Cities";
import Branches from "../pages/admin/Branches";
import BranchManagers from "../pages/admin/BranchManagers";
import Notifications from "../pages/admin/Notifications";
import BranchDashboardSelect from "../pages/admin/BranchDashboardSelect";
import AdminBranchOrdersSelect from "../pages/admin/AdminBranchOrdersSelect";
import BranchDashboard from "../pages/admin/BranchDashboard";
import Riders from "../pages/admin/Riders";

/* SORTING PAGES */
import SortingDashboard from "../pages/sorting/Dashboard";
import InboundScans from "../pages/sorting/InboundScans";
import OutboundScans from "../pages/sorting/OutboundScans";
import ExpectedInbound from "../pages/sorting/ExpectedInbound";
import HubInventory from "../pages/sorting/HubInventory";
import HubHistory from "../pages/sorting/HubHistory";

/* RIDER APP PAGES */
import RiderLayout from "../layouts/rider/RiderLayout";
import RiderPending from "../pages/rider/RiderPending";
import RiderCompleted from "../pages/rider/RiderCompleted";
import RiderFailed from "../pages/rider/RiderFailed";

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
          path="branch-dashboard-select"
          element={<BranchDashboardSelect />}
        />

        <Route
          path="branch-dashboard/:branchId"
          element={<BranchDashboard />}
        />

        <Route
          path="reports"
          element={<Reports />}
        />




        <Route
          path="orders"
          element={<AllOrders />}
        />

        <Route
          path="order-details/:trackingNumber"
          element={<OrderDetails />}
        />



        <Route
          path="branch-orders-select"
          element={<AdminBranchOrdersSelect />}
        />

        <Route
          path="branch-orders"
          element={<BranchOrders />}
        />
        <Route
          path="branch-orders/:branchId"
          element={<BranchOrders />}
        />


        <Route
          path="profile"
          element={<Profile />}
        />

        <Route path="cities" element={<Cities />} />
        <Route path="branches" element={<Branches />} />
        <Route path="branch-managers" element={<BranchManagers />} />
        <Route path="users" element={<Users />} />
        <Route path="administration" element={<Administration />} />
        <Route path="notify" element={<Notifications />} />
        <Route path="riders" element={<Riders />} />
        <Route path="barcode" element={<ClientBarcodePrint />} />

        <Route
          path="waybill-management"
          element={
            <ProtectedRoute>
              <WaybillManagement />
            </ProtectedRoute>
          }
        />

      </Route>

      {/* ================= SORTING HUB ================= */}
      {/* SORTING MANAGER ROUTES */}
      <Route path="/sorting" element={<ProtectedRoute role="SortingCenterManager"><SortingLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SortingDashboard />} />
        <Route path="expected" element={<ExpectedInbound />} />
        <Route path="inventory" element={<HubInventory />} />
        <Route path="history" element={<HubHistory />} />
        <Route path="inbound" element={<InboundScans />} />
        <Route path="outbound" element={<OutboundScans />} />
        <Route path="order-details/:trackingNumber" element={<OrderDetails />} />
      </Route>

      {/* ================= RIDER APP ================= */}
      <Route path="/rider" element={<ProtectedRoute role="Rider"><RiderLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="pending" replace />} />
        <Route path="pending" element={<RiderPending />} />
        <Route path="completed" element={<RiderCompleted />} />
        <Route path="failed" element={<RiderFailed />} />
      </Route>

    </Routes>

  );

}

export default AppRoutes;