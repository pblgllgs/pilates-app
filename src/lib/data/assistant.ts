import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function askGroq(messages: ChatMessage[]): Promise<string> {
  const callable = httpsCallable<unknown, { content: string }>(functions, "groqAssistant")
  const res = await callable({ messages })
  return res.data.content
}
