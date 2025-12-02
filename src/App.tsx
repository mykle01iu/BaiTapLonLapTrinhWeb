import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route cha: MainLayout (chứa Menu bên trái) */}
        <Route path="/" element={<MainLayout />}>

          {/* Route con: Dashboard (hiện ở bên phải) */}
          <Route index element={<Dashboard />} />

          {/* Các trang khác (sẽ làm sau) - Tạm thời redirect về Dashboard */}
          <Route path="transactions" element={<Transactions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />

          {/* Nếu vào link linh tinh thì tự về trang chủ */}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;