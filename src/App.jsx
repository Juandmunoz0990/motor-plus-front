import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Orders from './pages/Orders';
import Services from './pages/Services';
import Parts from './pages/Parts';
import Invoices from './pages/Invoices';
import Mechanics from './pages/Mechanics';
import Suppliers from './pages/Suppliers';
import Vehicles from './pages/Vehicles';
import Reports from './pages/Reports';
import { authService } from './services/authService';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública de login */}
        <Route 
          path="/login" 
          element={
            authService.isAuthenticated() ? <Navigate to="/" replace /> : <Login />
          } 
        />
        
        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="orders" element={<Orders />} />
          <Route path="services" element={<Services />} />
          <Route path="parts" element={<Parts />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="mechanics" element={<Mechanics />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
