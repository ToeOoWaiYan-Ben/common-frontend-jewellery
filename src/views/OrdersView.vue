<template>
  <div class="page">
    <div class="topBar">
      <h2>Orders List</h2>

      <button class="btn btnPrimary" @click="router.push({ name: 'order-create' })">
        + Create Order
      </button>
    </div>

    <div class="tableWrap" v-if="orders.length">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Qty</th>
            <th>Product Codes</th>
            <th>Order Date</th>
            <th class="right">Total (MMK)</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td>
              <span class="pill">#{{ o.id }}</span>
            </td>

            <td>
              <div class="custName">{{ o.customerName || '-' }}</div>
              <div class="custPhone">{{ o.customerPhone || '' }}</div>
            </td>

            <td>{{ totalQty(o) }}</td>

            <td class="muted">{{ productCodes(o).join(', ') || '-' }}</td>

            <td>{{ formatDate(o.createdAt) }}</td>

            <td class="right">
              <b>{{ Number(o.totalPrice ?? 0).toLocaleString() }}</b>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="muted">No orders found.</div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'
  import { useOrdersStore } from '../stores/useOrdersStore'
  import { useProductsStore } from '../stores/useProductsStore'

  const router = useRouter()

  const ordersStore = useOrdersStore()
  const productsStore = useProductsStore()

  const { items: orders } = storeToRefs(ordersStore)
  const { items: products } = storeToRefs(productsStore)

  onMounted(async () => {
    if (!products.value.length) await productsStore.loadProducts()
    await ordersStore.loadOrders()
  })

  function totalQty(o: any) {
    const items = o?.items ?? []
    return items.reduce((sum: number, it: any) => sum + Math.max(0, Number(it.qty ?? 0)), 0)
  }

  function productCodes(order: any): string[] {
    const items = order?.items ?? []
    const codes: string[] = []

    for (const it of items) {
      if (it.type !== 'PRODUCT') continue
      const p: any = products.value.find((x: any) => Number(x.id) === Number(it.productId))
      if (p?.code) codes.push(p.code)
    }

    return Array.from(new Set(codes))
  }

  function formatDate(v: any) {
    if (!v) return '-'
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return String(v)
    return d.toLocaleString()
  }
</script>

<style scoped>
  .page {
    padding: 18px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .topBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .tableWrap {
    border: 1px solid #eee;
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table thead th {
    text-align: left;
    background: #fafafa;
    font-weight: 900;
    font-size: 13px;
    padding: 12px 14px;
    border-bottom: 1px solid #eee;
  }

  .table tbody td {
    padding: 12px 14px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
  }

  .table tbody tr:hover {
    background: #f8fafc;
  }

  .muted {
    opacity: 0.7;
  }

  .pill {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 12px;
    background: #f6f7f9;
    border: 1px solid #eee;
  }

  .btn {
    border-radius: 10px;
    padding: 9px 12px;
    border: 1px solid #e6e6e6;
    background: #fff;
    cursor: pointer;
    font-weight: 800;
  }

  .btnPrimary {
    background: #111;
    color: #fff;
    border-color: #111;
  }
  .custName {
    font-weight: 900;
  }
  .custPhone {
    font-size: 12px;
    opacity: 0.7;
    margin-top: 2px;
  }
</style>
