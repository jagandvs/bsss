import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import FormEntry from './components/FormEntry';
import EntriesList from './components/EntriesList';
import EntryView from './components/EntryView';
import PrintAll from './components/PrintAll';
import Login from './components/Login';
import CreateUser from './components/CreateUser';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/list" replace />} />
            <Route
              path="/list"
              element={
                <ProtectedRoute>
                  <EntriesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/form"
              element={
                <ProtectedRoute>
                  <FormEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/form/:id"
              element={
                <ProtectedRoute>
                  <FormEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view/:id"
              element={
                <ProtectedRoute>
                  <EntryView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/print/:id"
              element={
                <ProtectedRoute>
                  <EntryView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/print-all"
              element={
                <ProtectedRoute>
                  <PrintAll />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-user"
              element={
                <ProtectedRoute>
                  <CreateUser />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
