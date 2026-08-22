"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

export function SearchHeaderButton() {
  const pathname = usePathname();
  const isActive = pathname === "/search";

  return (
    <Link
      href="/search"
      aria-label="Search exercises and safety rules"
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        isActive
          ? "border-blue-500/40 bg-blue-600/20 text-blue-300"
          : "border-gray-700 bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
    >
      <Search size={18} />
    </Link>
  );
}
