import { Text, Group } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";

const ACCEPTED_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
];

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  loading?: boolean;
}

export function FileDropzone({ onDrop, loading }: FileDropzoneProps) {
  return (
    <Dropzone
      onDrop={onDrop}
      accept={ACCEPTED_TYPES}
      loading={loading}
      maxSize={50 * 1024 * 1024}
    >
      <Group justify="center" style={{ minHeight: 120, pointerEvents: "none" }}>
        <div style={{ textAlign: "center" }}>
          <Text size="xl" fw={500}>
            ファイルをドロップ、またはクリックして選択
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            PDF、TXT、Markdown ファイルに対応（最大 50MB）
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
