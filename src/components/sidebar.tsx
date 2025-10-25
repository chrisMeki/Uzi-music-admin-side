import {
  UserPlus,
  Disc3,
  Music,
  Tag,
  Music2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.jpg";

const Sidebar = ({ isOpen = true, onClose = () => {} }) => {
  const sidebarItems = [
    { icon: UserPlus, label: "Add Artist", path: "/" },
    { icon: Disc3, label: "Add Albums", path: "/albums" },
    { icon: Music, label: "Add Tracks", path: "/tracks" },
    { icon: Tag, label: "Add Genre", path: "/genre" },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 shadow-lg flex flex-col h-screen`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between h-20 px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Uzinduzi Logo"
              className="h-14 w-auto object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search music..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-2 flex-1 overflow-y-auto pb-6">
          {sidebarItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                    isActive
                      ? "text-white bg-linear-to-r from-red-600 via-red-500 to-rose-600 shadow-lg shadow-red-500/40"
                      : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                  }`
                }
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-linear-to-b from-rose-400 via-red-400 to-rose-400 rounded-r-full animate-slideIn shadow-lg shadow-red-500/50"></div>
                    )}

                    {/* Icon container */}
                    <div
                      className={`relative p-2 rounded-lg mr-3 transition-all duration-200 ${
                        isActive
                          ? "text-white bg-white/10"
                          : "text-red-500 group-hover:text-red-600 group-hover:bg-red-100"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span className="relative font-semibold">{item.label}</span>

                    {/* Hover glow effect */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-xl bg-linear-to-r from-red-600/5 to-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                    )}

                    {/* Active glow */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-linear-to-r from-red-500/20 to-rose-500/20 blur-xl -z-10"></div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Now Playing Mini Card (Optional) */}
        <div className="px-6 py-4 border-t border-gray-200 shrink-0">
          <div className="bg-linear-to-br from-red-50 to-rose-50 rounded-xl p-3 border border-red-200 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <Music2 className="w-5 h-5 text-white animate-pulse-subtle" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-red-700 truncate">
                  Now Playing
                </div>
                <div className="text-xs text-red-500 truncate">
                  Ready to groove
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 shrink-0">
          <div className="text-xs text-gray-500 text-center font-medium">
            © 2024 Uzinduzi Music
          </div>
        </div>

        {/* Custom Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideIn {
            from { 
              transform: translateX(-100%) translateY(-50%);
              opacity: 0;
            }
            to { 
              transform: translateX(0) translateY(-50%);
              opacity: 1;
            }
          }
          
          @keyframes pulse-subtle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
          
          .animate-pulse-subtle {
            animation: pulse-subtle 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;
