import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[150px]" />
      </div>

      <Sidebar />
      
      <main
        className="flex-1 overflow-x-hidden overflow-y-auto relative z-10 transition-all duration-300 scroll-smooth"
        style={{ marginLeft: 'var(--sidebar-width, 280px)' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
