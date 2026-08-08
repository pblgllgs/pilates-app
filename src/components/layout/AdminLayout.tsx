import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { logout } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LayoutDashboard, PlayCircle, Receipt, Video, Hourglass, MessageSquare, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/solicitudes", label: "Solicitudes", icon: Hourglass, end: false },
  { to: "/admin/videos", label: "Videos", icon: Video, end: false },
  { to: "/admin/planes", label: "Planes", icon: Receipt, end: false },
  { to: "/admin/comentarios", label: "Comentarios", icon: MessageSquare, end: false },
  { to: "/admin/usuarios", label: "Usuarios", icon: Users, end: false },
]

export function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r bg-muted/30 p-4 md:flex">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <PlayCircle className="h-6 w-6 text-primary" />
          <span className="font-bold tracking-tight">PilatesStudio</span>
          <span className="ml-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            ADMIN
          </span>
        </Link>

        <nav className="mt-6 flex flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  isActive ? "bg-primary text-primary-foreground hover:bg-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-1">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/")}>
            <ArrowLeft className="size-4" /> Ver sitio
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={async () => {
              await logout()
              navigate("/")
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
          <Link to="/admin" className="flex items-center gap-2 font-bold">
            <PlayCircle className="h-6 w-6 text-primary" /> Admin
          </Link>
          <nav className="ml-auto flex gap-1">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted">
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
