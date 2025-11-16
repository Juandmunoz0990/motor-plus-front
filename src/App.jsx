import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
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
