import { createHash, randomBytes } from 'node:crypto'
import { HOLD_MINUTES, MAX_PANELS_PER_ORDER, cleanName, priceFor, validPanelSelection } from '../../../src/features/adopt/adopt.mjs'
import type { Vipps } from './vipps'

export type AdoptionStatus = 'pending' | 'authorized' | 'paid' | 'cancelled' | 'failed'
export type Adoption = {
  id: number | string
  reference: string
  status: AdoptionStatus
  panels: string[]
  panelCount: number
  amount: number // whole kroner
  displayName?: string | null
  showName?: boolean | null
  vippsState?: string | null
  expiresAt: string
  paidAt?: string | null
  client?: string | null
}
export type NewAdoption = Omit<Adoption, 'id'>

/** Storage for adoptions; the CMS uses Payload, the tests an in-memory list. */
export interface AdoptionStore {
  /** Paid adoptions, and unpaid ones that still hold their panels. */
  holding(now: Date): Promise<Adoption[]>
  /** Unpaid adoptions whose hold has run out without a final answer. */
  stale(now: Date, limit: number): Promise<Adoption[]>
  byReference(reference: string): Promise<Adoption | null>
  create(data: NewAdoption): Promise<Adoption>
  update(id: Adoption['id'], data: Partial<NewAdoption>): Promise<Adoption>
}

export class AdoptError extends Error {
  constructor(message: string, readonly status: number) { super(message) }
}

// One checkout at a time, so two buyers cannot hold the same panel. The CMS runs as a single process.
let queue: Promise<unknown> = Promise.resolve()
function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.catch(() => undefined)
  return run
}

const MAX_HELD_PER_CLIENT = MAX_PANELS_PER_ORDER
const final: AdoptionStatus[] = ['paid', 'cancelled', 'failed']

/** Taken panels for the website: name only for paid adoptions that show it. */
export async function publicPanels(store: AdoptionStore, now = new Date()) {
  const taken: { id: string; name: string | null; held: boolean }[] = []
  for (const adoption of await store.holding(now)) {
    const paid = adoption.status === 'paid'
    const name = paid && adoption.showName !== false && adoption.displayName ? adoption.displayName : null
    for (const id of adoption.panels) taken.push({ id, name, held: !paid })
  }
  return taken
}

/** Asks Vipps about one adoption and records the answer. Captures authorized payments. */
export async function syncAdoption(store: AdoptionStore, vipps: Vipps, adoption: Adoption, now = new Date()) {
  if (final.includes(adoption.status)) return adoption
  const amountOre = adoption.amount * 100
  let payment = await vipps.getPayment(adoption.reference)
  if (payment.state === 'AUTHORIZED' && payment.capturedOre < amountOre) {
    try {
      payment = await vipps.capture(adoption.reference, amountOre)
    } catch (error) {
      // Keep the panels held; the next check tries the capture again.
      return store.update(adoption.id, { status: 'authorized', vippsState: payment.state })
    }
  }
  if (payment.capturedOre >= amountOre) {
    return store.update(adoption.id, { status: 'paid', vippsState: payment.state, paidAt: now.toISOString() })
  }
  if (['ABORTED', 'EXPIRED', 'TERMINATED'].includes(payment.state)) {
    return store.update(adoption.id, { status: 'cancelled', vippsState: payment.state })
  }
  if (payment.state === 'CREATED' && new Date(adoption.expiresAt) <= now) {
    await vipps.cancel(adoption.reference).catch(() => undefined)
    return store.update(adoption.id, { status: 'cancelled', vippsState: payment.state })
  }
  return adoption.vippsState === payment.state ? adoption : store.update(adoption.id, { vippsState: payment.state })
}

/** Settles a few adoptions whose hold ran out, so their panels are not given away twice. */
export async function settleStale(store: AdoptionStore, vipps: Vipps, now = new Date(), limit = 5) {
  for (const adoption of await store.stale(now, limit)) {
    await syncAdoption(store, vipps, adoption, now).catch(() => undefined)
  }
}

export const clientKey = (ip: string, secret: string) => createHash('sha256').update(`${secret}:${ip}`).digest('hex').slice(0, 32)

export async function startCheckout(options: {
  store: AdoptionStore
  vipps: Vipps
  body: unknown
  client: string
  websiteURL: string
  now?: Date
}) {
  const { store, vipps, client, websiteURL } = options
  const now = options.now ?? new Date()
  const body = (options.body && typeof options.body === 'object' ? options.body : {}) as Record<string, unknown>
  const panels = body.panels
  const problem = validPanelSelection(panels)
  if (problem) throw new AdoptError(problem, 400)
  const chosen = panels as string[]
  const name = cleanName(body.name)

  const adoption = await exclusive(async () => {
    await settleStale(store, vipps, now)
    const holding = await store.holding(now)
    const taken = new Set(holding.flatMap(other => other.panels))
    if (chosen.some(id => taken.has(id))) throw new AdoptError('Some of these panels were just taken. Please choose others.', 409)
    const heldByClient = holding.filter(other => other.client === client && other.status !== 'paid')
      .reduce((sum, other) => sum + other.panelCount, 0)
    if (heldByClient + chosen.length > MAX_HELD_PER_CLIENT) {
      throw new AdoptError('You already have panels waiting for payment. Finish or cancel that payment first.', 429)
    }
    const { total } = priceFor(chosen.length)
    return store.create({
      reference: `nordlys-adopt-${randomBytes(10).toString('hex')}`,
      status: 'pending',
      panels: chosen,
      panelCount: chosen.length,
      amount: total,
      displayName: name || null,
      showName: Boolean(name) && body.showName !== false,
      expiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString(),
      client,
    })
  })

  try {
    const count = adoption.panelCount
    const { redirectUrl } = await vipps.createPayment({
      reference: adoption.reference,
      amountOre: adoption.amount * 100,
      description: `Adopt ${count} solar panel${count === 1 ? '' : 's'} – Nordlys NTNU`,
      returnUrl: `${websiteURL}/adopt?reference=${adoption.reference}`,
    })
    return { reference: adoption.reference, redirectUrl }
  } catch (error) {
    await store.update(adoption.id, { status: 'failed' })
    throw new AdoptError('Vipps could not start the payment. Please try again in a moment.', 502)
  }
}
