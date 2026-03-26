import {
  Title,
  Stack,
  Tabs,
  TextInput,
  Button,
  Group,
  Alert,
  Card,
  Text,
  ScrollArea,
  Loader,
  Center,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { CitationCard } from "../components/CitationCard";
import { ChatMessage } from "../components/ChatMessage";
import { useSearch } from "../hooks/useSearch";
import { useChat } from "../hooks/useChat";

export function SearchChatPage() {
  return (
    <Stack gap="lg">
      <Title order={2}>検索・チャット</Title>
      <Tabs defaultValue="search">
        <Tabs.List>
          <Tabs.Tab value="search">セマンティック検索</Tabs.Tab>
          <Tabs.Tab value="chat">チャット (RAG)</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="search" pt="md">
          <SearchPanel />
        </Tabs.Panel>
        <Tabs.Panel value="chat" pt="md">
          <ChatPanel />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

function SearchPanel() {
  const [input, setInput] = useState("");
  const { results, query, loading, error, search } = useSearch();

  function handleSearch() {
    search(input);
  }

  return (
    <Stack gap="md">
      <Group>
        <TextInput
          placeholder="検索クエリを入力..."
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1 }}
        />
        <Button onClick={handleSearch} loading={loading}>
          検索
        </Button>
      </Group>

      {error && (
        <Alert color="red" title="エラー">
          {error}
        </Alert>
      )}

      {loading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {results.length > 0 && (
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            「{query}」の検索結果: {results.length} 件
          </Text>
          {results.map((r, i) => (
            <CitationCard key={r.chunk_id} citation={r} index={i + 1} />
          ))}
        </Stack>
      )}

      {!loading && results.length === 0 && query && (
        <Text c="dimmed" ta="center" py="xl">
          検索結果がありません
        </Text>
      )}
    </Stack>
  );
}

function ChatPanel() {
  const [input, setInput] = useState("");
  const { messages, loading, error, send, clear } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    await send(msg);
  }

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button variant="subtle" size="xs" onClick={clear}>
          会話をクリア
        </Button>
      </Group>

      <ScrollArea h={500} type="auto">
        <Stack gap="sm" p="xs">
          {messages.length === 0 && (
            <Card withBorder p="lg" ta="center">
              <Text c="dimmed">
                インデックス済み文書に関する質問を入力してください
              </Text>
            </Card>
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {loading && (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          )}
          <div ref={bottomRef} />
        </Stack>
      </ScrollArea>

      {error && (
        <Alert color="red" title="エラー">
          {error}
        </Alert>
      )}

      <Group>
        <TextInput
          placeholder="質問を入力..."
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          style={{ flex: 1 }}
          disabled={loading}
        />
        <Button onClick={handleSend} loading={loading} disabled={!input.trim()}>
          送信
        </Button>
      </Group>
    </Stack>
  );
}
