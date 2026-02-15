import { defineStore } from "pinia";

export type PurchaseStatus = "Draft" | "Confirmed";

export interface PurchaseItem {
  id: string;
  code: string;
  name: string;
  unitPrice: number;
  qty: number;

  // optional display fields (like screenshot)
  available?: number;
  weight?: string;
  color?: string;
  dep?: string;
}

export interface PurchaseCustomer {
  name: string;
  phone: string;
}

export interface Purchase {
  id: string;
  invoiceNo: string;
  date: string;
  status: PurchaseStatus;

  customer: PurchaseCustomer;

  discount: number;
  items: PurchaseItem[];

  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "frontend_purchases_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function safeParse<T>(v: string | null, fallback: T): T {
  try {
    if (!v) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export const usePurchasesStore = defineStore("purchases", {
  state: () => ({
    purchases: [] as Purchase[],
    loaded: false,
  }),

  getters: {
    getById: (state) => {
      return (id: string) => state.purchases.find((p) => p.id === id) || null;
    },

    totals: () => {
      return (purchase: Purchase) => {
        const subtotal = (purchase.items || []).reduce(
          (sum, it) => sum + (Number(it.unitPrice) || 0) * (Number(it.qty) || 0),
          0
        );
        const discount = Number(purchase.discount) || 0;
        const finalPrice = Math.max(0, subtotal - discount);
        return { subtotal, discount, finalPrice };
      };
    },
  },

  actions: {
    load() {
      if (this.loaded) return;
      const raw = localStorage.getItem(STORAGE_KEY);
      this.purchases = safeParse<Purchase[]>(raw, []);
      this.loaded = true;
    },

    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.purchases));
    },

    seedIfEmpty() {
      this.load();
      if (this.purchases.length) return;

      const p: Purchase = {
        id: uid(),
        invoiceNo: "#0001",
        date: todayISO(),
        status: "Draft",
        customer: { name: "", phone: "" },
        discount: 20,
        items: [
          {
            id: uid(),
            code: "PRD001",
            name: "Product Name",
            unitPrice: 100,
            qty: 1,
            available: 10,
            weight: "2.5g",
            color: "Gold",
            dep: "0.5%",
          },
          {
            id: uid(),
            code: "PRD002",
            name: "Product Name",
            unitPrice: 150,
            qty: 2,
            available: 12,
            weight: "3.0g",
            color: "Gold",
            dep: "0.5%",
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.purchases = [p];
      this.persist();
    },

    createPurchase() {
      this.load();

      const nextNo = `#${String(this.purchases.length + 1).padStart(4, "0")}`;
      const p: Purchase = {
        id: uid(),
        invoiceNo: nextNo,
        date: todayISO(),
        status: "Draft",
        customer: { name: "", phone: "" },
        discount: 0,
        items: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.purchases.push(p);
      this.persist();
      return p;
    },

    upsertPurchase(p: Purchase) {
      this.load();

      const idx = this.purchases.findIndex((x) => x.id === p.id);
      const updated: Purchase = { ...p, updatedAt: Date.now() };

      if (idx >= 0) this.purchases[idx] = updated;
      else this.purchases.push(updated);

      this.persist();
      return updated;
    },

    deletePurchase(id: string) {
      this.load();
      this.purchases = this.purchases.filter((p) => p.id !== id);
      this.persist();
    },
  },
});
