import { Title, Stack, Alert, Loader, Center } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DocumentTable } from "../components/DocumentTable";
import {
  useDocuments,
  useDeleteDocument,
  useReindexDocument,
} from "../hooks/useDocuments";
import { useState } from "react";

export function DocumentListPage() {
  const { data: documents, isLoading, error } = useDocuments();
  const deleteMutation = useDeleteDocument();
  const reindexMutation = useReindexDocument();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reindexingId, setReindexingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      notifications.show({
        title: "削除完了",
        message: "文書を削除しました",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "削除失敗",
        message: "文書の削除に失敗しました",
        color: "red",
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReindex(id: string) {
    setReindexingId(id);
    try {
      await reindexMutation.mutateAsync(id);
      notifications.show({
        title: "再インデックス開始",
        message: "再インデックス処理を開始しました",
        color: "blue",
      });
    } catch {
      notifications.show({
        title: "再インデックス失敗",
        message: "再インデックスに失敗しました",
        color: "red",
      });
    } finally {
      setReindexingId(null);
    }
  }

  return (
    <Stack gap="lg">
      <Title order={2}>文書一覧</Title>
      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}
      {error && (
        <Alert color="red" title="エラー">
          文書一覧の取得に失敗しました
        </Alert>
      )}
      {documents && (
        <DocumentTable
          documents={documents}
          onDelete={handleDelete}
          onReindex={handleReindex}
          deletingId={deletingId}
          reindexingId={reindexingId}
        />
      )}
    </Stack>
  );
}
