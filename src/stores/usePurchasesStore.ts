import { defineStore } from "pinia";
import { API_BASE_URL } from "@/config/env";

import type { InvoiceResponseDto } from "@/dtos/purchase/InvoiceResponseDto";
import type {
  PurchaseSaveRequestDto,
  PaymentMethod,
} from "@/dtos/purchase/PurchaseSaveRequestDto";

export type PurchaseStatus = "Draft" | "Confirmed";

export interface PurchaseItem {
  id: string;
  productId: number;

  code: string;
  name: string;

  unitPrice: number;
  qty: number;

  // optional display fields
  available?: number;
  weight?: string;
  color?: string;
  dep?: string;
}

export interface PurchaseCustomer {
  name: string;
  phone: string;
  customerId: number;
}

export interface Purchase {
  id: string; // UI uses string
  invoiceId?: number; // DB uses number

  invoiceNo: string;
  date: string;
  status: PurchaseStatus;

  paymentMethod: PaymentMethod;

  customer: PurchaseCustomer;

  discount: number;
  items: PurchaseItem[];

  createdAt: number;
  updatedAt: number;
}

/* ---------------- helpers ---------------- */

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function statusToBackend(s: PurchaseStatus): "DRAFT" | "CONFIRMED" {
  return s === "Confirmed" ? "CONFIRMED" : "DRAFT";
}

function statusFromBackend(s: any): PurchaseStatus {
  return String(s || "").toUpperCase() === "CONFIRMED" ? "Confirmed" : "Draft";
}

function getToken() {
  return localStorage.getItem("token");
}

/**
 * ✅ IMPORTANT
 * This is NOT your http.ts (so it will NOT auto-clear token or redirect to login).
 * It prevents the "login again and again" loop.
 */
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // ✅ Do NOT clear token, do NOT redirect here
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      msg = data?.message || data?.error || data?.detail || msg;
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!text) return undefined as T;
  if (!contentType.includes("application/json")) return text as unknown as T;

  return JSON.parse(text) as T;
}

function mapInvoiceToPurchase(inv: InvoiceResponseDto): Purchase {
  return {
    id: String(inv.id),
    invoiceId: inv.id,

    invoiceNo: inv.invoiceNo,
    date: inv.createdAt?.slice(0, 10) || todayISO(),

    status: statusFromBackend(inv.status),
    paymentMethod: inv.paymentMethod || "CASH",

    customer: {
      name: "-", // you can map later from customer API
      phone: "-",
      customerId: inv.customerId,
    },

    discount: Number(inv.discountAmount || 0),

    items: (inv.items || []).map((it) => ({
      id: String(it.id ?? uid()),
      productId: Number(it.productId),

      // demo display (replace when you join real product table on backend)
      code: `PRD${it.productId}`,
      name: `Product ${it.productId}`,

      unitPrice: Number(it.sellingPrice || 0),
      qty: Number(it.qty || 0),

      available: 0,
      weight: "-",
      color: "-",
      dep: "-",
    })),

    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/* ---------------- store ---------------- */

export const usePurchasesStore = defineStore("purchases", {
  state: () => ({
    purchases: [] as Purchase[],
    isLoading: false,
    errorMessage: "",
  }),

  getters: {
    getById: (state) => (id: string) => state.purchases.find((p) => p.id === id) || null,

    totals: () => (purchase: Purchase) => {
      const subtotal = (purchase.items || []).reduce(
        (sum, it) => sum + (Number(it.unitPrice) || 0) * (Number(it.qty) || 0),
        0
      );
      const discount = Number(purchase.discount) || 0;
      const finalPrice = Math.max(0, subtotal - discount);
      return { subtotal, discount, finalPrice };
    },
  },

  actions: {
    /** ✅ local helper: upsert by invoiceId (preferred) or by id */
    _upsertInList(p: Purchase) {
      const key = Number(p.invoiceId || 0);
      let idx = -1;

      if (key > 0) {
        idx = this.purchases.findIndex((x) => Number(x.invoiceId || 0) === key);
      }
      if (idx < 0) {
        idx = this.purchases.findIndex((x) => x.id === p.id);
      }

      const updated = { ...p, updatedAt: Date.now() };

      if (idx >= 0) this.purchases[idx] = updated;
      else this.purchases.unshift(updated);

      return updated;
    },

    /** ✅ DB: list invoices */
    async fetchAll() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const data = await apiFetch<InvoiceResponseDto[]>("/api/invoices", { method: "GET" });
        this.purchases = (data || []).map(mapInvoiceToPurchase);
      } catch (e: any) {
        this.errorMessage = e?.message || "Failed to load purchases";
      } finally {
        this.isLoading = false;
      }
    },

    /** ✅ DB: get one invoice */
    async fetchOne(invoiceId: number) {
      const inv = await apiFetch<InvoiceResponseDto>(`/api/invoices/${invoiceId}`, {
        method: "GET",
      });

      const mapped = mapInvoiceToPurchase(inv);

      // ✅ keep list in sync
      this._upsertInList(mapped);

      return mapped;
    },

    /** create local draft (memory only) */
    createPurchase() {
      const p: Purchase = {
        id: uid(),
        invoiceId: undefined,
        invoiceNo: "",
        date: todayISO(),
        status: "Draft",
        paymentMethod: "CASH",
        customer: { name: "", phone: "", customerId: 1 }, // TODO: choose customer properly
        discount: 0,
        items: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.purchases.unshift(p);
      return p;
    },

    /** keep UI updates locally while typing */
    upsertLocal(p: Purchase) {
      const idx = this.purchases.findIndex((x) => x.id === p.id);
      const updated = { ...p, updatedAt: Date.now() };

      if (idx >= 0) this.purchases[idx] = updated;
      else this.purchases.unshift(updated);

      return updated;
    },

    /**
     * ✅ DB: create OR update invoice + items
     * FIX: if invoiceId exists => PUT /api/invoices/{id}
     *      else => POST /api/invoices
     */
    async saveToDb(p: Purchase) {
      if (!p.customer?.customerId) throw new Error("customerId is required");
      if (!p.items?.length) throw new Error("Please add at least 1 item");

      const payload: PurchaseSaveRequestDto = {
        customerId: p.customer.customerId,
        status: statusToBackend(p.status),
        discountAmount: Number(p.discount || 0),
        paymentMethod: p.paymentMethod,
        items: p.items.map((it) => ({
          productId: it.productId,
          qty: Number(it.qty || 0),
          sellingPrice: Number(it.unitPrice || 0),
        })),
      };

      const invoiceId = Number(p.invoiceId || 0);

      // ✅ UPDATE when editing existing invoice
      const inv = invoiceId > 0
        ? await apiFetch<InvoiceResponseDto>(`/api/invoices/${invoiceId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiFetch<InvoiceResponseDto>("/api/invoices", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      const saved = mapInvoiceToPurchase(inv);

      // ✅ IMPORTANT: if draft id != saved id, remove draft and insert saved
      this.purchases = this.purchases.filter((x) => x.id !== p.id);

      // ✅ Upsert saved invoice (by invoiceId)
      this._upsertInList(saved);

      return saved;
    },

    /** ✅ DB: delete invoice */
    async deletePurchase(id: string) {
      const invoiceId = Number(id);

      if (!Number.isNaN(invoiceId) && invoiceId > 0) {
        await apiFetch<void>(`/api/invoices/${invoiceId}`, { method: "DELETE" });
      }

      this.purchases = this.purchases.filter((x) => x.id !== id);
    },
  },
});