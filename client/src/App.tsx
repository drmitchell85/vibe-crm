import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { LoadingState } from './components/ui';

// Lazy-loaded route components for code splitting
// Each page becomes a separate chunk that's loaded on demand
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ContactsPage = lazy(() => import('./pages/ContactsPage').then(m => ({ default: m.ContactsPage })));
const ContactDetailPage = lazy(() => import('./pages/ContactDetailPage').then(m => ({ default: m.ContactDetailPage })));
const RemindersPage = lazy(() => import('./pages/RemindersPage').then(m => ({ default: m.RemindersPage })));
const TagsPage = lazy(() => import('./pages/TagsPage').then(m => ({ default: m.TagsPage })));

function App() {
  return (
    <KeyboardShortcutsProvider>
      <Layout>
        <Suspense fallback={<LoadingState message="Loading page..." size="lg" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/contacts/:id" element={<ContactDetailPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/tags" element={<TagsPage />} />
          </Routes>
        </Suspense>
      </Layout>
      <KeyboardShortcutsModal />
    </KeyboardShortcutsProvider>
  );
}

export default App;
