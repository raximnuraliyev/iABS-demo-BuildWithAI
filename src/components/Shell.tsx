import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Shell() {
  return (
    <div id="app-shell" className="min-h-screen flex flex-col bg-sqb-bg selection:bg-sqb-navy selection:text-white">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main id="main-content" className="flex-1 overflow-y-auto p-8 relative">
          <div id="view-container" className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
