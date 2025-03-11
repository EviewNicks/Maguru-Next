import { ArrowsPointingInIcon, ArrowTopRightOnSquareIcon, ChartBarIcon } from "@heroicons/react/24/outline";


type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const links: NavLink[] = [
  {
    href: "/module",
    label: "modul Pembelajaran",
    icon: <ArrowsPointingInIcon/>,
  },
  {
    href: "/jobs",
    label: "all jobs",
    icon: <ArrowTopRightOnSquareIcon />,
  },
  {
    href: "/stats",
    label: "stats",
    icon: <ChartBarIcon />,
  },
  {
    href: "/manage-module",
    label: "manage module",
    icon: <ArrowTopRightOnSquareIcon />,
  },
];

export default links;
