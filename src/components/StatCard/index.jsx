import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

function StatCard ({ label, value, color, onClick }) {
  return (
    <Card className="transition-shadow hover:shadow-md"
          onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`text-xl font-semibold ${color}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard