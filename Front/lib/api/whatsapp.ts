const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Types ────────────────────────────────────────────────────────────────────

export type WaStatusType = 'ready' | 'qr' | 'initializing' | 'disconnected' | 'error' | 'reconnecting' | 'connecting';

export interface WhatsappStatusResponse {
  status: WaStatusType;
  isReady: boolean;
  qr?: string | null;
  message?: string;
}

export interface WhatsappStartResponse {
  success: boolean;
  message: string;
  qr?: string;
}

export interface WhatsappMessage {
  id: string;
  toPhone: string;
  toName: string;
  content: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  errorMessage?: string | null;
  relatedTrackerId?: string | null;
  createdAt: string;
  sentAt?: string | null;
}

export interface CreatineProduct {
  id: string;
  name: string;
  imageUrl?: string | null;
  stockQuantity: number;
  price: number;
  weightGrams: number | null;
  category: { name: string };
}

export interface CreatineTracker {
  id: string;
  customerName: string;
  customerPhone: string;
  productId?: string | null;
  productName: string;
  weightGrams: number;
  purchaseDate: string;
  expiryDate: string;
  source: 'WEB' | 'MANUAL';
  orderId?: string | null;
  reminderSentAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string; imageUrl?: string | null } | null;
}

export interface CreateTrackerPayload {
  customerName: string;
  customerPhone: string;
  productName: string;
  weightGrams: number;
  purchaseDate: string;
  productId?: string;
}

// ── WhatsApp session ─────────────────────────────────────────────────────────

export async function startWhatsApp(): Promise<WhatsappStartResponse> {
  const res = await fetch(`${API_URL}/whatsapp/start`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al iniciar WhatsApp');
  return res.json();
}

export async function getWhatsappStatus(): Promise<WhatsappStatusResponse> {
  const res = await fetch(`${API_URL}/whatsapp/status`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener estado de WhatsApp');
  return res.json();
}

export async function logoutWhatsApp(): Promise<void> {
  const res = await fetch(`${API_URL}/whatsapp/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al desconectar WhatsApp');
}

export async function getWhatsappMessages(): Promise<WhatsappMessage[]> {
  const res = await fetch(`${API_URL}/whatsapp/messages`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener mensajes');
  return res.json();
}

// ── Creatine tracker ─────────────────────────────────────────────────────────

export async function getTrackers(): Promise<CreatineTracker[]> {
  const res = await fetch(`${API_URL}/creatine-tracker`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener trackers');
  return res.json();
}

export async function getCreatineProducts(): Promise<CreatineProduct[]> {
  const res = await fetch(`${API_URL}/creatine-tracker/products`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener productos de creatina');
  return res.json();
}

export async function createTracker(data: CreateTrackerPayload): Promise<CreatineTracker> {
  const res = await fetch(`${API_URL}/creatine-tracker`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Error al crear tracker');
  }
  return res.json();
}

export async function deleteTracker(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/creatine-tracker/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al eliminar tracker');
}

export async function sendRemindersNow(): Promise<{ sent: number; failed: number }> {
  const res = await fetch(`${API_URL}/creatine-tracker/reminders/send-now`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al enviar recordatorios');
  return res.json();
}
