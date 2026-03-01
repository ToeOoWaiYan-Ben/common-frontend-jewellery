import type { ProductDto, ProductGoldItemDto, ProductJewelleryItemDto } from '@/dtos/ProductDto'
import type { GoldPurity } from '@/dtos/GoldPriceHistoryDto'

export function goldRowCost(
  product: ProductDto,
  row: ProductGoldItemDto,
  sellPriceByPurity: Record<GoldPurity, number>
): number {
  const purity = row.goldPurity as GoldPurity
  const pricePerGram = Number(sellPriceByPurity[purity] ?? 0)

  const goldWeight = Number(row.weight ?? 0)
  const lossPct = Number(product.metarialLoss ?? 0)

  const effectiveWeight = goldWeight * (1 + lossPct / 100)
  return effectiveWeight * pricePerGram
}

export function totalGoldCost(
  product: ProductDto,
  sellPriceByPurity: Record<GoldPurity, number>
): number {
  return (product.productGolds ?? []).reduce((sum, row) => {
    return sum + goldRowCost(product, row, sellPriceByPurity)
  }, 0)
}

export function gemRowCost(row: ProductJewelleryItemDto): number {
  return Number(row.qty ?? 0) * Number(row.sellingPrice ?? 0)
}

export function totalGemCost(product: ProductDto): number {
  return (product.productJewellerys ?? []).reduce((sum, row) => {
    return sum + gemRowCost(row)
  }, 0)
}

export function baseCost(
  product: ProductDto,
  sellPriceByPurity: Record<GoldPurity, number>
): number {
  return (
    totalGoldCost(product, sellPriceByPurity) +
    totalGemCost(product) +
    Number(product.makingCost ?? 0)
  )
}

export function finalPrice(
  product: ProductDto,
  sellPriceByPurity: Record<GoldPurity, number>
): number {
  const base = baseCost(product, sellPriceByPurity)
  const dep = Number(product.depreciation ?? 0)
  return base * (1 - dep / 100)
}
