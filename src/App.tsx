import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { ProtectedRoute, AdminRoute } from "@/components/routing"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"

const Home = lazy(() => import("@/pages/Home"))
const Videos = lazy(() => import("@/pages/Videos"))
const VideoDetail = lazy(() => import("@/pages/VideoDetail"))
const Pricing = lazy(() => import("@/pages/Pricing"))
const Login = lazy(() => import("@/pages/Login"))
const Register = lazy(() => import("@/pages/Register"))
const MyContent = lazy(() => import("@/pages/MyContent"))
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"))
const AdminVideos = lazy(() => import("@/pages/admin/AdminVideos"))
const AdminVideoForm = lazy(() => import("@/pages/admin/AdminVideoForm"))
const AdminPlans = lazy(() => import("@/pages/admin/AdminPlans"))
const AdminRequests = lazy(() => import("@/pages/admin/AdminRequests"))
const AdminReviews = lazy(() => import("@/pages/admin/AdminReviews"))
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"))
const Profile = lazy(() => import("@/pages/Profile"))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="pilates-theme">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/videos/:id" element={<VideoDetail />} />
            <Route path="/precios" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route
              path="/mis-contenidos"
              element={
                <ProtectedRoute>
                  <MyContent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="videos/nuevo" element={<AdminVideoForm />} />
            <Route path="videos/:id/editar" element={<AdminVideoForm />} />
            <Route path="solicitudes" element={<AdminRequests />} />
            <Route path="planes" element={<AdminPlans />} />
            <Route path="comentarios" element={<AdminReviews />} />
            <Route path="usuarios" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  )
}
