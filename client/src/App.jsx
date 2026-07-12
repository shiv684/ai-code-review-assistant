import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NewReview from './pages/NewReview';
import Results from './pages/Results';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root path redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth pages — no sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* App pages — wrapped in layout with sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-review" element={<NewReview />} />
          <Route path="/results" element={<Results />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;