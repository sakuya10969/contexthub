import { Card, Text, Badge, Group, Collapse, UnstyledButton } from "@mantine/core";
import { useState } from "react";
import type { Citation } from "../types";

interface Props {
  citation: Citation;
  index: number;
}

export function CitationCard({ citation, index }: Props) {
  const [opened, setOpened] = useState(false);

  return (
    <Card withBorder padding="xs" radius="sm">
      <UnstyledButton onClick={() => setOpened((o) => !o)} w="100%">
        <Group justify="space-between">
          <Group gap="xs">
            <Badge size="sm" variant="outline">
              [{index}]
            </Badge>
            <Text size="sm" fw={500}>
              {citation.file_name}
            </Text>
            {citation.page_number && (
              <Text size="xs" c="dimmed">
                p.{citation.page_number}
              </Text>
            )}
          </Group>
          <Group gap="xs">
            <Badge size="xs" color="blue">
              {(citation.score * 100).toFixed(0)}%
            </Badge>
            <Text size="xs" c="dimmed">
              {opened ? "▲" : "▼"}
            </Text>
          </Group>
        </Group>
      </UnstyledButton>
      <Collapse in={opened}>
        <Text size="sm" c="dimmed" mt="xs" style={{ whiteSpace: "pre-wrap" }}>
          {citation.content}
        </Text>
      </Collapse>
    </Card>
  );
}
