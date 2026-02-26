<template>
  <div class="purchase-list">
    <h1 class="title">Purchase List</h1>

    <div class="card">
      <table v-if="purchases.length" class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Invoice ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Discount</th>
            <th>Total Items</th>
            <th>Created Date</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(purchase, index) in purchases" :key="purchase.id">
            <td>{{ index + 1 }}</td>
            <td>{{ purchase.id }}</td>
            <td>{{ purchase.customer?.name || 'N/A' }}</td>
            <td>{{ purchase.status }}</td>
            <td>${{ Number(purchase.discountAmount || 0).toFixed(2) }}</td>
            <td>{{ purchase.items?.length || 0 }}</td>
            <td>{{ formatDate(purchase.createdAt) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty">
        No purchases found.
      </div>
    </div>

    <button class="btn" @click="goBack">
      ← Back to Purchase
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPurchases } from '@/services/purchaseApi'

const router = useRouter()
const purchases = ref<any[]>([])

onMounted(async () => {
  const res = await getPurchases()
  purchases.value = res.data
})

const goBack = () => {
  router.push({ name: 'purchase' })
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.purchase-list {
  padding: 30px;
  background: #f3f4f6;
  min-height: 100vh;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

  .table {
    width: 100%;
    border-collapse: collapse;
  }

.table th,
.table td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.btn {
  margin-top: 20px;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  cursor: pointer;
}

.empty {
  padding: 10px;
  color: #6b7280;
}
</style>
