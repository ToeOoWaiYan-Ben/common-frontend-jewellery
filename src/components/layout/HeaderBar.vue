<template>
  <header class="app-header">
    <div class="app-header__left">
      <button class="app-header__toggle" type="button" aria-label="Toggle sidebar">☰</button>

      <a href="#" class="app-header__brand">My Admin</a>
    </div>

    <nav class="app-header__nav">
      <a href="#" class="app-header__nav-link">Home</a>
      <a href="#" class="app-header__nav-link">Contact</a>
    </nav>

    <div class="app-header__right">
      <button class="app-header__icon-btn" type="button" aria-label="Search">🔍</button>
      <button class="app-header__icon-btn" type="button" aria-label="Notifications">🔔</button>
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
