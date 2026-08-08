import { useEffect } from "react"
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth, logout } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogOut, PlayCircle, Settings, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: (
      <>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: (
      <>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    path: (
      <path d="M9 12a4 4 0 1 0 4 4V4c.5 2.5 2.5 4 5 4" />
    ),
  },
]

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/videos", label: "Clases" },
  { to: "/precios", label: "Precios" },
]

export function PublicNavbar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const initials = (profile?.name ?? user?.email ?? "U")
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")

  useEffect(() => {
    if (user) useAuth.getState().refreshProfile()
  }, [user])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <PlayCircle className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold tracking-tight">PilatesStudio</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {profile?.isAdmin && (
                <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => navigate("/admin")}>
                  <LayoutDashboard className="size-4" /> Panel admin
                </Button>
              )}
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9">
                    {profile?.fotoPerfil && <AvatarImage src={profile.fotoPerfil} alt="Foto de perfil" />}
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="break-words text-sm font-medium">{profile?.name ?? user.email}</span>
                    {profile?.isAdmin && <span className="text-xs text-muted-foreground">Administrador</span>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/mis-contenidos")}>
                  <Sparkles className="size-4" /> Mis contenidos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/perfil")}>
                  <User className="size-4" /> Mi perfil
                </DropdownMenuItem>
                {profile?.isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="size-4" /> Panel admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/precios")}>
                  <Settings className="size-4" /> Planes
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={async () => {
                    await logout()
                    navigate("/")
                  }}
                >
                  <LogOut className="size-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden sm:inline-flex">
                Iniciar sesión
              </Button>
              <Button size="sm" onClick={() => navigate("/registro")}>
                Crear cuenta
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-tight">PilatesStudio</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Clases de pilates online con instrucción profesional. Suscríbete a todo el catálogo o compra solo las clases
            que necesites.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {s.path}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explorar</h3>
          <nav className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Inicio
            </Link>
            <Link to="/videos" className="hover:text-foreground">
              Clases
            </Link>
            <Link to="/precios" className="hover:text-foreground">
              Precios
            </Link>
            <Link to="/mis-contenidos" className="hover:text-foreground">
              Mis contenidos
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Legal</h3>
          <nav className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/terminos" className="hover:text-foreground">
              Términos y condiciones
            </Link>
            <Link to="/privacidad" className="hover:text-foreground">
              Política de privacidad
            </Link>
            <Link to="/contacto" className="hover:text-foreground">
              Contacto
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} PilatesStudio. Todos los derechos reservados.</p>
          <p>Hecho con 💛 para tu práctica diaria.</p>
        </div>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
