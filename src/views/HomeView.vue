<template>
  <section class="dashboard">
    <h2>Dashboard</h2>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" style="color:red">{{ error }}</div>

    <div v-else>
      <!-- KPI -->
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
        <div class="card">Today Sales: <b>{{ money(data.todaySales) }}</b></div>
        <div class="card">Month Sales: <b>{{ money(data.monthSales) }}</b></div>
        <div class="card">Purchases Today: <b>{{ data.purchasesToday }}</b></div>
        <div class="card">Low Stock Items: <b>{{ data.lowStockCount }}</b></div>
      </div>

      <div style="display:grid; grid-template-columns: 1.3fr 1fr; gap:12px; margin-top:12px;">
        <!-- Line -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0;">Sales Trend (Last {{ days }} days)</h3>
            <select v-model.number="days" @change="load()">
              <option :value="7">7 days</option>
              <option :value="30">30 days</option>
            </select>
          </div>
          <canvas ref="salesCanvas"></canvas>
        </div>

        <!-- Bar -->
        <div class="card">
          <h3 style="margin:0 0 8px;">Top Products (Qty)</h3>
          <canvas ref="topCanvas"></canvas>
        </div>
      </div>

      <!-- Low stock list -->
      <div class="card" style="margin-top:12px;">
        <h3 style="margin:0 0 8px;">Low Stock (Top 10)</h3>
        <table width="100%" cellspacing="0" cellpadding="6">
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Code</th>
              <th align="right">Qty</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in data.lowStock" :key="p.id">
              <td>{{ p.name }}</td>
              <td>{{ p.code }}</td>
              <td align="right">{{ p.qty }}</td>
            </tr>
            <tr v-if="!data.lowStock?.length">
              <td colspan="3">No low stock items.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Chart } from 'chart.js/auto'
import { http } from '@/services/http'
import '/public/styles/admin/home.css'

const loading = ref(false)
const error = ref<string | null>(null)
const days = ref(7)

const data = ref<any>({
  todaySales: 0,
  monthSales: 0,
  purchasesToday: 0,
  lowStockCount: 0,
  salesTrend: [],
  topProducts: [],
  lowStock: [],
})

const salesCanvas = ref<HTMLCanvasElement | null>(null)
const topCanvas = ref<HTMLCanvasElement | null>(null)

let salesChart: Chart | null = null
let topChart: Chart | null = null

function destroyCharts() {
  salesChart?.destroy()
  topChart?.destroy()
  salesChart = null
  topChart = null
}

function renderCharts() {
  destroyCharts()

  // sales line
  const labels1 = (data.value.salesTrend ?? []).map((x: any) => x.day)
  const values1 = (data.value.salesTrend ?? []).map((x: any) => Number(x.total ?? 0))

  if (salesCanvas.value) {
    salesChart = new Chart(salesCanvas.value, {
      type: 'line',
      data: {
        labels: labels1,
        datasets: [{ label: 'Sales', data: values1 }],
      },
    })
  }

  // top products bar
  const labels2 = (data.value.topProducts ?? []).map((x: any) => x.productName)
  const values2 = (data.value.topProducts ?? []).map((x: any) => Number(x.qty ?? 0))

  if (topCanvas.value) {
    topChart = new Chart(topCanvas.value, {
      type: 'bar',
      data: {
        labels: labels2,
        datasets: [{ label: 'Qty', data: values2 }],
      },
    })
  }
}

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = await http(`/dashboard?days=${days.value}&lowStockThreshold=3`)
    renderCharts()
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load dashboard.'
  } finally {
    loading.value = false
  }
}

function money(v: any) {
  const n = Number(v ?? 0)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' MMK'
}

onMounted(load)
onBeforeUnmount(destroyCharts)
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard h2 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

/* Card base */
.card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.08);
}

/* KPI Cards */
.dashboard > div > div.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 14px;
  color: #64748b;
}

.dashboard > div > div.card b {
  font-size: 22px;
  color: #0f172a;
  margin-top: 6px;
}

/* Section titles */
.card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

/* Select dropdown */
select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s ease;
}

select:hover {
  border-color: #6366f1;
}

select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* Charts */
canvas {
  margin-top: 10px;
  max-height: 320px;
}

/* Table */
table {
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: #f1f5f9;
}

thead th {
  padding: 10px;
  font-weight: 600;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
}

tbody td {
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
}

tbody tr:hover {
  background: #f8fafc;
}

/* Loading & Error */
.dashboard div[style*="Loading"] {
  font-size: 14px;
  color: #64748b;
}

.dashboard div[style*="color:red"] {
  background: #fee2e2;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
}
</style>

