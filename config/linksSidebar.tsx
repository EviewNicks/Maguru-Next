import { 
  ArrowTopRightOnSquareIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const links: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <ChartBarIcon className="w-5 h-5" />,
  },
  {
    href: "/module",
    label: "Modul Pembelajaran",
    icon: <AcademicCapIcon className="w-5 h-5" />,
  },
  {
    href: "/manage-module",
    label: "Kelola Modul",
    icon: <DocumentTextIcon className="w-5 h-5" />,
  },
  {
    href: "/jobs",
    label: "Lowongan Kerja",
    icon: <ArrowTopRightOnSquareIcon className="w-5 h-5" />,
  },
];

export default links;
