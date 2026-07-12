import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}