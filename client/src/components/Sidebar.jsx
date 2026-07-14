import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/new-review', label: 'New review' },
  { to: '/profile', label: 'Profile' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="w-56 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-lg font-semibold mb-6">Code Review AI</h1>
      <nav className="flex flex-col gap-2 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="px-3 py-2 rounded text-left text-red-300 hover:bg-gray-800 hover:text-red-400"
      >
        Logout
      </button>
    </aside>
  );
}