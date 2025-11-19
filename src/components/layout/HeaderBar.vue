<template>
  <header class="app-header">
    <div class="app-header__left">
      <div class="app-logo-mark">AD</div>
      <div class="app-logo-text">
        <h1 class="app-logo">AdminDashboard</h1>
        <p class="app-header__subtitle">Management dashboard</p>
      </div>
    </div>

    <!-- center part removed -->

    <div class="app-header__right">
      <button class="app-header__icon-btn" type="button" aria-label="Notifications">
        🔔
      </button>
      <div class="app-header__user">
        <div class="app-header__avatar">A</div>
        <div class="app-header__user-meta">
          <span class="app-header__user-name">Admin</span>
          <span class="app-header__user-role">Administrator</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts"></script>
