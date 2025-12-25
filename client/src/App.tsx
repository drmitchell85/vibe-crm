import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { HomePage } from './pages/HomePage';
import { ContactsPage } from './pages/ContactsPage';
import { ContactDetailPage } from './pages/ContactDetailPage';
import { RemindersPage } from './pages/RemindersPage';
import { TagsPage } from './pages/TagsPage';

function App() {
  return (
    <KeyboardShortcutsProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/tags" element={<TagsPage />} />
        </Routes>
      </Layout>
      <KeyboardShortcutsModal />
    </KeyboardShortcutsProvider>
  );
}

export default App;
