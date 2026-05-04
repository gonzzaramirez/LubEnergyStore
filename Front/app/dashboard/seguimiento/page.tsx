"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getTrackers,
  getCreatineProducts,
  createTracker,
  deleteTracker,
  sendRemindersNow,
  getWhatsappMessages,
  type CreatineTracker,
  type CreatineProduct,
  type WhatsappMessage,
  type CreateTrackerPayload,
} from "@/lib/api/whatsapp";
import {
  Clock,
  Plus,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Users,
  X,
  RefreshCw,
  Bell,
  Package,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const now = new Date();
  const expiry = new Date(dateStr);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Days badge ────────────────────────────────────────────────────────────────

function DaysBadge({ expiryDate }: { expiryDate: string }) {
  const days = daysUntil(expiryDate);

  let cls = "";
  let label = "";

  if (days < 0) {
    cls = "bg-slate-100 text-slate-500 border-slate-200";
    label = "Expirado";
  } else if (days <= 7) {
    cls = "bg-red-100 text-red-700 border-red-200";
    label = `${days}d restantes`;
  } else if (days <= 14) {
    cls = "bg-yellow-100 text-yellow-700 border-yellow-200";
    label = `${days}d restantes`;
  } else {
    cls = "bg-green-100 text-green-700 border-green-200";
    label = `${days}d restantes`;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Client card ───────────────────────────────────────────────────────────────

function ClientCard({
  tracker,
  onDelete,
}: {
  tracker: CreatineTracker;
  onDelete: (id: string) => void;
}) {
  const days = daysUntil(tracker.expiryDate);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{tracker.customerName}</p>
          <p className="text-sm text-slate-500">{tracker.customerPhone}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {tracker.source === "WEB" ? (
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
              Web
            </span>
          ) : (
            <span className="text-xs bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
              Manual
            </span>
          )}
          <button
            onClick={() => onDelete(tracker.id)}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Producto */}
      <div className="flex items-center gap-2 text-slate-700">
        <Package className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-sm font-medium truncate">{tracker.productName}</span>
        <span className="text-xs text-slate-400 shrink-0">{tracker.weightGrams}g</span>
      </div>

      {/* Días badge */}
      <div className="flex items-center justify-between">
        <DaysBadge expiryDate={tracker.expiryDate} />
        {tracker.reminderSentAt && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Bell className="w-3 h-3" />
            Recordatorio enviado
          </span>
        )}
      </div>

      {/* Fechas */}
      <div className="border-t border-slate-100 pt-2 grid grid-cols-2 gap-1 text-xs text-slate-400">
        <span>Compra: {formatDate(tracker.purchaseDate)}</span>
        <span className="text-right">
          {days < 0 ? "Venció" : "Vence"}: {formatDate(tracker.expiryDate)}
        </span>
      </div>
    </div>
  );
}

// ── Add tracker modal ─────────────────────────────────────────────────────────

function AddTrackerModal({
  products,
  onClose,
  onSave,
}: {
  products: CreatineProduct[];
  onClose: () => void;
  onSave: (data: CreateTrackerPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<{
    customerName: string;
    customerPhone: string;
    productId: string;
    productName: string;
    weightGrams: string;
    purchaseDate: string;
  }>({
    customerName: "",
    customerPhone: "",
    productId: "",
    productName: "",
    weightGrams: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProductChange = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    setForm((f) => ({
      ...f,
      productId,
      productName: p?.name ?? "",
      weightGrams: p?.weightGrams ? String(p.weightGrams) : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.productName || !form.weightGrams) {
      setError("Completá todos los campos obligatorios");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        productName: form.productName.trim(),
        weightGrams: parseInt(form.weightGrams),
        purchaseDate: new Date(form.purchaseDate).toISOString(),
        productId: form.productId || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Agregar seguimiento manual</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre del cliente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              placeholder="Ej: Juan García"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
              placeholder="Ej: 1155556789"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Seleccionar creatina del stock
            </label>
            <select
              value={form.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
            >
              <option value="">— Seleccionar producto —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.weightGrams ? `(${p.weightGrams}g)` : ""} — Stock: {p.stockQuantity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre del producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.productName}
              onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
              placeholder="Ej: Creatina Monohidrato 300g"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Peso (gramos) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.weightGrams}
                onChange={(e) => setForm((f) => ({ ...f, weightGrams: e.target.value }))}
                placeholder="300"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha de compra <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
          </div>

          {form.weightGrams && (
            <p className="text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-lg">
              A 5g/día → <strong>{Math.floor(parseInt(form.weightGrams) / 5)} días</strong> de vida útil
            </p>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Message status badge ──────────────────────────────────────────────────────

function MsgStatusBadge({ status }: { status: WhatsappMessage["status"] }) {
  const map = {
    SENT: { label: "Enviado", cls: "bg-green-100 text-green-700" },
    FAILED: { label: "Falló", cls: "bg-red-100 text-red-700" },
    PENDING: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-700" },
  };
  const cfg = map[status];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "clients" | "messages";

export default function SeguimientoPage() {
  const [tab, setTab] = useState<Tab>("clients");
  const [trackers, setTrackers] = useState<CreatineTracker[]>([]);
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);
  const [products, setProducts] = useState<CreatineProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p, m] = await Promise.all([
        getTrackers(),
        getCreatineProducts(),
        getWhatsappMessages(),
      ]);
      setTrackers(t);
      setProducts(p);
      setMessages(m);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este seguimiento?")) return;
    await deleteTracker(id);
    setTrackers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSave = async (data: CreateTrackerPayload) => {
    await createTracker(data);
    await loadData();
  };

  const handleSendReminders = async () => {
    setReminderLoading(true);
    setReminderResult(null);
    try {
      const result = await sendRemindersNow();
      setReminderResult(`${result.sent} enviados, ${result.failed} fallidos`);
      await loadData();
    } catch {
      setReminderResult("Error al enviar recordatorios");
    } finally {
      setReminderLoading(false);
    }
  };

  // Stats
  const expiredCount = trackers.filter((t) => daysUntil(t.expiryDate) < 0).length;
  const criticalCount = trackers.filter((t) => {
    const d = daysUntil(t.expiryDate);
    return d >= 0 && d <= 7;
  }).length;
  const pendingReminderCount = trackers.filter(
    (t) => daysUntil(t.expiryDate) <= 7 && !t.reminderSentAt
  ).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black rounded-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Seguimiento de Creatinas</h1>
            <p className="text-sm text-slate-500">
              Recordatorios automáticos de recompra por WhatsApp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button
            onClick={handleSendReminders}
            disabled={reminderLoading || pendingReminderCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {reminderLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar recordatorios {pendingReminderCount > 0 ? `(${pendingReminderCount})` : ""}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-black hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar manual
          </button>
        </div>
      </div>

      {/* Resultado recordatorios */}
      {reminderResult && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {reminderResult}
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total activos", value: trackers.length, cls: "text-slate-900" },
          { label: "Críticos (≤7d)", value: criticalCount, cls: "text-red-600" },
          { label: "Expirados", value: expiredCount, cls: "text-slate-400" },
          { label: "Mensajes enviados", value: messages.filter((m) => m.status === "SENT").length, cls: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setTab("clients")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "clients"
              ? "border-black text-black"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          Clientes ({trackers.length})
        </button>
        <button
          onClick={() => setTab("messages")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "messages"
              ? "border-black text-black"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Mensajes enviados ({messages.length})
        </button>
      </div>

      {/* Tab: Clientes */}
      {tab === "clients" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : trackers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <Bell className="w-10 h-10 opacity-30" />
              <p className="font-medium">No hay seguimientos todavía</p>
              <p className="text-sm">
                Agregá uno manualmente o esperá que llegue un pedido de creatina por la web
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trackers.map((t) => (
                <ClientCard key={t.id} tracker={t} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Mensajes */}
      {tab === "messages" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <MessageSquare className="w-10 h-10 opacity-30" />
              <p className="font-medium">No hay mensajes enviados todavía</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Teléfono</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide hidden lg:table-cell">Contenido</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide hidden sm:table-cell">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {messages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{msg.toName}</td>
                      <td className="px-4 py-3 text-slate-500">{msg.toPhone}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell max-w-xs">
                        <p className="truncate">{msg.content}</p>
                      </td>
                      <td className="px-4 py-3">
                        <MsgStatusBadge status={msg.status} />
                        {msg.errorMessage && (
                          <p className="text-xs text-red-500 mt-0.5 truncate max-w-xs">{msg.errorMessage}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell whitespace-nowrap">
                        {msg.sentAt ? formatDate(msg.sentAt) : formatDate(msg.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <AddTrackerModal
          products={products}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
