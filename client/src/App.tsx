import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">FPH CRM</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to FPH CRM
              </h2>
              <p className="text-gray-600">
                Your personal contact relationship manager
              </p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
