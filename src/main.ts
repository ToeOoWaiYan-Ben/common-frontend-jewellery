// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/styles/common.css'
import '@/styles/user/catalog.css'

const app = createApp(App)

// 1) create pinia
const pinia = createPinia()

// 2) register pinia before mount
app.use(pinia)

// 3) register router (if any)
app.use(router)

// 4) mount
app.mount('#app')
