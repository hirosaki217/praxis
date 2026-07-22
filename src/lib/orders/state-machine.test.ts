import { describe, it, expect } from 'vitest'
import { canTransition, nextStatuses, transition, isTerminal, refundFraction } from './state-machine'

describe('canTransition', () => {
  it('delivery: transition hợp lệ', () => {
    expect(canTransition('delivery', 'created', 'confirmed')).toBe(true)
    expect(canTransition('delivery', 'preparing', 'ready')).toBe(true)
    expect(canTransition('delivery', 'out_for_delivery', 'delivered')).toBe(true)
  })

  it('delivery: bỏ bậc = bất hợp lệ', () => {
    expect(canTransition('delivery', 'created', 'preparing')).toBe(false)
    expect(canTransition('delivery', 'delivered', 'created')).toBe(false)
  })

  it('pickup: dùng trạng thái riêng (ready_for_pickup / picked_up)', () => {
    expect(canTransition('pickup', 'preparing', 'ready_for_pickup')).toBe(true)
    expect(canTransition('pickup', 'ready_for_pickup', 'picked_up')).toBe(true)
    expect(canTransition('pickup', 'preparing', 'ready')).toBe(false) // ready là của delivery
  })

  it('dine-in: served thay cho delivered', () => {
    expect(canTransition('dine-in', 'preparing', 'served')).toBe(true)
    expect(canTransition('dine-in', 'served', 'completed')).toBe(true)
  })

  it('mọi kênh có thể hủy (cancelled) khi còn sớm', () => {
    expect(canTransition('delivery', 'preparing', 'cancelled')).toBe(true)
    expect(canTransition('pickup', 'confirmed', 'cancelled')).toBe(true)
    expect(canTransition('dine-in', 'confirmed', 'cancelled')).toBe(true)
  })

  it('trạng thái cuối không đi tiếp', () => {
    expect(canTransition('delivery', 'completed', 'created')).toBe(false)
    expect(nextStatuses('delivery', 'completed')).toEqual([])
    expect(nextStatuses('delivery', 'cancelled')).toEqual([])
  })

  it('sai kênh cho trạng thái → false', () => {
    expect(canTransition('delivery', 'ready', 'ready_for_pickup')).toBe(false)
  })
})

describe('transition', () => {
  it('trả về trạng thái mới khi hợp lệ', () => {
    expect(transition('delivery', 'created', 'confirmed')).toBe('confirmed')
  })
  it('throw khi bất hợp lệ', () => {
    expect(() => transition('delivery', 'created', 'delivered')).toThrow()
  })
})

describe('isTerminal & refundFraction', () => {
  it('isTerminal', () => {
    expect(isTerminal('completed')).toBe(true)
    expect(isTerminal('cancelled')).toBe(true)
    expect(isTerminal('preparing')).toBe(false)
  })
  it('refundFraction theo giai đoạn', () => {
    expect(refundFraction('delivery', 'created')).toBe(1)
    expect(refundFraction('delivery', 'confirmed')).toBe(1)
    expect(refundFraction('delivery', 'preparing')).toBe(0.5)
    expect(refundFraction('delivery', 'ready')).toBe(0.5)
    expect(refundFraction('delivery', 'delivered')).toBe(0)
  })
})
