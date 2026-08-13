import { useEffect } from "react"
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth, logout } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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
import { AssistantWidget } from "@/components/assistant/AssistantWidget"
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
  { to: "/nosotros", label: "Nosotros" },
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
        <Link to="/" className="flex items-center gap-1.5">
          <PlayCircle className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-normal tracking-tight">
            HipoFit<span className="text-primary">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "border-b text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
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
                    toast.success("Sesión cerrada. ¡Hasta pronto!")
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
          <div className="flex items-center gap-1.5">
            <PlayCircle className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-normal tracking-tight">
              HipoFit<span className="text-primary">.</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Clases de hipopresivos online con instrucción profesional. Suscríbete a todo el catálogo o compra solo las clases
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
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Explorar
          </h3>
          <nav className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Inicio
            </Link>
            <Link to="/videos" className="hover:text-primary">
              Clases
            </Link>
            <Link to="/precios" className="hover:text-primary">
              Precios
            </Link>
            <Link to="/nosotros" className="hover:text-primary">
              Nosotros
            </Link>
            <Link to="/mis-contenidos" className="hover:text-primary">
              Mis contenidos
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Legal
          </h3>
          <nav className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <Link to="/terminos" className="hover:text-primary">
              Términos y condiciones
            </Link>
            <Link to="/privacidad" className="hover:text-primary">
              Política de privacidad
            </Link>
            <Link to="/contacto" className="hover:text-primary">
              Contacto
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} HipoFit. Todos los derechos reservados.</p>
          <p>Hecho con 💛 para tu práctica diaria.</p>
        </div>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  const { profile } = useAuth()
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <a
        href="https://wa.me/56942805654"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        title="Escríbenos por WhatsApp"
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110"
      >
        <svg viewBox="0 0 24 24" className="size-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      </a>

      {profile?.isAdmin && <AssistantWidget />}
    </div>
  )
}
