export const dynamic = "force-dynamic";

import { EditorLayout } from "@/components/editor/EditorLayout";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  return <EditorLayout pageId={id} />;
}
