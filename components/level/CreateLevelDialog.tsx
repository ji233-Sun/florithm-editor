"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Template {
  id: string;
  name: string;
  file: string;
}

interface CreateLevelDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateLevelDialog({ onClose, onCreated }: CreateLevelDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/configs/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setLoading(true);

    try {
      const body: Record<string, string> = { name: name.trim() };
      if (templateId) body.templateId = templateId;

      const res = await fetch("/api/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "创建失败");
        return;
      }
      onCreated();
      router.push(`/editor/${data.level.id}`);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          <X size={16} />
        </button>
        <h3 className="text-lg font-bold">新建关卡</h3>

        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">关卡名称</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="我的关卡"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">模板</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value="">空白关卡</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !name.trim()}
            >
              {loading && <span className="loading loading-spinner loading-sm" />}
              创建
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
