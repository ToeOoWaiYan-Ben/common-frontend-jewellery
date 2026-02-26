export interface InvoiceItemResponseDto {
  id: number;
  invoiceId: number;
  productId: number;
  qty: number;
  sellingPrice: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTotal: number;
}

export interface InvoiceResponseDto {
  id: number;
  invoiceNo: string;
  customerId: number;

  subTotal: number;
  discountAmount: number;
  finalPrice: number;

  status: "DRAFT" | "CONFIRMED" | "PAID" | "CANCELED";
  paymentMethod: "CASH" | "CARD" | "TRANSFER" | "QR";

  createdAt: string;
  updatedAt: string;

  items: InvoiceItemResponseDto[];
}