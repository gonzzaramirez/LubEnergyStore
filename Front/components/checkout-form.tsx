"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/products";
import { generateWhatsAppMessage, createWhatsAppUrl } from "@/lib/whatsapp";
import { createOrder } from "@/lib/api/order";
import { getProvincias, getLocalidades } from "@/lib/api/georef";
import type { Provincia, Localidad } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, CheckCircle2 } from "lucide-react";

interface AppliedDiscount {
  code: string;
  discountPercent: number;
}

interface CheckoutFormProps {
  onBack: () => void;
  appliedDiscount?: AppliedDiscount | null;
}

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_WA_NUMBER || "543795056878";

export function CheckoutForm({ onBack, appliedDiscount }: CheckoutFormProps) {
  const { items, totalPrice, clearCart, setIsOpen } = useCart();

  // Calcular total con descuento
  const discountAmount = appliedDiscount
    ? Math.round(totalPrice * (appliedDiscount.discountPercent / 100))
    : 0;
  const finalTotal = totalPrice - discountAmount;

  // Estados del formulario
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [province, setProvince] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [city, setCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [notes, setNotes] = useState("");

  // Estados de carga
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Estados para GeoRef
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [loadingProvincias, setLoadingProvincias] = useState(true);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  // Cargar provincias al montar
  useEffect(() => {
    getProvincias()
      .then(setProvincias)
      .finally(() => setLoadingProvincias(false));
  }, []);

  // Cargar localidades cuando cambia la provincia
  useEffect(() => {
    if (province) {
      setLoadingLocalidades(true);
      setCity("");
      setCitySearch("");
      getLocalidades(province)
        .then(setLocalidades)
        .finally(() => setLoadingLocalidades(false));
    } else {
      setLocalidades([]);
    }
  }, [province]);

  // Filtrar localidades por búsqueda
  const filteredLocalidades = localidades.filter((loc) =>
    loc.nombre.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleProvinceChange = (value: string) => {
    const selected = provincias.find((p) => p.id === value);
    setProvince(value);
    setProvinceName(selected?.nombre || "");
  };

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    phone.trim() &&
    dni.trim() &&
    street.trim() &&
    province &&
    city;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Mostrar modal de verificación en lugar de crear el pedido directamente
    setShowVerificationModal(true);
  };

  const confirmAndSubmit = async () => {
    setShowVerificationModal(false);
    setIsSubmitting(true);

    try {
      // 1. Crear el pedido en la base de datos
      const orderResponse = await createOrder({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dni: dni.trim(),
        street: street.trim(),
        apartment: apartment.trim() || undefined,
        city: city.trim(),
        province: provinceName,
        customerNotes: appliedDiscount
          ? `${notes.trim() ? notes.trim() + " | " : ""}Código descuento: ${
              appliedDiscount.code
            } (-${appliedDiscount.discountPercent}%)`
          : notes.trim() || undefined,
        items: items.map((item) => ({
          productId: item.id,
          flavorId: item.flavorId,
          productName: item.name,
          flavorName: item.flavorName,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        totalAmount: finalTotal, // Usar total con descuento aplicado
      });

      setOrderId(orderResponse.id);

      // 2. Generar mensaje de WhatsApp con ID del pedido
      const fullAddress = apartment
        ? `${street}, ${apartment}, ${city}, ${provinceName}`
        : `${street}, ${city}, ${provinceName}`;

      const message = generateWhatsAppMessage(items, finalTotal, {
        name: `${firstName} ${lastName}`,
        address: fullAddress,
        notes: notes.trim() || undefined,
        email: email.trim(),
        phone: phone.trim(),
        dni: dni.trim(),
        orderId: orderResponse.id.slice(0, 8).toUpperCase(),
        discountCode: appliedDiscount?.code,
        discountPercent: appliedDiscount?.discountPercent,
      });

      const whatsappUrl = createWhatsAppUrl(WHATSAPP_NUMBER, message);

      // 3. Abrir WhatsApp (misma pestaña: evita bloqueo de popups en móvil tras await)
      window.location.assign(whatsappUrl);

      // 4. Mostrar éxito y limpiar
      setOrderSuccess(true);

      setTimeout(() => {
        clearCart();
        setIsOpen(false);
      }, 3000);
    } catch (error) {
      // Aún así abrir WhatsApp aunque falle el guardado
      const fullAddress = apartment
        ? `${street}, ${apartment}, ${city}, ${provinceName}`
        : `${street}, ${city}, ${provinceName}`;

      const message = generateWhatsAppMessage(items, finalTotal, {
        name: `${firstName} ${lastName}`,
        address: fullAddress,
        notes: notes.trim() || undefined,
        discountCode: appliedDiscount?.code,
        discountPercent: appliedDiscount?.discountPercent,
      });

      window.location.assign(createWhatsAppUrl(WHATSAPP_NUMBER, message));
      clearCart();
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pantalla de éxito
  if (orderSuccess) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          ¡Pedido enviado!
        </h2>
        <p className="mb-4 text-muted-foreground">
          Tu pedido #{orderId?.slice(0, 8).toUpperCase()} fue registrado.
        </p>
        <p className="text-sm text-muted-foreground">
          Recibirás un email de confirmación cuando procesemos tu pago.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Back Button */}
      <div className="border-b border-border p-4 bg-background">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al carrito
        </button>
      </div>

      {/* Scrollable Content - standard div for reliability */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {/* Order Summary */}
          <div className="border-b border-border bg-secondary/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Resumen del pedido ({items.length}{" "}
              {items.length === 1 ? "producto" : "productos"})
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap ml-2">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 pb-10 space-y-8">
            {/* Datos personales */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  1
                </span>
                <h4 className="text-sm font-semibold text-foreground">
                  Datos personales
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                    required
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Pérez"
                    required
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@ejemplo.com"
                  required
                  className="bg-secondary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="..."
                    required
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI *</Label>
                  <Input
                    id="dni"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="12345678"
                    required
                    className="bg-secondary/50"
                  />
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  2
                </span>
                <h4 className="text-sm font-semibold text-foreground">
                  Dirección de envío
                </h4>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Calle y número *</Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Av. Corrientes 1234"
                  required
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment">
                  Piso / Departamento (opcional)
                </Label>
                <Input
                  id="apartment"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Piso 3, Depto B"
                  className="bg-secondary/50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="province">Provincia *</Label>
                  <Select
                    value={province}
                    onValueChange={handleProvinceChange}
                    disabled={loadingProvincias}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue
                        placeholder={loadingProvincias ? "..." : "Elegir"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {provincias.map((prov) => (
                        <SelectItem key={prov.id} value={prov.id}>
                          {prov.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Localidad *</Label>
                  <Select
                    value={city}
                    onValueChange={setCity}
                    disabled={loadingLocalidades || !province}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue
                        placeholder={
                          loadingLocalidades ? "..." : province ? "Elegir" : "-"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      <div className="px-2 py-2">
                        <Input
                          placeholder="Filtrar..."
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          className="h-8 text-[10px]"
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                      {filteredLocalidades.slice(0, 50).map((loc) => (
                        <SelectItem key={loc.id} value={loc.nombre}>
                          {loc.nombre}
                        </SelectItem>
                      ))}
                      {filteredLocalidades.length === 0 &&
                        !loadingLocalidades &&
                        province && (
                          <div className="px-2 py-4 text-center text-[10px] text-muted-foreground">
                            Sin resultados
                          </div>
                        )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Horarios, indicaciones, etc."
                rows={3}
                className="bg-secondary/50 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={!isFormValid || isSubmitting}
                className="w-full gap-2 bg-green-600 text-base font-semibold hover:bg-green-700 shadow-xl shadow-green-900/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5" />
                    Confirmar pedido
                  </>
                )}
              </Button>
              <p className="mt-4 text-center text-[10px] text-muted-foreground">
                Te redirigiremos a WhatsApp para finalizar
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de verificación */}
      <Dialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
      >
        <DialogContent className="w-[92vw] sm:max-w-md p-6 sm:p-8 rounded-[2rem] sm:rounded-3xl border-none">
          <div className="flex flex-col items-center text-center space-y-5 sm:space-y-6">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                ¿Tus datos son correctos?
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed px-1 sm:px-2">
                Es fundamental que el <strong>correo electrónico</strong>{" "}
                ingresado sea el correcto.
              </DialogDescription>
            </div>

            <div className="bg-secondary/40 p-4 sm:p-5 rounded-2xl w-full text-left space-y-3 border border-border/50">
              <p className="text-xs sm:text-sm text-foreground/80 font-medium">
                Una vez confirmado tu pago, recibirás un mail con:
              </p>
              <ul className="space-y-2 sm:space-y-2.5">
                {[
                  "Los detalles completos de tu compra.",
                  "Link exclusivo para ver el estado de tu pedido.",
                  "El código de seguimiento de tu pedido.",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full flex flex-col gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Button
                onClick={confirmAndSubmit}
                disabled={isSubmitting}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 sm:h-14 text-sm sm:text-base rounded-xl shadow-lg shadow-green-900/10 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Confirmar y finalizar"
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowVerificationModal(false)}
                disabled={isSubmitting}
                className="w-full text-muted-foreground text-xs sm:text-sm h-10 sm:h-12"
              >
                Revisar mis datos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
