import type { GoldPriceHistoryDto, GoldPurity } from '@/dtos/GoldPriceHistoryDto'

export function activeSellPriceMap(items: GoldPriceHistoryDto[]) {
  const map = { K24: 0, K22: 0, K18: 0, K14: 0 } as Record<GoldPurity, number>

  items
    .filter((x) => x.status === 'ACTIVE')
    .forEach((x) => {
      map[x.purity] = Number(x.sellPrice ?? 0)
    })

  return map
}
