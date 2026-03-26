import { Title, Stack, Alert, Text, List } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FileDropzone } from "../components/FileDropzone";
import { useUploadDocument } from "../hooks/useDocuments";

export function UploadPage() {
  const upload = useUploadDocument();

  async function handleDrop(files: File[]) {
    for (const file of files) {
      try {
        const doc = await upload.mutateAsync(file);
        notifications.show({
          title: "アップロード完了",
          message: `${doc.file_name} をアップロードしました。インデックス処理を開始します。`,
          color: "green",
        });
      } catch {
        notifications.show({
          title: "アップロード失敗",
          message: `${file.name} のアップロードに失敗しました。`,
          color: "red",
        });
      }
    }
  }

  return (
    <Stack gap="lg">
      <Title order={2}>ファイルアップロード</Title>
      <FileDropzone onDrop={handleDrop} loading={upload.isPending} />
      {upload.isPending && (
        <Alert color="blue" title="処理中">
          ファイルをアップロードしています...
        </Alert>
      )}
      <Stack gap="xs">
        <Text size="sm" c="dimmed" fw={500}>
          対応フォーマット
        </Text>
        <List size="sm" c="dimmed">
          <List.Item>PDF (.pdf)</List.Item>
          <List.Item>テキスト (.txt)</List.Item>
          <List.Item>Markdown (.md)</List.Item>
        </List>
      </Stack>
    </Stack>
  );
}
