import { defineStore } from 'pinia'
import { savePurchase } from '@/services/purchaseApi'

export const usePurchaseStore = defineStore('purchase', {
  state: () => ({
    items: [] as any[],
    customerId: null as number | null,
    discount: 0,
    status: 'DRAFT'
  }),

  getters: {
    subTotal: (state) =>
      state.items.reduce(
        (sum, item) => sum + item.qty * item.sellingPrice,
        0
      ),

    finalPrice(): number {
      return this.subTotal - this.discount
    }
  },

  actions: {
    addProduct(product: any) {
      const exist = this.items.find(p => p.productId === product.id)

      if (exist) {
        exist.qty++
      } else {
        this.items.push({
          productId: product.id,
          name: product.name,
          sellingPrice: product.price,
          qty: 1
        })
      }
    },

    removeItem(index: number) {
      this.items.splice(index, 1)
    },

    clearAll() {
      this.items = []
      this.discount = 0
    },

    async confirmAndSave() {
      if (!this.customerId) {
        alert('Customer required')
        return
      }

      await savePurchase({
        customerId: this.customerId,
        status: this.status,
        discountAmount: this.discount,
        items: this.items.map(i => ({
          productId: i.productId,
          qty: i.qty,
          sellingPrice: i.sellingPrice
        }))
      })

      this.clearAll()
      alert('Purchase saved successfully')
    }
  }
})