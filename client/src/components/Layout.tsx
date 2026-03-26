import { AppShell, NavLink, Title } from "@mantine/core";
import { NavLink as RouterLink, useLocation } from "react-router";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { label: "アップロード", path: "/" },
  { label: "文書一覧", path: "/documents" },
  { label: "検索・チャット", path: "/search" },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <AppShell
      navbar={{ width: 200, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        <Title order={5} mb="md">
          ContextHub
        </Title>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            component={RouterLink}
            to={item.path}
            active={location.pathname === item.path}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
