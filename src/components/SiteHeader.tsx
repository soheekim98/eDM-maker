"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "빌더" },
  { href: "/maker", label: "메이커" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-gray-800">
          eDM
        </Link>
        <nav className="flex gap-1">
          {TABS.map((tab) => {
            const active =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors " +
                  (active
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100")
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
