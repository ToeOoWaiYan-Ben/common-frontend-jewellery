<template>
  <section class="dashboard">
    <h2>Dashboard</h2>

    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label>View By</label>
          <select v-model="filterType">
            <option value="range">Date Range</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        <div v-if="filterType === 'range'" class="filter-group">
          <label>Start Date</label>
          <input type="date" v-model="startDate" />
        </div>

        <div v-if="filterType === 'range'" class="filter-group">
          <label>End Date</label>
          <input type="date" v-model="endDate" />
        </div>

        <div v-if="filterType === 'month'" class="filter-group">
          <label>Month</label>
          <input type="month" v-model="selectedMonth" />
        </div>

        <div v-if="filterType === 'year'" class="filter-group">
          <label>Year</label>
          <input type="number" min="2000" max="2100" v-model="selectedYear" />
        </div>

        <div class="filter-group">
          <label>&nbsp;</label>
          <button @click="load">Apply</button>
        </div>
      </div>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error-box">{{ error }}</div>

    <div v-else>
      <!-- KPI -->
      <div class="kpi-grid">
        <div class="card">
          Total Sales: <b>{{ money(data.todaySales) }}</b>
        </div>
        <div class="card">
          Period Sales: <b>{{ money(data.monthSales) }}</b>
        </div>
        <div class="card">
          Purchases: <b>{{ data.purchasesToday }}</b>
        </div>
        <div class="card">
          Low Stock Items: <b>{{ data.lowStockCount }}</b>
        </div>
      </div>

      <div class="chart-grid">
        <div class="card">
          <div class="chart-header">
            <h3>{{ chartTitle }}</h3>
          </div>
          <canvas ref="salesCanvas"></canvas>
        </div>

        <div class="card">
          <h3>Top Products (Qty)</h3>
          <canvas ref="topCanvas"></canvas>
        </div>
      </div>

      <div class="card" style="margin-top: 12px">
        <h3>Low Stock (Top 10)</h3>
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
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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

    const labels1 = (data.value.salesTrend ?? []).map((x: any) => x.label)
    const values1 = (data.value.salesTrend ?? []).map((x: any) => Number(x.total ?? 0))

    if (salesCanvas.value) {
      salesChart = new Chart(salesCanvas.value, {
        type: 'line',
        data: {
          labels: labels1,
          datasets: [
            {
              label: 'Sales',
              data: values1,
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

    const labels2 = (data.value.topProducts ?? []).map((x: any) => x.productName)
    const values2 = (data.value.topProducts ?? []).map((x: any) => Number(x.qty ?? 0))

    if (topCanvas.value) {
      topChart = new Chart(topCanvas.value, {
        type: 'bar',
        data: {
          labels: labels2,
          datasets: [
            {
              label: 'Qty',
              data: values2,
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
      params.append('filterType', filterType.value)
      params.append('lowStockThreshold', '3')

      if (filterType.value === 'range') {
        params.append('startDate', startDate.value)
        params.append('endDate', endDate.value)
      } else if (filterType.value === 'month') {
        params.append('month', selectedMonth.value)
      } else if (filterType.value === 'year') {
        params.append('year', String(selectedYear.value))
      }

      data.value = await http(`/dashboard?${params.toString()}`)
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

  .card {
    background: #ffffff;
    border-radius: 14px;
    padding: 18px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }

  .filter-card {
    margin-bottom: 16px;
  }

  .filter-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    align-items: end;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 160px;
  }

  .filter-group label {
    font-size: 13px;
    color: #475569;
    font-weight: 500;
  }

  select,
  input,
  button {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #dbe2ea;
    font-size: 14px;
  }

  button {
    background: #6366f1;
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 600;
  }

  button:hover {
    background: #4f46e5;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .kpi-grid .card {
    font-size: 15px;
    color: #64748b;
  }

  .kpi-grid .card b {
    font-size: 24px;
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

  canvas {
    margin-top: 12px;
    height: 320px !important;
  }

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

  .error-box {
    color: #b91c1c;
    background: #fee2e2;
    padding: 10px;
    border-radius: 8px;
  }

  @media (max-width: 1100px) {
    .kpi-grid,
    .chart-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
