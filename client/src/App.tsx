import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contacts" element={
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contacts Page
            </h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        } />
      </Routes>
    </Layout>
  );
}

export default App;
