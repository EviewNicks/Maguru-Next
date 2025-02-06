import { ArrowsPointingInIcon, ArrowTopRightOnSquareIcon, ChartBarIcon } from "@heroicons/react/24/outline";


type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const links: NavLink[] = [
  {
    href: "/add-job",
    label: "add job",
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
];

export default links;
