export type VideoType = "free" | "paid"

export interface Video {
  id: string
  title: string
  description: string
  type: VideoType
  price?: number
  currency: string
  category: string
  level?: string
  duration?: number
  thumbnailUrl?: string
  playableUrl?: string
  status: "published" | "draft"
  featured?: boolean
  createdAt: number
}

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: "month" | "semester" | "year"
  features: string[]
  active: boolean
}

export interface Profile {
  id?: string
  uid: string
  email: string
  name?: string
  isAdmin: boolean
  createdAt: number
  fotoPerfil?: string
}

export interface Purchase {
  id: string
  uid: string
  videoId: string
  videoTitle: string
  amount: number
  currency: string
  status: "approved" | "pending" | "rejected"
  mpPaymentId?: string
  createdAt: number
}

export interface Subscription {
  uid: string
  planId: string
  planName: string
  status: "active" | "paused" | "cancelled"
  startDate: number
  endDate: number
  mpSubscriptionId?: string
  createdAt: number
}

export interface Order {
  id: string
  uid: string
  kind: "purchase" | "subscription"
  videoId?: string
  planId?: string
  amount: number
  currency: string
  status: "created" | "pending" | "approved" | "rejected"
  mpId?: string
  createdAt: number
}

export interface PurchaseRequest {
  id: string
  uid: string
  kind: "purchase" | "subscription"
  videoId?: string
  videoTitle?: string
  planId?: string
  planName?: string
  amount?: number
  currency?: string
  status: "pending" | "approved" | "rejected"
  createdAt: number
  decidedAt?: number
  userName?: string
  userEmail?: string
}

export interface Review {
  id: string
  uid: string
  videoId: string
  videoTitle: string
  userName: string
  comment: string
  rating: number
  status: "pending" | "approved"
  featured: boolean
  createdAt: number
  photoUrl?: string
}
