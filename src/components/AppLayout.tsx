import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(222 47% 5%)' }}>
      <Sidebar />
      <main
        className="flex-1 overflow-auto"
        style={{ marginLeft: 'var(--sidebar-width, 260px)' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
