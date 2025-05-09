import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  BookText,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Mock data untuk demonstrasi UI - akan diganti dengan data sebenarnya nanti
const moduleData = [
  {
    id: 'md001',
    title: 'Pengantar Machine Learning',
    description: 'Dasar-dasar machine learning untuk pemula',
    status: 'active',
    date: '24/4/2025',
  },
  {
    id: 'md002',
    title: 'Algoritma dan Struktur Data',
    description: 'Pemahaman tentang algoritma dasar dalam pemrograman',
    status: 'active',
    date: '19/4/2025',
  },
  {
    id: 'md003',
    title: 'Front-end Web Development',
    description: 'Belajar HTML, CSS, dan JavaScript untuk membuat website',
    status: 'inactive',
    date: '19/4/2025',
  },
  {
    id: 'md004',
    title: 'Database Management',
    description: 'Pengelolaan database SQL dan NoSQL',
    status: 'active',
    date: '7/4/2025',
  },
]

export function ModuleTable() {
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-slate-700/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center">
            <BookText className="mr-2 h-5 w-5 text-cyan-500" />
            Daftar Modul
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-cyan-500/10 text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/20"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Modul
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Tabs */}
        <div className="border-b border-slate-700/50 p-4 flex justify-between items-center">
          <Tabs defaultValue="table" className="w-auto">
            <TabsList className="bg-slate-800/50">
              <TabsTrigger
                value="table"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
              >
                Table
              </TabsTrigger>
              <TabsTrigger
                value="card"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
              >
                Card
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Legend */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
              <span className="text-xs text-slate-400">Aktif</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-xs text-slate-400">Tidak Aktif</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari judul modul..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-200"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Select>
              <SelectTrigger className="w-[180px] bg-slate-800/50 border border-slate-700/50 text-slate-200">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-800/50 border border-slate-700/50"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-700/50 bg-slate-800/50">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Judul</th>
                <th className="px-4 py-3 font-medium">Deskripsi</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {moduleData.map((module) => (
                <tr
                  key={module.id}
                  className="border-b border-slate-700/30 text-sm"
                >
                  <td className="px-4 py-3 text-slate-500">{module.id}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">
                    {module.title}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-cyan-400">{module.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`${
                        module.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      } rounded-md text-xs font-medium border`}
                    >
                      {module.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-purple-400">{module.date}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between text-sm border-t border-slate-700/50">
          <div className="text-slate-400">Menampilkan 1 - 4 dari 4 data</div>
          <div className="flex items-center space-x-4">
            <div className="text-slate-400 flex items-center">
              <span>Baris per halaman</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-16 ml-2 bg-slate-800/50 border border-slate-700/50">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex items-center text-slate-400 opacity-50"
                disabled
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex items-center text-slate-400 opacity-50"
                disabled
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
