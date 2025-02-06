// page.tsx
import { User } from '@/types/user'
import { DataTable } from './UserTable/DataTable'
const users: User[] = [
  {
    id: 'user_001',
    clerkUserId: 'clerk_001',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'admin',
    status: 'active',
    createdAt: '2025-02-01',
    updatedAt: new Date(),
  },
  {
    id: 'user_002',
    clerkUserId: 'clerk_002',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'mahasiswa',
    status: 'active',
    createdAt: '2025-02-02',
    updatedAt: new Date(),
  },
  {
    id: 'user_003',
    clerkUserId: 'clerk_003',
    email: 'alex.johnson@example.com',
    name: 'Alex Johnson',
    role: 'dosen',
    status: 'inactive',
    createdAt: '2025-02-03',
    updatedAt: new Date(),
  },
  {
    id: 'user_004',
    clerkUserId: 'clerk_004',
    email: 'michael.brown@example.com',
    name: 'Michael Brown',
    role: 'admin',
    status: 'active',
    createdAt: '2025-02-04',
    updatedAt: new Date(),
  },
  {
    id: 'user_005',
    clerkUserId: 'clerk_005',
    email: 'emily.white@example.com',
    name: 'Emily White',
    role: 'mahasiswa',
    status: 'active',
    createdAt: '2025-02-05',
    updatedAt: new Date(),
  },
  {
    id: 'user_006',
    clerkUserId: 'clerk_006',
    email: 'david.miller@example.com',
    name: 'David Miller',
    role: 'dosen',
    status: 'inactive',
    createdAt: '2025-02-06',
    updatedAt: new Date(),
  },
  {
    id: 'user_007',
    clerkUserId: 'clerk_007',
    email: 'sarah.jones@example.com',
    name: 'Sarah Jones',
    role: 'mahasiswa',
    status: 'active',
    createdAt: '2025-02-07',
    updatedAt: new Date(),
  },
  {
    id: 'user_008',
    clerkUserId: 'clerk_008',
    email: 'robert.taylor@example.com',
    name: 'Robert Taylor',
    role: 'dosen',
    status: 'inactive',
    createdAt: '2025-02-08',
    updatedAt: new Date(),
  },
  {
    id: 'user_009',
    clerkUserId: 'clerk_009',
    email: 'olivia.wilson@example.com',
    name: 'Olivia Wilson',
    role: 'mahasiswa',
    status: 'active',
    createdAt: '2025-02-09',
    updatedAt: new Date(),
  },
  {
    id: 'user_010',
    clerkUserId: 'clerk_010',
    email: 'william.anderson@example.com',
    name: 'William Anderson',
    role: 'admin',
    status: 'active',
    createdAt: '2025-02-10',
    updatedAt: new Date(),
  },
];


export default function UsersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Daftar Pengguna</h1>
      <DataTable data={users} />
    </div>
  )
}
