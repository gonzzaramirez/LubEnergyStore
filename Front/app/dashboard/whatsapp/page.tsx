"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  startWhatsApp,
  getWhatsappStatus,
  logoutWhatsApp,
  type WaStatusType,
  type WhatsappStatusResponse,
} from "@/lib/api/whatsapp";
import { Smartphone, QrCode, Wifi, WifiOff, Loader2, LogOut, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WaStatusType }) {
  const map: Record<WaStatusType, { label: string; className: string; Icon: React.ElementType }> = {
    ready: { label: "Conectado", className: "bg-green-100 text-green-700 border-green-200", Icon: CheckCircle2 },
    qr: { label: "Esperando QR", className: "bg-yellow-100 text-yellow-700 border-yellow-200", Icon: QrCode },
    initializing: { label: "Iniciando…", className: "bg-blue-100 text-blue-700 border-blue-200", Icon: Loader2 },
    connecting: { label: "Conectando…", className: "bg-blue-100 text-blue-700 border-blue-200", Icon: Loader2 },
    disconnected: { label: "Desconectado", className: "bg-slate-100 text-slate-600 border-slate-200", Icon: WifiOff },
    reconnecting: { label: "Reconectando…", className: "bg-orange-100 text-orange-700 border-orange-200", Icon: RefreshCw },
    error: { label: "Error", className: "bg-red-100 text-red-700 border-red-200", Icon: AlertCircle },
  };

  const cfg = map[status] ?? map.disconnected;
  const Icon = cfg.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${cfg.className}`}>
      <Icon className={`w-4 h-4 ${["initializing", "connecting", "reconnecting"].includes(status) ? "animate-spin" : ""}`} />
      {cfg.label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WhatsAppPage() {
  const [info, setInfo] = useState<WhatsappStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getWhatsappStatus();
      setInfo(data);
      setError(null);

      // Detener polling si ya está listo o hay error permanente
      if (data.status === "ready" || data.status === "error") {
        stopPolling();
      }
    } catch {
      setError("No se pudo obtener el estado de WhatsApp");
    } finally {
      setLoading(false);
    }
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollingRef.current = setInterval(fetchStatus, 5000);
  }, [fetchStatus, stopPolling]);

  useEffect(() => {
    fetchStatus();
    return () => stopPolling();
  }, [fetchStatus, stopPolling]);

  const handleConnect = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await startWhatsApp();
      if (result.qr) {
        setInfo({ status: "qr", isReady: false, qr: result.qr });
      } else {
        setInfo({ status: "initializing", isReady: false });
      }
      startPolling();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al conectar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("¿Confirmas que querés desconectar WhatsApp?")) return;
    setActionLoading(true);
    try {
      await logoutWhatsApp();
      stopPolling();
      await fetchStatus();
    } catch {
      setError("Error al desconectar");
    } finally {
      setActionLoading(false);
    }
  };

  const qrSrc = info?.qr
    ? info.qr.startsWith("data:image")
      ? info.qr
      : `data:image/png;base64,${info.qr}`
    : null;

  const isPolling = ["qr", "initializing", "connecting", "reconnecting"].includes(info?.status ?? "");

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-green-50 rounded-lg border border-green-100">
          <Smartphone className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">WhatsApp</h1>
          <p className="text-sm text-slate-500">Sesión del admin para envío de recordatorios</p>
        </div>
      </div>

      {/* Estado */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-slate-700">Estado de conexión</span>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <StatusBadge status={info?.status ?? "disconnected"} />
          )}
        </div>

        {isPolling && (
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Actualizando automáticamente…
          </p>
        )}

        {info?.message && (
          <p className="text-sm text-slate-500 mt-2">{info.message}</p>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* QR */}
      {qrSrc && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <QrCode className="w-5 h-5" />
            Escanea con WhatsApp
          </div>
          <img
            src={qrSrc}
            alt="QR WhatsApp"
            className="w-56 h-56 rounded-lg border border-slate-100 shadow-sm"
          />
          <p className="text-xs text-slate-400 text-center">
            Abrí WhatsApp → Dispositivos vinculados → Vincular dispositivo
          </p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3">
        {info?.status !== "ready" && (
          <button
            onClick={handleConnect}
            disabled={actionLoading || loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700
              text-white rounded-lg text-sm font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            {actionLoading ? "Conectando…" : "Conectar"}
          </button>
        )}

        {info?.status === "ready" && (
          <button
            onClick={handleDisconnect}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700
              text-white rounded-lg text-sm font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Desconectar
          </button>
        )}

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50
            text-slate-700 border border-slate-200 rounded-lg text-sm font-medium
            transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Info de variables */}
      {!process.env.NEXT_PUBLIC_API_URL && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <strong>Atención:</strong> Configurá <code>NEXT_PUBLIC_API_URL</code>,{" "}
          <code>EVOLUTION_API_URL</code> y <code>EVOLUTION_API_KEY</code> en el backend.
        </div>
      )}
    </div>
  );
}
