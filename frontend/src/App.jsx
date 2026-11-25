import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import PageLoader from "./components/PageLoader";
import useAuthUser from "./hooks/useAuthUser";
import { useThemeStore } from "./store/useThemeStore";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import OnboardingPage from "./pages/Onboardingpage";
import SignUpPage from "./pages/SignUpPage";

const queryClient = new QueryClient();

function RequireAuth({ children, onboarding = false }) {
  const { authUser, isLoading } = useAuthUser();

  if (isLoading) return <PageLoader />;
  if (!authUser) return <Navigate to="/login" replace />;
  if (!authUser.isOnboarded && !onboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  if (authUser.isOnboarded && onboarding) return <Navigate to="/" replace />;

  return children;
}

function GuestOnly({ children }) {
  const { authUser, isLoading } = useAuthUser();

  if (isLoading) return <PageLoader />;
  if (authUser) {
    return <Navigate to={authUser.isOnboarded ? "/" : "/onboarding"} replace />;
  }

  return children;
}

function AppRoutes() {
  const theme = useThemeStore((state) => state.theme);

  return (
    <div data-theme={theme} className="min-h-screen bg-base-100 text-base-content">
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestOnly>
              <SignUpPage />
            </GuestOnly>
          }
        />
        <Route
          path="/onboarding"
          element={
            <RequireAuth onboarding>
              <OnboardingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout showSidebar>
                <HomePage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/friends"
          element={
            <RequireAuth>
              <Navigate to="/" replace />
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <Layout showSidebar>
                <NotificationsPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <RequireAuth>
              <Layout>
                <ChatPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/call/:id"
          element={
            <RequireAuth>
              <CallPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
