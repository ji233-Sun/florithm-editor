"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, fetchUser, logout } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const isEditor = pathname.startsWith("/editor/");

  return (
    <div className="flex min-h-screen flex-col bg-base-200">
      {/* Navbar */}
      <div className="navbar h-14 min-h-0 border-b border-base-300 bg-base-100 px-4">
        <div className="flex-1">
          <Link href="/" className="text-lg font-bold tracking-tight text-primary">
            Florithm
          </Link>
        </div>
        <div className="flex-none gap-2">
          <ThemeToggle />
          {user && (
            <>
              <span className="text-sm text-base-content/60">
                {user.nickname}
              </span>
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={handleLogout}
                title="登出"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content — editor pages get full width, others get container */}
      {isEditor ? (
        <main className="flex-1">{children}</main>
      ) : (
        <main className="container mx-auto flex-1 p-4 md:p-6">{children}</main>
      )}
    </div>
  );
}
