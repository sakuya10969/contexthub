import {
  Table,
  Badge,
  ActionIcon,
  Group,
  Tooltip,
  Text,
  Modal,
  Button,
  Stack,
} from "@mantine/core";
import { useState } from "react";
import type { Document } from "../types";

const STATUS_COLOR: Record<string, string> = {
  uploaded: "gray",
  processing: "yellow",
  indexed: "green",
  failed: "red",
};

const STATUS_LABEL: Record<string, string> = {
  uploaded: "アップロード済み",
  processing: "処理中",
  indexed: "インデックス済み",
  failed: "失敗",
};

interface Props {
  documents: Document[];
  onDelete: (id: string) => void;
  onReindex: (id: string) => void;
  deletingId?: string | null;
  reindexingId?: string | null;
}

export function DocumentTable({
  documents,
  onDelete,
  onReindex,
  deletingId,
  reindexingId,
}: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        文書が登録されていません
      </Text>
    );
  }

  return (
    <>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ファイル名</Table.Th>
            <Table.Th>種別</Table.Th>
            <Table.Th>状態</Table.Th>
            <Table.Th>作成日時</Table.Th>
            <Table.Th>操作</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {documents.map((doc) => (
            <Table.Tr key={doc.document_id}>
              <Table.Td>{doc.file_name}</Table.Td>
              <Table.Td>{doc.file_type.toUpperCase()}</Table.Td>
              <Table.Td>
                <Badge color={STATUS_COLOR[doc.status]}>
                  {STATUS_LABEL[doc.status] ?? doc.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                {new Date(doc.created_at).toLocaleString("ja-JP")}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Tooltip label="再インデックス">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      loading={reindexingId === doc.document_id}
                      onClick={() => onReindex(doc.document_id)}
                      disabled={doc.status === "processing"}
                    >
                      ↺
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="削除">
                    <ActionIcon
                      variant="light"
                      color="red"
                      loading={deletingId === doc.document_id}
                      onClick={() => setConfirmId(doc.document_id)}
                    >
                      ×
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={confirmId !== null}
        onClose={() => setConfirmId(null)}
        title="文書の削除"
      >
        <Stack>
          <Text>この文書を削除しますか？この操作は元に戻せません。</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmId(null)}>
              キャンセル
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (confirmId) onDelete(confirmId);
                setConfirmId(null);
              }}
            >
              削除
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
