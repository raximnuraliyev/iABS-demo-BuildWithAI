import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Shell() {
  return (
    <div id="app-shell" className="h-screen w-screen flex flex-col bg-sqb-bg selection:bg-sqb-navy selection:text-white overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative bg-sqb-bg">
          <div id="view-container" className="w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
