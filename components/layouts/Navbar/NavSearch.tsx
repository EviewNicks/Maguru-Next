// import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

function NavSearch() {
  return (
    <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search systems..."
        className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-500"
      />
    </div>
  )
}
export default NavSearch
