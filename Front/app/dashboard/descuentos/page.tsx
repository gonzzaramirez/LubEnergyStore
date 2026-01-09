"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Ticket, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  getDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
} from "@/lib/api/discount-code";
import { DiscountCode, CreateDiscountCodeDto } from "@/lib/types";
import { formatPrice } from "@/lib/products";

export default function DescuentosPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateDiscountCodeDto>({
    code: "",
    description: "",
    discountPercent: 10,
    isActive: true,
    validFrom: "",
    validUntil: "",
    usageLimit: undefined,
    minOrderAmount: undefined,
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      setIsLoading(true);
      const data = await getDiscountCodes();
      setCodes(data);
    } catch (error) {
      toast.error("Error al cargar códigos de descuento");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountPercent: 10,
      isActive: true,
      validFrom: "",
      validUntil: "",
      usageLimit: undefined,
      minOrderAmount: undefined,
    });
    setSelectedCode(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const openEditDialog = (code: DiscountCode) => {
    setSelectedCode(code);
    setFormData({
      code: code.code,
      description: code.description || "",
      discountPercent: code.discountPercent,
      isActive: code.isActive,
      validFrom: code.validFrom ? code.validFrom.split("T")[0] : "",
      validUntil: code.validUntil ? code.validUntil.split("T")[0] : "",
      usageLimit: code.usageLimit || undefined,
      minOrderAmount: code.minOrderAmount || undefined,
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.discountPercent) {
      toast.error("Completa los campos requeridos");
      return;
    }

    try {
      setIsSaving(true);
      const dataToSend = {
        ...formData,
        code: formData.code.toUpperCase(),
        validFrom: formData.validFrom || undefined,
        validUntil: formData.validUntil || undefined,
      };

      if (selectedCode) {
        await updateDiscountCode(selectedCode.id, dataToSend);
        toast.success("Código actualizado");
      } else {
        await createDiscountCode(dataToSend);
        toast.success("Código creado");
      }

      setShowDialog(false);
      resetForm();
      loadCodes();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCode) return;

    try {
      setIsSaving(true);
      await deleteDiscountCode(selectedCode.id);
      toast.success("Código eliminado");
      setShowDeleteDialog(false);
      setSelectedCode(null);
      loadCodes();
    } catch (error) {
      toast.error("Error al eliminar");
    } finally {
      setIsSaving(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado");
  };

  const isCodeExpired = (code: DiscountCode) => {
    if (!code.validUntil) return false;
    return new Date(code.validUntil) < new Date();
  };

  const isCodeActive = (code: DiscountCode) => {
    if (!code.isActive) return false;
    if (isCodeExpired(code)) return false;
    if (code.usageLimit && code.usageCount >= code.usageLimit) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Códigos de Descuento</h1>
          <p className="text-muted-foreground">
            Crea y gestiona códigos promocionales para tus clientes
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Código
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Códigos Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay códigos de descuento creados
              </p>
              <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                Crear primer código
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Validez</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold">{code.code}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(code.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {code.description && (
                        <p className="text-xs text-muted-foreground">
                          {code.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{code.discountPercent}% OFF</Badge>
                    </TableCell>
                    <TableCell>
                      {code.validFrom || code.validUntil ? (
                        <div className="text-xs">
                          {code.validFrom && (
                            <div>
                              Desde: {new Date(code.validFrom).toLocaleDateString()}
                            </div>
                          )}
                          {code.validUntil && (
                            <div>
                              Hasta: {new Date(code.validUntil).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sin límite
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {code.usageLimit ? (
                        <span>
                          {code.usageCount}/{code.usageLimit}
                        </span>
                      ) : (
                        <span>{code.usageCount} (ilimitado)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isCodeActive(code) ? (
                        <Badge className="bg-green-500">Activo</Badge>
                      ) : isCodeExpired(code) ? (
                        <Badge variant="destructive">Expirado</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(code)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCode(code);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCode ? "Editar Código" : "Nuevo Código de Descuento"}
            </DialogTitle>
            <DialogDescription>
              {selectedCode
                ? "Modifica los datos del código"
                : "Crea un nuevo código promocional"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="VERANO20"
                  className="font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Solo letras mayúsculas y números
                </p>
              </div>
              <div className="space-y-2">
                <Label>% Descuento *</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercent: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Promo de verano para clientes nuevos"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Válido desde</Label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Válido hasta</Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Límite de usos</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usageLimit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimit: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ilimitado"
                />
              </div>
              <div className="space-y-2">
                <Label>Monto mínimo</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minOrderAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderAmount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Sin mínimo"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Código activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedCode ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar código?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el código <strong>{selectedCode?.code}</strong>. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
