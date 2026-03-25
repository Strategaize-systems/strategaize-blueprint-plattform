"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";

const NAV_ITEMS = [
  { href: "/admin/tenants", label: "Tenants" },
  { href: "/admin/catalog", label: "Katalog" },
  { href: "/admin/runs", label: "Runs" },
];

export function AdminNav({ email }: { email?: string }) {
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-semibold">
            StrategAIze Admin
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                  size="sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {email && (
            <span className="text-sm text-muted-foreground">{email}</span>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Abmelden
          </Button>
        </div>
      </div>
    </header>
  );
}
