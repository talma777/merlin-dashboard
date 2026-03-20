import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 p-10 bg-slate-950 text-red-500 font-mono text-sm overflow-auto z-50 relative">
          <h1 className="text-2xl mb-4 font-bold">⚠️ FATAL RENDER ERROR</h1>
          <pre className="whitespace-pre-wrap">{this.state.error?.stack || this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[150px]" />
      </div>

      <ErrorBoundary>
        <Sidebar />
        
        <main
          className="flex-1 overflow-x-hidden overflow-y-auto relative z-10 transition-all duration-300 scroll-smooth"
          style={{ marginLeft: 'var(--sidebar-width, 280px)' }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </ErrorBoundary>
    </div>
  );
}
