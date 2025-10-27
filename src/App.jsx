import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { ClimbingBoxLoader } from "react-spinners";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loading des pages
const Onboarding = lazy(() => import("./pages/Onboarding"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const PendingApproval = lazy(() => import("./pages/PendingApproval"));
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Messages = lazy(() => import("./pages/Messages"));
const Games = lazy(() => import("./pages/Games"));
const Infos = lazy(() => import("./pages/Infos"));
const Money = lazy(() => import("./pages/Money"));
const Weather = lazy(() => import("./pages/Weather"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const LocationRequests = lazy(() => import("./pages/LocationRequests"));
const NotFound = lazy(() => import("./pages/NotFound"));

const protectedRoutes = [
  { path: "home", element: Home },
  { path: "profile", element: Profile },
  { path: "dashboard", element: Dashboard },
  { path: "messages", element: Messages },
  { path: "games", element: Games },
  { path: "infos", element: Infos },
  { path: "money", element: Money },
  { path: "weather", element: Weather },
  { path: "marketplace", element: Marketplace },
  { path: "location-requests", element: LocationRequests },
];

function App() {
  return (
    <>
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <ClimbingBoxLoader
              color="var(--color-primary)"
              size={20}
              loading={true}
            />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="update-password" element={<UpdatePassword />} />
            <Route path="pending-approval" element={<PendingApproval />} />

            <Route element={<ProtectedRoute />}>
              {protectedRoutes.map(({ path, element: Element }) => (
                <Route key={path} path={path} element={<Element />} />
              ))}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
