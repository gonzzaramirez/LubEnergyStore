"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order, OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Truck, Check, X, Package } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ColumnsProps {
  onView: (order: Order) => void;
  onConfirm: (order: Order) => void;
  onAddTracking: (order: Order) => void;
  onMarkDelivered: (order: Order) => void;
  onCancel: (order: Order) => void;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "Pendiente", variant: "outline" },
  CONFIRMED: { label: "Confirmado", variant: "default" },
  SHIPPED: { label: "Enviado", variant: "secondary" },
  DELIVERED: { label: "Entregado", variant: "default" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getColumns({
  onView,
  onConfirm,
  onAddTracking,
  onMarkDelivered,
  onCancel,
}: ColumnsProps): ColumnDef<Order>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "Pedido",
      cell: ({ row }) => {
        const id = row.getValue("id") as string;
        return (
          <span className="font-mono text-sm font-medium">
            #{id.slice(0, 8).toUpperCase()}
          </span>
        );
      },
    },
    {
      id: "customer",
      header: "Cliente",
      cell: ({ row }) => {
        const order = row.original;
        const customer = order.guestCustomer;
        if (!customer) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {customer.firstName} {customer.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {customer.email}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => {
        const amount = row.getValue("totalAmount") as number;
        return <span className="font-semibold">{formatPrice(amount)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as OrderStatus;
        const config = statusConfig[status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return <span className="text-sm">{formatDate(date)}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        const status = order.status;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {status === "PENDING" && (
                <>
                  <DropdownMenuItem onClick={() => onConfirm(order)}>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Confirmar pago
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onCancel(order)}
                    className="text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar pedido
                  </DropdownMenuItem>
                </>
              )}

              {status === "CONFIRMED" && (
                <DropdownMenuItem onClick={() => onAddTracking(order)}>
                  <Truck className="mr-2 h-4 w-4 text-blue-600" />
                  Agregar tracking
                </DropdownMenuItem>
              )}

              {status === "SHIPPED" && (
                <DropdownMenuItem onClick={() => onMarkDelivered(order)}>
                  <Package className="mr-2 h-4 w-4 text-green-600" />
                  Marcar entregado
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
