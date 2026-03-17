<template>
  <section class="dashboard">
    <h2 class="dashboard__title">Dashboard</h2>

    <!-- FILTER -->
    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label>View By</label>
          <select v-model="filterType" class="filter-input">
            <option value="range">Date Range</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        <div v-if="filterType === 'range'" class="filter-group">
          <label>Start Date</label>
          <input type="date" v-model="startDate" class="filter-input" />
        </div>

        <div v-if="filterType === 'range'" class="filter-group">
          <label>End Date</label>
          <input type="date" v-model="endDate" class="filter-input" />
        </div>

        <div v-if="filterType === 'month'" class="filter-group">
          <label>Month</label>
          <input type="month" v-model="selectedMonth" class="filter-input" />
        </div>

        <div v-if="filterType === 'year'" class="filter-group">
          <label>Year</label>
          <input
            type="number"
            min="2000"
            max="2100"
            v-model="selectedYear"
            class="filter-input"
          />
        </div>

        <div class="filter-group filter-group--button">
          <label>&nbsp;</label>
          <button type="button" class="apply-btn" @click="load">Apply</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-box">Loading...</div>
    <div v-else-if="error" class="error-box">{{ error }}</div>

    <div v-else>
      <!-- KPI -->
      <div class="kpi-grid">
        <div class="card kpi-card">
          <span class="kpi-label">Period Sales</span>
          <b class="kpi-value">{{ money(data.monthSales) }}</b>
        </div>

        <div class="card kpi-card">
          <span class="kpi-label">Purchases in Period</span>
          <b class="kpi-value">{{ data.purchasesToday }}</b>
        </div>

        <div class="card kpi-card">
          <span class="kpi-label">Low Stock Items</span>
          <b class="kpi-value">{{ data.lowStockCount }}</b>
        </div>
      </div>

      <!-- CHARTS -->
      <div class="chart-grid">
        <div class="card">
          <div class="chart-header">
            <h3>{{ chartTitle }}</h3>
          </div>
          <div class="chart-box">
            <canvas ref="salesCanvas"></canvas>
          </div>
          <p v-if="!(data.salesTrend?.length > 0)" class="empty-text">No sales trend data.</p>
        </div>

        <div class="card">
          <div class="chart-header">
            <h3>Top Products (Qty)</h3>
          </div>
          <div class="chart-box">
            <canvas ref="topCanvas"></canvas>
          </div>
          <p v-if="!(data.topProducts?.length > 0)" class="empty-text">No top product data.</p>
        </div>
      </div>

      <!-- LOW STOCK TABLE -->
      <div class="card lowstock-card">
        <h3>Low Stock (Top 10)</h3>

        <table class="stock-table">
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Chart } from 'chart.js/auto'
import { http } from '@/services/http'

const loading = ref(false)
const error = ref<string | null>(null)

const filterType = ref<'range' | 'month' | 'year'>('month')

const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = `${currentYear}-${String(today.getMonth() + 1).padStart(2, '0')}`

const startDate = ref(`${currentYear}-${String(today.getMonth() + 1).padStart(2, '0')}-01`)
const endDate = ref(today.toISOString().split('T')[0])
const selectedMonth = ref(currentMonth)
const selectedYear = ref(currentYear)

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

const chartTitle = computed(() => {
  if (filterType.value === 'range') {
    return `Sales Trend (${startDate.value} to ${endDate.value})`
  }

  if (filterType.value === 'month') {
    const [year, month] = selectedMonth.value.split('-')
    const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('en-US', {
      month: 'long',
    })
    return `Sales Trend (${monthName} ${year})`
  }

  return `Sales Trend (${selectedYear.value})`
})

function destroyCharts() {
  salesChart?.destroy()
  topChart?.destroy()
  salesChart = null
  topChart = null
}

function renderCharts() {
  destroyCharts()

  const salesLabels = (data.value.salesTrend ?? []).map((x: any) => x.day)
  const salesValues = (data.value.salesTrend ?? []).map((x: any) => Number(x.total ?? 0))

  if (salesCanvas.value && salesLabels.length > 0) {
    salesChart = new Chart(salesCanvas.value, {
      type: 'line',
      data: {
        labels: salesLabels,
        datasets: [
          {
            label: 'Sales',
            data: salesValues,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  const topLabels = (data.value.topProducts ?? []).map((x: any) => x.productName)
  const topValues = (data.value.topProducts ?? []).map((x: any) => Number(x.qty ?? 0))

  if (topCanvas.value && topLabels.length > 0) {
    topChart = new Chart(topCanvas.value, {
      type: 'bar',
      data: {
        labels: topLabels,
        datasets: [
          {
            label: 'Qty',
            data: topValues,
            backgroundColor: '#0ea5e9',
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }
}

async function load() {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams()

if (filterType.value === 'range') {
  params.append('filterType', 'range')
  params.append('startDate', startDate.value)
  params.append('endDate', endDate.value)
} 
else if (filterType.value === 'month') {
  params.append('filterType', 'month')
  params.append('month', selectedMonth.value)
} 
else {
  params.append('filterType', 'year')
  params.append('year', String(selectedYear.value))
}

params.append('lowStockThreshold', '3')
    data.value = await http(`/dashboard?${params.toString()}`)

    loading.value = false
    await nextTick()
    renderCharts()
    return
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load dashboard.'
    destroyCharts()
  } finally {
    if (loading.value) loading.value = false
  }
}

function money(v: any) {
  const n = Number(v ?? 0)
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(n) + ' MMK'
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

.dashboard__title {
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.filter-card {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.filter-group--button {
  min-width: 140px;
}

.filter-group label {
  font-size: 14px;
  color: #475569;
  font-weight: 600;
}

.filter-input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #dbe2ea;
  font-size: 15px;
  background: #fff;
  color: #0f172a;
}

.apply-btn {
  height: 46px;
  padding: 0 22px;
  border-radius: 12px;
  border: none;
  background: #6366f1;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.apply-btn:hover {
  background: #4f46e5;
}

.loading-box {
  color: #334155;
}

.error-box {
  color: #b91c1c;
  background: #fee2e2;
  padding: 12px;
  border-radius: 10px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kpi-label {
  font-size: 15px;
  color: #64748b;
  font-weight: 600;
}

.kpi-value {
  font-size: 34px;
  line-height: 1.2;
  color: #0f172a;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.chart-box {
  position: relative;
  height: 320px;
  margin-top: 12px;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

.empty-text {
  margin-top: 10px;
  color: #64748b;
  font-size: 14px;
}

.lowstock-card {
  margin-top: 12px;
}

.lowstock-card h3 {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.stock-table thead {
  background: #f1f5f9;
}

.stock-table thead th {
  padding: 10px;
  font-weight: 600;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
}

.stock-table tbody td {
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
}

@media (max-width: 1100px) {
  .kpi-grid,
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>