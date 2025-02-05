import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const users = [
  {
    id: 'user_001',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'admin',
    createdAt: '2025-02-01',
  },
  {
    id: 'user_002',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'mahasiswa',
    createdAt: '2025-02-02',
  },
  {
    id: 'user_003',
    email: 'alex.johnson@example.com',
    name: 'Alex Johnson',
    role: 'dosen',
    createdAt: '2025-02-03',
  },
]

function UserTable() {
  return (
    <Table>
      <TableCaption>Daftar Pengguna</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Tanggal Bergabung</TableHead>
          <TableHead className="text-center">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.id}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="text-right">{user.createdAt}</TableCell>
            <TableCell className="text-center space-x-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default UserTable
