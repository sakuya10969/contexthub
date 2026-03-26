import { Paper, Text, Stack, Title } from "@mantine/core";
import { CitationCard } from "./CitationCard";
import type { ChatMessage as ChatMessageType } from "../types";

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder={!isUser}
      bg={isUser ? "blue.0" : undefined}
    >
      <Text size="xs" c="dimmed" mb={4}>
        {isUser ? "あなた" : "アシスタント"}
      </Text>
      <Text style={{ whiteSpace: "pre-wrap" }}>{message.content}</Text>

      {message.citations && message.citations.length > 0 && (
        <Stack gap="xs" mt="sm">
          <Title order={6} c="dimmed">
            参照元
          </Title>
          {message.citations.map((citation, i) => (
            <CitationCard
              key={citation.chunk_id}
              citation={citation}
              index={i + 1}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
}
