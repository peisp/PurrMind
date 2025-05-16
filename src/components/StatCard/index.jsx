import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

function StatCard({ label, value, color = 'text-primary', onClick }) {
  return (
    <Card
      className="transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1 cursor-pointer rounded-2xl border bg-background"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2">
        <div className="text-sm text-muted-foreground tracking-wide">
          {label}
        </div>
        <div className={`text-2xl font-bold ${color}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard
