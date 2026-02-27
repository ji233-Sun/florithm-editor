import { EditorShell } from "@/components/editor/EditorShell";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;

  return (
    <div className="h-[calc(100vh-64px)]">
      <EditorShell levelId={levelId} />
    </div>
  );
}
