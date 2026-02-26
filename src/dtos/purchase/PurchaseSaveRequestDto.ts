export type InvoiceStatus = "DRAFT" | "CONFIRMED";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "QR";

export interface PurchaseSaveItemDto {
  productId: number;
  qty: number;
  sellingPrice: number;
}

export interface PurchaseSaveRequestDto {
  customerId: number;
  status: InvoiceStatus;
  discountAmount: number;
  paymentMethod: PaymentMethod;
  items: PurchaseSaveItemDto[];
}