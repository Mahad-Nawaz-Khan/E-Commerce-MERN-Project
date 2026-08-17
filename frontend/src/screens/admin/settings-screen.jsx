import { useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Store, Truck, CreditCard, Mail } from 'lucide-react'
import { Card, Input, Switch, Button, Tabs } from '../../components/ui'

const STORAGE_KEY = 'exclusive.admin.settings'
const DEFAULTS = {
  storeName: 'Exclusive',
  contactEmail: 'support@exclusive.test',
  supportPhone: '+1 555 0100',
  lowStockThreshold: 10,
  autoCancelDays: 2,
  freeShippingThreshold: 100,
  paymentCard: true,
  paymentCod: true,
  paymentSafepay: false,
  smtpHost: 'smtp.example.com',
  smtpPort: '587',
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

/** Admin settings — localStorage-backed config (low-stock threshold, payments, etc.). */
export function SettingsScreen() {
  const [settings, setSettings] = useState(load)

  function set(k, v) { setSettings((s) => ({ ...s, [k]: v })) }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    toast.success('Settings saved')
  }

  const tabs = [
    {
      label: 'General', icon: Store, content: (
        <div className="space-y-4">
          <Input label="Store Name" value={settings.storeName} onChange={(e) => set('storeName', e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Contact Email" value={settings.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
            <Input label="Support Phone" value={settings.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Low Stock Threshold" type="number" value={settings.lowStockThreshold} onChange={(e) => set('lowStockThreshold', Number(e.target.value))} hint="Products at/below this count flag as low stock." />
            <Input label="Auto-cancel (days)" type="number" value={settings.autoCancelDays} onChange={(e) => set('autoCancelDays', Number(e.target.value))} hint="0 = disabled." />
          </div>
        </div>
      ),
    },
    {
      label: 'Shipping', icon: Truck, content: (
        <div className="space-y-4">
          <Input label="Free Shipping Threshold ($)" type="number" value={settings.freeShippingThreshold} onChange={(e) => set('freeShippingThreshold', Number(e.target.value))} hint="Orders at/above this get free shipping." />
        </div>
      ),
    },
    {
      label: 'Payments', icon: CreditCard, content: (
        <div className="space-y-3">
          <Toggle label="Credit / Debit Card" checked={settings.paymentCard} onChange={(v) => set('paymentCard', v)} />
          <Toggle label="Cash on Delivery (COD)" checked={settings.paymentCod} onChange={(v) => set('paymentCod', v)} />
          <Toggle label="SafePay" checked={settings.paymentSafepay} onChange={(v) => set('paymentSafepay', v)} />
        </div>
      ),
    },
    {
      label: 'Email', icon: Mail, content: (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="SMTP Host" value={settings.smtpHost} onChange={(e) => set('smtpHost', e.target.value)} />
            <Input label="SMTP Port" value={settings.smtpPort} onChange={(e) => set('smtpPort', e.target.value)} />
          </div>
          <p className="text-xs text-[var(--color-text-subtle)]">SMTP credentials are read from server environment variables for security.</p>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--color-text)]">Settings</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Configure your store. Saved to this browser.</p>
        </div>
        <Button onClick={save}><Save className="h-4 w-4" /> Save</Button>
      </header>

      <Card><Tabs tabs={tabs} /></Card>
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-[var(--color-surface-2)] px-3 py-2.5">
      <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}
