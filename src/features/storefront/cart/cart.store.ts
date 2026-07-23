import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { computeOrderTotals } from '@/lib/pricing'
import type { Branch, Channel, OrderTotals } from '@/types'
import {
  buildCartLine,
  DEFAULT_CART_CONTEXT,
  deriveCartContextFromBranch,
  type AddCartLineInput,
  type CartLine,
  type CartOperationalContext,
} from './cart.types'

export interface CartState {
  channel: Channel
  context: CartOperationalContext
  lines: CartLine[]
  setChannel: (channel: Channel) => void
  setContext: (context: Partial<CartOperationalContext>) => void
  hydrateFromBranch: (branch: Branch) => void
  addLine: (input: AddCartLineInput) => void
  updateQty: (lineId: string, qty: number) => void
  removeLine: (lineId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      channel: 'delivery',
      context: DEFAULT_CART_CONTEXT,
      lines: [],
      setChannel: (channel) => set({ channel }),
      setContext: (context) =>
        set((state) => ({
          context: {
            ...state.context,
            ...context,
          },
        })),
      hydrateFromBranch: (branch) => set({ context: deriveCartContextFromBranch(branch) }),
      addLine: (input) =>
        set((state) => {
          const nextLine = buildCartLine(input)
          const existing = state.lines.find((line) => line.id === nextLine.id)

          if (!existing) {
            return { lines: [...state.lines, nextLine] }
          }

          return {
            lines: state.lines.map((line) =>
              line.id === nextLine.id
                ? {
                    ...line,
                    qty: line.qty + nextLine.qty,
                    lineTotal: line.unitPrice * (line.qty + nextLine.qty),
                  }
                : line,
            ),
          }
        }),
      updateQty: (lineId, qty) =>
        set((state) => {
          const normalizedQty = Math.max(0, Math.floor(qty))
          if (normalizedQty === 0) {
            return { lines: state.lines.filter((line) => line.id !== lineId) }
          }

          return {
            lines: state.lines.map((line) =>
              line.id === lineId
                ? {
                    ...line,
                    qty: normalizedQty,
                    lineTotal: line.unitPrice * normalizedQty,
                  }
                : line,
            ),
          }
        }),
      removeLine: (lineId) => set((state) => ({ lines: state.lines.filter((line) => line.id !== lineId) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: 'pizzaforge:cart:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        channel: state.channel,
        context: state.context,
        lines: state.lines,
      }),
    },
  ),
)

export function selectCartTotals(state: Pick<CartState, 'channel' | 'context' | 'lines'>): OrderTotals {
  return computeOrderTotals({
    lines: state.lines.map((line) => ({
      unitPrice: line.unitPrice,
      qty: line.qty,
    })),
    channel: state.channel,
    deliveryFee: state.context.deliveryFee,
    taxRate: state.context.taxRate,
    promotions: [],
  })
}

export function selectCartItemCount(state: Pick<CartState, 'lines'>): number {
  return state.lines.reduce((sum, line) => sum + line.qty, 0)
}

export function selectCartSubtotal(state: Pick<CartState, 'lines'>): number {
  return state.lines.reduce((sum, line) => sum + line.lineTotal, 0)
}

export function selectCheckoutPayloadContext(state: Pick<CartState, 'channel' | 'context' | 'lines'>) {
  return {
    channel: state.channel,
    context: state.context,
    lines: state.lines,
  }
}
