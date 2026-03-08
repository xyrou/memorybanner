import { NextRequest } from 'next/server'
import { verifyPin } from '@/lib/pin'

type PinProtectedOrder = {
  pin_required?: boolean | null
  access_pin_hash?: string | null
}

export function readGuestPin(req: NextRequest): string {
  const value = req.headers.get('x-guest-pin')
  return value ? decodeURIComponent(value).trim() : ''
}

export function hasOrderAccess(req: NextRequest, order: PinProtectedOrder): boolean {
  if (!order.pin_required) return true
  const pin = readGuestPin(req)
  if (!pin) return false
  return verifyPin(pin, order.access_pin_hash ?? null)
}
