<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <h1 class="title">Purchase List</h1>

      <div class="actions">
        <input
          v-model="search"
          class="input"
          placeholder="Search invoice / customer / status"
        />
        <button class="btn primary" type="button" @click="createNew">
          + New Purchase
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-head">Purchases</div>

      <div class="card-body">
        <div v-if="store.isLoading" class="note">Loading…</div>
        <div v-else-if="store.errorMessage" class="note error">
          {{ store.errorMessage }}
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Payment</th>
              <th class="right">Final</th>
              <th class="right" style="width:180px;">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td class="mono">{{ p.invoiceNo || "-" }}</td>
              <td>{{ p.date }}</td>

              <td>
                <span class="badge" :class="p.status === 'Confirmed' ? 'ok' : 'draft'">
                  {{ p.status }}
                </span>
              </td>

              <td>{{ p.customer?.name || "-" }}</td>
              <td>{{ paymentLabel(p.paymentMethod) }}</td>

              <td class="right">
                {{ money(store.totals(p).finalPrice) }}
              </td>

              <td class="right">
                <button class="btn small" type="button" @click="open(p.id)">
                  Open
                </button>
                <button class="btn small danger" type="button" @click="del(p.id)">
                  Delete
                </button>
              </td>
            </tr>

            <tr v-if="!filtered.length">
              <td colspan="7" class="empty">No purchases found.</td>
            </tr>
          </tbody>
        </table>

        <div class="note">
          Data is loaded from <b>Database</b>.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePurchasesStore } from "@/stores/usePurchasesStore";
import { useAuthStore } from "@/stores/useAuthStore";

const router = useRouter();
const store = usePurchasesStore();
const auth = useAuthStore();

const search = ref("");

/** ✅ FIX 1: If not logged in, do NOT call API (prevents http.ts redirect loop) */
onMounted(async () => {
  if (!auth.isLoggedIn) {
    const next = encodeURIComponent("/admin/purchases");
    router.push(`/login?next=${next}`);
    return;
  }

  await store.fetchAll();
});

const filtered = computed(() => {
  const s = search.value.trim().toLowerCase();
  if (!s) return store.purchases;

  return store.purchases.filter((p) => {
    const text = [
      p.invoiceNo,
      p.date,
      p.status,
      p.paymentMethod,
      p.customer?.name,
      p.customer?.phone,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(s);
  });
});

function createNew() {
  const newPurchase = store.createPurchase(); // local draft (memory only)
  router.push(`/admin/purchases/${newPurchase.id}/edit`);
}

function open(id: string) {
  router.push(`/admin/purchases/${id}/edit`);
}

async function del(id: string) {
  if (!confirm("Delete this purchase?")) return;
  await store.deletePurchase(id);
}

function money(n: number) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function paymentLabel(v: string) {
  const x = String(v || "").toUpperCase();
  if (x === "CASH") return "Cash";
  if (x === "CARD") return "Card";
  if (x === "TRANSFER") return "Transfer";
  if (x === "QR") return "QR";
  return x || "-";
}
</script>

<style scoped>
.page { display: grid; gap: 14px; }
.header { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
.title { margin: 0; font-size: 28px; }
.actions { display: flex; gap: 10px; align-items: center; }

.input {
  height: 38px;
  width: 300px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.card-head {
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 900;
}

.card-body { padding: 12px 14px; }

.table { width: 100%; border-collapse: collapse; }

.table th,
.table td {
  padding: 10px 8px;
  border-bottom: 1px solid #f1f5f9;
}

.right { text-align: right; }

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #e5e7eb;
}

.badge.draft { background: #f9fafb; }

.badge.ok {
  background: #ecfdf5;
  color: #065f46;
  border-color: #bbf7d0;
}

.btn {
  height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-weight: 800;
  cursor: pointer;
}

.btn.primary {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.btn.danger {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

.btn.small { height: 30px; }

.empty {
  text-align: center;
  padding: 16px;
  color: #6b7280;
}

.note { margin-top: 10px; color: #6b7280; }
.note.error { color: #b91c1c; }
</style>