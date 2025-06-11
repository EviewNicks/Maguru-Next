import {
  BarChart2,
  BookOpen,
  LayoutGrid,
  RefreshCw,
  BookOpenCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/features/manage-users/components/ui/MetricCard'

export function ModuleOverview() {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-slate-700/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center">
            <BarChart2 className="mr-2 h-5 w-5 text-cyan-500" />
            Manajemen Modul
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="bg-slate-800/50 text-cyan-400 border-cyan-500/50 text-xs"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mr-1 animate-pulse"></div>
              LIVE
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Modul"
            value={5}
            icon={BookOpen}
            trend="up"
            color="cyan"
            detail="5 total modul"
          />

          <MetricCard
            title="Modul Baru (7 Hari)"
            value={0}
            icon={LayoutGrid}
            trend="stable"
            color="green"
            detail="0 modul baru (7 hari terakhir)"
          />

          <MetricCard
            title="Modul Aktif"
            value={2}
            icon={BookOpenCheck}
            trend="up"
            color="purple"
            detail="2 modul aktif"
          />
        </div>
      </CardContent>
    </Card>
  )
}
