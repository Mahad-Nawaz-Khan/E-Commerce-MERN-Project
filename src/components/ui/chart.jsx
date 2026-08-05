/**
 * recharts wrappers themed for the Midnight Showroom palette.
 *   - <Gauge value max label />          half-circle progress gauge
 *   - <LineTrend data />                  revenue/orders over time
 *   - <DonutChart data />                 status / payment split
 *   - <BarChartMini data />               category / stock-range bars
 *
 * recharts is lazy-imported per-component so the heavy lib only loads when a
 * dashboard is opened.
 */
import { lazy, Suspense } from 'react'
import { Skeleton } from './skeleton'

const GOLD = '#E8B339'
const CHART_COLORS = [GOLD, '#818CF8', '#34D399', '#60A5FA', '#F87171', '#A78BFA', '#F472B6']

function ChartFallback({ className }) {
  return <Skeleton className={className || 'h-64 w-full'} />
}

// ---- Half-circle gauge ---------------------------------------------------
const GaugeImpl = lazy(async () => {
  const { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } = await import('recharts')
  return {
    default: function Gauge({ value = 0, max = 100, label, sublabel, color = GOLD, height = 200 }) {
      const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0))
      const data = [{ name: 'gauge', value: pct, fill: color }]
      return (
        <div className="flex flex-col items-center">
          <div style={{ height }} className="relative w-full max-w-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={data}
                startAngle={180}
                endAngle={0}
                barSize={18}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: 'rgba(255,255,255,0.06)' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center">
              <span className="font-display text-3xl font-black text-[var(--color-text)] nums">{Math.round(pct)}%</span>
              {sublabel && <span className="text-xs text-[var(--color-text-muted)]">{sublabel}</span>}
            </div>
          </div>
          {label && <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">{label}</p>}
        </div>
      )
    },
  }
})

// ---- Line / area trend ---------------------------------------------------
const LineTrendImpl = lazy(async () => {
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } = await import('recharts')
  return {
    default: function LineTrend({ data = [], xKey = 'date', series = [{ key: 'revenue', name: 'Revenue', color: GOLD }], height = 280, area = true, valueFormatter }) {
      const Chart = area ? AreaChart : LineChart
      return (
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                {series.map((s) => (
                  <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fill: '#7E7A70', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={20} />
              <YAxis tick={{ fill: '#7E7A70', fontSize: 11 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => valueFormatter ? valueFormatter(v) : v} />
              <Tooltip
                contentStyle={{ background: '#0C1018', border: '1px solid #1C2333', borderRadius: 10, color: '#F2EFE8', fontSize: 12 }}
                labelStyle={{ color: '#B9B4A7' }}
                formatter={(v, name) => [valueFormatter ? valueFormatter(v) : v, name]}
              />
              {series.map((s) => area ? (
                <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} fill={`url(#grad-${s.key})`} dot={false} />
              ) : (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} />
              ))}
            </Chart>
          </ResponsiveContainer>
        </div>
      )
    },
  }
})

// ---- Donut / pie ---------------------------------------------------------
const DonutChartImpl = lazy(async () => {
  const { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } = await import('recharts')
  return {
    default: function DonutChart({ data = [], height = 260, colors = CHART_COLORS, valueFormatter, inner = 55, showLegend = true }) {
      return (
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={inner} outerRadius={90} paddingAngle={2} stroke="none">
                {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0C1018', border: '1px solid #1C2333', borderRadius: 10, color: '#F2EFE8', fontSize: 12 }}
                formatter={(v, name) => [valueFormatter ? valueFormatter(v) : v, name]}
              />
              {showLegend && <Legend wrapperStyle={{ fontSize: 12, color: '#B9B4A7' }} iconType="circle" />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      )
    },
  }
})

// ---- Horizontal / vertical bars -----------------------------------------
const BarChartMiniImpl = lazy(async () => {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } = await import('recharts')
  return {
    default: function BarChartMini({ data = [], xKey = 'name', yKey = 'value', height = 280, layout = 'horizontal', color = GOLD, valueFormatter }) {
      return (
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout={layout === 'vertical' ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={layout === 'vertical'} horizontal={layout !== 'vertical'} />
              {layout === 'vertical' ? (
                <>
                  <XAxis type="number" tick={{ fill: '#7E7A70', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => valueFormatter ? valueFormatter(v) : v} />
                  <YAxis type="category" dataKey={xKey} tick={{ fill: '#B9B4A7', fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                </>
              ) : (
                <>
                  <XAxis dataKey={xKey} tick={{ fill: '#7E7A70', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#7E7A70', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => valueFormatter ? valueFormatter(v) : v} width={48} />
                </>
              )}
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ background: '#0C1018', border: '1px solid #1C2333', borderRadius: 10, color: '#F2EFE8', fontSize: 12 }}
                formatter={(v) => [valueFormatter ? valueFormatter(v) : v, yKey]}
              />
              <Bar dataKey={yKey} radius={layout === 'vertical' ? [0, 4, 4, 0] : [4, 4, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={Array.isArray(color) ? color[i % color.length] : color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    },
  }
})

// Public wrappers with Suspense fallbacks
export function Gauge(props) {
  return <Suspense fallback={<ChartFallback className="h-[220px] w-full" />}><GaugeImpl {...props} /></Suspense>
}
export function LineTrend(props) {
  return <Suspense fallback={<ChartFallback />}><LineTrendImpl {...props} /></Suspense>
}
export function DonutChart(props) {
  return <Suspense fallback={<ChartFallback />}><DonutChartImpl {...props} /></Suspense>
}
export function BarChartMini(props) {
  return <Suspense fallback={<ChartFallback />}><BarChartMiniImpl {...props} /></Suspense>
}
