<template>
  <section class="gp-page">
    <!-- Header -->
    <div class="gp-header">
      <div>
        <h2 class="gp-title">Gems Packages</h2>
        <p class="gp-subtitle">See list first. Click “Add package” to open the form.</p>
      </div>

      <div class="gp-header-actions">
        <button class="gp-btn gp-btn--primary" @click="openCreate" :disabled="store.loading">
          + Add package
        </button>
      </div>
    </div>

    <!-- TABLE LIST -->
    <div class="gp-card gp-card--table">
      <div class="gp-card-head">
        <div>
          <h3 class="gp-card-title">Package list</h3>
          <p class="gp-card-caption">{{ store.items.length }} items</p>
        </div>

        <div class="gp-search">
          <input
            v-model.trim="q"
            class="gp-input gp-input--search"
            placeholder="Search name / gem type..."
          />
        </div>
      </div>

      <div v-if="store.error" class="gp-alert gp-alert--error">
        <span class="gp-alert-icon">⚠</span>
        <span>{{ store.error }}</span>
      </div>

      <AdminTable
        title=""
        :columns="columns"
        :rows="filteredRows"
        :pageSize="8"
        :editingId="editId"
      >
        <template #cell-originalPrice="{ value }">
          {{ formatMoney(value as number | null | undefined) }}
        </template>

        <template #cell-actions="{ row }">
          <div class="gp-row-actions">
            <button class="gp-mini" @click="openEdit(row)">Edit</button>
            <button class="gp-mini gp-mini--danger" @click="onDelete(row)">Delete</button>
          </div>
        </template>
      </AdminTable>
    </div>

    <!-- FORM -->
    <div v-if="showForm" class="gp-grid gp-grid--below">
      <div class="gp-card">
        <div class="gp-card-head">
          <div>
            <h3 class="gp-card-title">{{ isEdit ? 'Edit package' : 'Add package' }}</h3>
            <p class="gp-card-caption">
              {{ isEdit ? `Editing #${editId}` : 'Create a new package' }}
            </p>
          </div>

          <button class="gp-btn" @click="closeForm" :disabled="store.loading">✕ Close</button>
        </div>

        <div class="gp-form">
          <div class="gp-field">
            <label class="gp-label">Name *</label>
            <input v-model.trim="form.name" class="gp-input" placeholder="e.g. Diamond Set A" />
          </div>

          <div class="gp-field">
            <label class="gp-label">Package No.</label>
            <input
              :value="form.packageNumber ?? ''"
              class="gp-input"
              type="number"
              placeholder="e.g. 1001"
              @input="form.packageNumber = toIntOrNull(($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="gp-field">
            <label class="gp-label">Gems Size</label>
            <input
              :value="form.gemsSize ?? ''"
              class="gp-input"
              type="number"
              step="0.01"
              placeholder="e.g. 1.25"
              @input="form.gemsSize = toNumOrNull(($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="gp-field">
            <label class="gp-label">Gems Weight</label>
            <input
              :value="form.gemsWeight ?? ''"
              class="gp-input"
              type="number"
              step="0.01"
              placeholder="e.g. 3.50"
              @input="form.gemsWeight = toNumOrNull(($event.target as HTMLInputElement).value)"
            />
          </div>

          <!-- Gem Type dropdown -->
          <div class="gp-field">
            <label class="gp-label">Gem Type</label>

            <select v-model="form.gemTypeId" class="gp-input">
              <option :value="null">Select gem type</option>
              <option v-for="t in gemTypesStore.items" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>

            <small
              v-if="gemTypesStore.items.length === 0"
              class="gp-muted"
              style="display: block; margin-top: 6px"
            >
              No gem types found. Please register gem types first.
            </small>
          </div>

          <div class="gp-field">
            <label class="gp-label">Buy Date</label>
            <input v-model="form.buyDate" class="gp-input" type="date" />
          </div>

          <div class="gp-field">
            <label class="gp-label">Color</label>
            <input v-model.trim="form.color" class="gp-input" placeholder="e.g. D" />
          </div>

          <!-- Cutting (keep as normal input if you want, or change to select later) -->
          <div class="gp-field">
            <label class="gp-label">Cutting</label>
            <input v-model.trim="form.cutting" class="gp-input" placeholder="e.g. Round" />
          </div>

          <div class="gp-field">
            <label class="gp-label">Original Price</label>
            <input
              :value="form.originalPrice ?? ''"
              class="gp-input"
              type="number"
              step="0.01"
              placeholder="e.g. 1500"
              @input="form.originalPrice = toNumOrNull(($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="gp-field">
            <label class="gp-label">Certificate ID</label>
            <input
              :value="form.certificateId ?? ''"
              class="gp-input"
              type="number"
              placeholder="e.g. 10"
              @input="form.certificateId = toIntOrNull(($event.target as HTMLInputElement).value)"
            />
          </div>

          <!-- ✅ SELLER SEARCHABLE COMBO BOX (Your request) -->
          <div class="gp-field">
            <label class="gp-label">Seller</label>

            <input
              v-model.trim="sellerQuery"
              class="gp-input"
              placeholder="Search seller: type id or name..."
              @focus="showSellerDropdown = true"
              @blur="setTimeout(() => (showSellerDropdown = false), 150)"
            />

            <div v-if="showSellerDropdown" class="gp-dropdown">
              <button
                v-for="s in filteredSellers"
                :key="s.id"
                type="button"
                class="gp-dropdown-item"
                @click="selectSeller(s.id, s.name)"
              >
                {{ s.id }} - {{ s.name }}
              </button>

              <div v-if="filteredSellers.length === 0" class="gp-dropdown-empty">No matches</div>
            </div>

            <small class="gp-muted" style="display: block; margin-top: 6px">
              Selected:
              <b>{{ form.sellerId ? `${form.sellerId} - ${form.sellerName ?? ''}` : '-' }}</b>
            </small>
          </div>

          <div class="gp-field gp-field--full">
            <label class="gp-label">Description</label>
            <textarea
              v-model.trim="form.description"
              class="gp-textarea"
              rows="3"
              placeholder="Short note..."
            />
          </div>
        </div>

        <div class="gp-actions">
          <button class="gp-btn" type="button" @click="resetForm" :disabled="store.loading">
            Reset
          </button>

          <button
            class="gp-btn gp-btn--primary"
            type="button"
            @click="save"
            :disabled="store.loading || !form.name.trim()"
          >
            {{ store.loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create package' }}
          </button>
        </div>
      </div>

      <!-- Side summary -->
      <div class="gp-card gp-card--side">
        <div class="gp-side-top">
          <div class="gp-side-sku">
            <span class="gp-side-label">Package</span>
            <span class="gp-side-value">{{ isEdit ? `#${editId}` : 'not set' }}</span>
          </div>

          <div class="gp-status" :class="dirty ? 'gp-status--warn' : 'gp-status--ok'">
            {{ dirty ? 'Unsaved' : 'Up to date' }}
          </div>
        </div>

        <div class="gp-side-block">
          <div class="gp-side-title">Quick preview</div>

          <div class="gp-preview">
            <div class="gp-preview-row">
              <span class="gp-muted">Name</span>
              <span class="gp-strong">{{ form.name || '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Gem</span>
              <span class="gp-strong">{{ selectedGemTypeName }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Seller</span>
              <span class="gp-strong">{{
                form.sellerId ? `${form.sellerId} - ${form.sellerName ?? ''}` : '-'
              }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Size</span>
              <span class="gp-strong">{{ form.gemsSize ?? '-' }}</span>
            </div>

            <div class="gp-preview-row">
              <span class="gp-muted">Weight</span>
              <span class="gp-strong">{{ form.gemsWeight ?? '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import AdminTable, { type TableColumn } from '../components/admin/AdminTable.vue'
  import { useGemsPackagesStore } from '../stores/useGemsPackagesStore'
  import type { GemsPackageDto } from '../dtos/GemsPackageDto'
  import { useGemTypesStore } from '../stores/useGemTypesStore'
  import { useSellersStore } from '../stores/useSellersStore'

  const store = useGemsPackagesStore()
  const gemTypesStore = useGemTypesStore()
  const sellersStore = useSellersStore()

  const q = ref('')
  const showForm = ref(false)
  const editId = ref<number | null>(null)

  const blank = (): Omit<GemsPackageDto, 'id'> => ({
    name: '',
    packageNumber: null,
    gemsSize: null,
    gemsWeight: null,
    color: null,
    cutting: null,
    description: null,
    originalPrice: null,
    buyDate: null,
    gemTypeId: null,
    gemTypeName: null,
    certificateId: null,
    sellerId: null,
    sellerName: null,
  })

  const form = reactive<Omit<GemsPackageDto, 'id'>>(blank())
  const snapshot = ref(JSON.stringify(form))

  const isEdit = computed(() => editId.value != null)
  const dirty = computed(() => JSON.stringify(form) !== snapshot.value)

  const columns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '70px' },
    { key: 'name', label: 'Name', width: '220px' },
    { key: 'gemTypeName', label: 'Gem Type', width: '140px' },
    { key: 'packageNumber', label: 'Package No.' },
    { key: 'gemsSize', label: 'Gems Size' },
    { key: 'gemsWeight', label: 'Gems Weight' },
    { key: 'color', label: 'Color' },
    { key: 'cutting', label: 'Cutting' },
    { key: 'originalPrice', label: 'Price', align: 'right' },
    { key: 'buyDate', label: 'Buy Date', width: '120px' },
    { key: 'sellerName', label: 'Seller', width: '160px' },
    { key: 'actions', label: 'Actions', width: '160px', align: 'center' },
  ]

  const filteredRows = computed(() => {
    const text = q.value.toLowerCase()
    if (!text) return store.items
    return store.items.filter((x) => {
      const a = (x.name ?? '').toLowerCase()
      const b = (x.gemTypeName ?? '').toLowerCase()
      const c = (x.sellerName ?? '').toLowerCase()
      return a.includes(text) || b.includes(text) || c.includes(text)
    })
  })

  // ✅ show selected gem type name in preview
  const selectedGemTypeName = computed(() => {
    if (!form.gemTypeId) return '-'
    return gemTypesStore.items.find((x) => x.id === form.gemTypeId)?.name ?? '-'
  })

  /* ✅ SELLER SEARCHABLE COMBO (your code) */
  const sellerQuery = ref('')
  const showSellerDropdown = ref(false)

  const filteredSellers = computed(() => {
    const q = sellerQuery.value.trim().toLowerCase()
    if (!q) return sellersStore.items
    return sellersStore.items.filter((s) => `${s.id} ${s.name}`.toLowerCase().includes(q))
  })

  function selectSeller(id: number, name: string) {
    form.sellerId = id
    form.sellerName = name // optional; backend will also set correct name
    sellerQuery.value = `${id} - ${name}`
    showSellerDropdown.value = false
  }

  onMounted(async () => {
    await store.loadAll()
    await gemTypesStore.loadAll()
    await sellersStore.loadAll()
  })

  // currency formatting
  function formatMoney(v?: number | null) {
    if (v == null || Number.isNaN(v)) return '-'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
  }

  // numeric helpers
  function toNumOrNull(v: string): number | null {
    const t = v.trim()
    if (!t) return null
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  }
  function toIntOrNull(v: string): number | null {
    const t = v.trim()
    if (!t) return null
    const n = Number.parseInt(t, 10)
    return Number.isFinite(n) ? n : null
  }

  function openCreate() {
    showForm.value = true
    editId.value = null
    Object.assign(form, blank())
    sellerQuery.value = '' // ✅ clear seller search
    snapshot.value = JSON.stringify(form)
  }

  function openEdit(row: GemsPackageDto) {
    showForm.value = true
    editId.value = row.id

    Object.assign(form, {
      ...row,
      gemTypeId: row.gemTypeId ?? null,
    })
    ;(form as any).id = undefined

    // ✅ show seller in search box
    sellerQuery.value = row.sellerId ? `${row.sellerId} - ${row.sellerName ?? ''}` : ''

    snapshot.value = JSON.stringify(form)
  }

  function closeForm() {
    showForm.value = false
    editId.value = null
  }

  function resetForm() {
    if (isEdit.value) {
      const row = store.items.find((x) => x.id === editId.value)
      if (row) {
        Object.assign(form, { ...row, gemTypeId: row.gemTypeId ?? null })
        ;(form as any).id = undefined
        sellerQuery.value = row.sellerId ? `${row.sellerId} - ${row.sellerName ?? ''}` : ''
        snapshot.value = JSON.stringify(form)
      }
      return
    }

    Object.assign(form, blank())
    sellerQuery.value = ''
    snapshot.value = JSON.stringify(form)
  }

  async function save() {
    if (!form.name.trim()) return

    if (isEdit.value) {
      await store.update(editId.value!, { ...form })
    } else {
      await store.create({ ...form })
    }

    await store.loadAll()
    closeForm()
  }

  async function onDelete(row: GemsPackageDto) {
    if (!confirm(`Delete "${row.name}"?`)) return
    await store.remove(row.id)
    await store.loadAll()
  }
</script>

<style scoped src="@/styles/admin/gems-package-page.css"></style>
