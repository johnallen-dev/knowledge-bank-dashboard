'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

interface DayData {
  date: string
  total: number
  guest: number
  user: number
}

export function QuestionsChart({ data }: { data: DayData[] }) {
  if (!data.length) {
    return <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">No data yet</div>
  }
  const formatted = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="guest" name="Guest" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="user" name="Staff" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
