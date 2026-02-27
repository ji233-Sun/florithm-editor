"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  function startCountdown() {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "发送失败");
        return;
      }
      setStep("verify");
      startCountdown();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password, nickname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "注册失败");
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

  async function handleResend() {
    if (countdown > 0) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "发送失败");
        return;
      }
      startCountdown();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="card-title justify-center">注册</h2>

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={handleSendCode}>
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

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading && <span className="loading loading-spinner loading-sm" />}
              发送验证码
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">邮箱</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={email}
              disabled
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">验证码</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder="6 位验证码"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline btn-sm self-center"
                disabled={countdown > 0 || loading}
                onClick={handleResend}
              >
                {countdown > 0 ? `${countdown}s` : "重新发送"}
              </button>
            </div>
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">昵称</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="你的昵称"
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
              minLength={6}
            />
          </div>

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading && <span className="loading loading-spinner loading-sm" />}
              注册
            </button>
          </div>
        </form>
      )}

      <p className="mt-4 text-center text-sm">
        已有账号？{" "}
        <Link href="/login" className="link link-primary">
          登录
        </Link>
      </p>
    </>
  );
}
