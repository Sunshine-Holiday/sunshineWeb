import { Users, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { StatCardData } from "@/types/analytics";

export const dashboardStats: StatCardData[] = [
  {
    title: "Total Users",
    value: "10.5k",
    icon: Users,
    description: "compared to last month",
    trend: { value: "+12.5%", isPositive: true },
  },

  {
    title: "Revenue",
    value: "₹48.2k",
    icon: TrendingUp,
    description: "compared to last month",
    trend: { value: "+15.3%", isPositive: true },
  },
];
