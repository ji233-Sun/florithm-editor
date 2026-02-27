"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }
      setUser(data.user);
      router.push("/");
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="card-title justify-center">登录</h2>

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}

      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">邮箱</span>
        </label>
        <input
          type="email"
          className="input input-bordered w-full"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">密码</span>
        </label>
        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="至少 6 位"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-control mt-6">
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
          登录
        </button>
      </div>

      <p className="mt-4 text-center text-sm">
        还没有账号？{" "}
        <Link href="/register" className="link link-primary">
          注册
        </Link>
      </p>
    </form>
  );
}
