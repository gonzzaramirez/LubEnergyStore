"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./components/columns";
import { OrderDetailDialog } from "./components/order-detail-dialog";
import { TrackingDialog } from "./components/tracking-dialog";
import { Order, OrderStatus, OrderStats } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import {
  getOrders,
  getOrderStats,
  updateOrderStatus,
  updateOrderTracking,
} from "@/lib/api/order";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  DollarSign,
} from "lucide-react";

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Diálogos
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);

  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const statusFilter =
        activeTab === "all" ? undefined : (activeTab as OrderStatus);
      const [ordersData, statsData] = await Promise.all([
        getOrders(statusFilter),
        getOrderStats(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      toast.error("Error al cargar los pedidos");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleView = (order: Order) => {
    setViewingOrder(order);
    setViewDialogOpen(true);
  };

  const handleConfirm = (order: Order) => {
    setConfirmingOrder(order);
    setConfirmDialogOpen(true);
  };

  const confirmPayment = async () => {
    if (!confirmingOrder) return;

    try {
      await updateOrderStatus(confirmingOrder.id, "CONFIRMED");
      toast.success("Pago confirmado. Se envió email al cliente.");
      fetchData();
    } catch (error) {
      toast.error("Error al confirmar el pago");
    } finally {
      setConfirmDialogOpen(false);
      setConfirmingOrder(null);
    }
  };

  const handleAddTracking = (order: Order) => {
    setTrackingOrder(order);
    setTrackingDialogOpen(true);
  };

  const submitTracking = async (trackingCode: string, courierName?: string) => {
    if (!trackingOrder) return;

    try {
      await updateOrderTracking(trackingOrder.id, trackingCode, courierName);
      toast.success("Tracking agregado. Se envió email al cliente.");
      fetchData();
    } catch (error) {
      toast.error("Error al agregar tracking");
      throw error;
    } finally {
      setTrackingOrder(null);
    }
  };

  const handleCancel = (order: Order) => {
    setCancellingOrder(order);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancellingOrder) return;

    try {
      await updateOrderStatus(cancellingOrder.id, "CANCELLED");
      toast.success("Pedido cancelado");
      fetchData();
    } catch (error) {
      toast.error("Error al cancelar el pedido");
    } finally {
      setCancelDialogOpen(false);
      setCancellingOrder(null);
    }
  };

  const columns = getColumns({
    onView: handleView,
    onConfirm: handleConfirm,
    onAddTracking: handleAddTracking,
    onCancel: handleCancel,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">
          Gestiona los pedidos de tu tienda
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enviados</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.shipped}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">
                {formatPrice(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla con tabs de filtro */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="PENDING">Pendientes</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmados</TabsTrigger>
          <TabsTrigger value="SHIPPED">Enviados</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <DataTable
            columns={columns}
            data={orders}
            isLoading={isLoading}
            searchPlaceholder="Buscar por ID de pedido..."
            searchColumnId="id"
          />
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <OrderDetailDialog
        order={viewingOrder}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <TrackingDialog
        order={trackingOrder}
        open={trackingDialogOpen}
        onOpenChange={setTrackingDialogOpen}
        onSubmit={submitTracking}
      />

      {/* Confirmar pago */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción confirmará el pago del pedido #
              {confirmingOrder?.id.slice(0, 8).toUpperCase()} y se enviará un
              email de confirmación al cliente con el link de seguimiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar pago
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancelar pedido */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará el pedido #
              {cancellingOrder?.id.slice(0, 8).toUpperCase()}. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-destructive hover:bg-destructive/90"
            >
              Cancelar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
