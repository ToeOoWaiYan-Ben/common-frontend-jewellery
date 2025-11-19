<template>
  <section class="dashboard">
    <div class="dashboard__header">
      <h2 class="page-title">Dashboard</h2>
      <p class="dashboard__subtitle">Overview of what’s happening today</p>
    </div>

    <!-- TOP ROW: STAT CARDS -->
    <div class="dashboard__stats-row">
      <div class="stat-card stat-card--blue">
        <div class="stat-card__content">
          <span class="stat-card__label">New Orders</span>
          <span class="stat-card__value">150</span>
          <span class="stat-card__icon">🛒</span>
        </div>
        <button class="stat-card__action" type="button">More info →</button>
      </div>

      <div class="stat-card stat-card--green">
        <div class="stat-card__content">
          <span class="stat-card__label">Bounce Rate</span>
          <span class="stat-card__value">53%</span>
          <span class="stat-card__icon">📉</span>
        </div>
        <button class="stat-card__action" type="button">More info →</button>
      </div>

      <div class="stat-card stat-card--yellow">
        <div class="stat-card__content">
          <span class="stat-card__label">User Registrations</span>
          <span class="stat-card__value">44</span>
          <span class="stat-card__icon">👤</span>
        </div>
        <button class="stat-card__action" type="button">More info →</button>
      </div>

      <div class="stat-card stat-card--red">
        <div class="stat-card__content">
          <span class="stat-card__label">Unique Visitors</span>
          <span class="stat-card__value">65</span>
          <span class="stat-card__icon">📊</span>
        </div>
        <button class="stat-card__action" type="button">More info →</button>
      </div>
    </div>

    <!-- SECOND ROW: BIG PANELS -->
    <div class="dashboard__main-row">
      <div class="card dashboard__panel">
        <div class="dashboard__panel-header">
          <h3>Sales</h3>
          <div class="dashboard__panel-tabs">
            <button class="dashboard__tab dashboard__tab--active" type="button">
              Area
            </button>
            <button class="dashboard__tab" type="button">Donut</button>
          </div>
        </div>
        <div class="dashboard__panel-body dashboard__panel-body--chart">
          <!-- Placeholder for chart -->
          <div class="chart-placeholder">
            <span>Chart coming soon</span>
          </div>
        </div>
      </div>

      <div class="card dashboard__panel">
        <div class="dashboard__panel-header">
          <h3>Visitors</h3>
          <button class="dashboard__date-btn" type="button">
            📅 Today
          </button>
        </div>
        <div class="dashboard__panel-body dashboard__panel-body--map">
          <!-- Placeholder for map -->
          <div class="map-placeholder">
            <span>Map / heatmap coming soon</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* header line + subtitle */
.dashboard__header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dashboard__subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

/* STAT CARDS ROW */
.dashboard__stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.stat-card {
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 15px rgba(15, 23, 42, 0.15);
}

.stat-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-card__label {
  font-size: 0.85rem;
  opacity: 0.9;
}

.stat-card__value {
  font-size: 1.4rem;
  font-weight: 700;
}

.stat-card__icon {
  margin-top: 0.15rem;
  font-size: 1.2rem;
  opacity: 0.9;
}

.stat-card__action {
  margin-top: 0.5rem;
  align-self: flex-start;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  border: none;
  font-size: 0.8rem;
  background-color: rgba(15, 23, 42, 0.12);
  color: inherit;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.stat-card__action:hover {
  background-color: rgba(15, 23, 42, 0.2);
  transform: translateY(-1px);
}

/* colors similar to AdminLTE widgets */
.stat-card--blue {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.stat-card--green {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.stat-card--yellow {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-card--red {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}

/* MAIN PANELS */
.dashboard__main-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1.4fr);
  gap: 1rem;
}

.dashboard__panel {
  display: flex;
  flex-direction: column;
  min-height: 260px;
}

.dashboard__panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.dashboard__panel-header h3 {
  margin: 0;
  font-size: 1rem;
}

.dashboard__panel-tabs {
  display: inline-flex;
  border-radius: 999px;
  background-color: #e5e7eb;
  padding: 0.1rem;
}

.dashboard__tab {
  border: none;
  background: transparent;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  cursor: pointer;
}

.dashboard__tab--active {
  background-color: #2563eb;
  color: #fff;
}

.dashboard__date-btn {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 0.25rem 0.7rem;
  font-size: 0.8rem;
  background-color: #f9fafb;
  cursor: pointer;
}

/* panel bodies */
.dashboard__panel-body {
  flex: 1;
}

/* placeholders (you can replace with charts/maps later) */
.chart-placeholder,
.map-placeholder {
  height: 100%;
  border-radius: 0.5rem;
  border: 1px dashed #d1d5db;
  background: radial-gradient(circle at top, #e5edff 0, #f9fafb 40%, #f9fafb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #6b7280;
}

/* responsive */
@media (max-width: 1024px) {
  .dashboard__stats-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard__main-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard__stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
