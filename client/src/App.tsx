import { Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { UploadPage } from "./pages/UploadPage";
import { DocumentListPage } from "./pages/DocumentListPage";
import { SearchChatPage } from "./pages/SearchChatPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/documents" element={<DocumentListPage />} />
        <Route path="/search" element={<SearchChatPage />} />
      </Routes>
    </Layout>
  );
}
