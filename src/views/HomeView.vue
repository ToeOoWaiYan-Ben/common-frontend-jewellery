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
            <button class="dashboard__tab dashboard__tab--active" type="button">Area</button>
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
          <button class="dashboard__date-btn" type="button">📅 Today</button>
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

<script setup lang="ts">
  import '/public/styles/admin/home.css'
</script>
