export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold">Florithm</h1>
            <p className="text-sm text-base-content/60">PvZ2 可视化关卡编辑器</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
