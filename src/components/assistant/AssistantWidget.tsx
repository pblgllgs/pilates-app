import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { askGroq, type ChatMessage } from "@/lib/data/assistant"
import { Bot, Send, User, X, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const WELCOME = "Hola, soy tu asistente de HipoFit. Pregúntame lo que necesites."

export function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: WELCOME }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading, open])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = input.trim()
    if (!content || loading) return
    setInput("")
    const history: ChatMessage[] = [...messages, { role: "user", content }]
    setMessages(history)
    setLoading(true)
    try {
      const reply = await askGroq(history)
      setMessages((m) => [...m, { role: "assistant" as const, content: reply }])
    } catch {
      toast.error("No se pudo contactar al asistente.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => setMessages([{ role: "assistant", content: WELCOME }])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Asistente IA"
        title="Asistente IA"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
      >
        {open ? <X className="size-6" /> : <Bot className="size-7" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          <div className="flex items-center gap-2 border-b bg-primary px-4 py-3 text-primary-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-white/20">
              <Bot className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Asistente IA</p>
              <p className="text-xs text-primary-foreground/80">Solo administradores</p>
            </div>
            <Button variant="ghost" size="icon" onClick={reset} title="Limpiar conversación" className="text-primary-foreground hover:bg-white/20">
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-2", m.role === "user" && "justify-end")}>
                {m.role === "assistant" && (
                  <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "border bg-card text-foreground"
                  )}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="size-4" />
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl border bg-card px-4 py-3">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
