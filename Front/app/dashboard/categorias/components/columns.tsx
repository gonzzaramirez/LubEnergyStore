"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, RotateCcw } from "lucide-react";

interface ColumnsProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onRestore?: (category: Category) => void;
}

export const getColumns = ({
  onEdit,
  onDelete,
  onRestore,
}: ColumnsProps): ColumnDef<Category>[] => [
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
    size: 40,
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
    ),
    size: 200,
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | undefined;
      return description ? (
        <span className="line-clamp-2">{description}</span>
      ) : (
        <span className="text-muted-foreground italic">Sin descripción</span>
      );
    },
    size: 300,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRestore ? (
              <DropdownMenuItem onClick={() => onRestore(category)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restaurar
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(category)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 80,
    enableSorting: false,
    enableHiding: false,
  },
];
