"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Dumbbell, Search, Activity, TrendingUp } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/today", label: "Today", icon: Calendar },
    { href: "/gym", label: "Gym", icon: Dumbbell },
    { href: "/search", label: "Search", icon: Search },
    { href: "/rehab", label: "Rehab", icon: Activity },
    { href: "/progress", label: "Progress", icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/today" && pathname === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors ${
                isActive
                  ? "text-blue-400 font-medium"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "scale-110" : ""}`} />
              <span className="text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
