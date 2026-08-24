import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BrandText } from '../Navbar.jsx';
import { ChartIcon, LogOutIcon, MenuIcon, CloseIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons.jsx';

export default function Sidebar({
  user,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  t,
}) {
  const navigate = useNavigate();

  const sideBtn = 'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-cream/80 transition-colors hover:bg-white/10 hover:text-cream';

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        ${mobileOpen ? 'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brown-900 text-cream shadow-2xl' : 'hidden'}
        lg:relative lg:z-auto lg:flex lg:flex-col lg:bg-brown-900 lg:text-cream lg:shrink-0 lg:shadow-none
        transition-[width] duration-300
        lg:sticky lg:top-0 lg:h-screen ${collapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        <button
          onClick={onCloseMobile}
          className="absolute right-2 top-2 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20 lg:hidden"
          aria-label="Close menu"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className={`flex items-center gap-2 px-5 py-5 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          {collapsed ? (
            <span
              className="text-xl font-bold leading-none text-cream"
              style={{ fontFamily: "'Beaver Punch', 'Lilita One', 'Poppins', ui-sans-serif, system-ui, sans-serif" }}
            >
              CV
            </span>
          ) : (
            <BrandText className="text-2xl font-bold leading-tight tracking-widest text-cream" />
          )}
        </div>
        <button
          onClick={onToggleCollapsed}
          aria-label={collapsed ? t('teacher.expand') : t('teacher.collapse')}
          className="absolute right-0 top-20 z-30 hidden h-8 w-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-brown-300 bg-brown-800 text-cream shadow-md transition-colors hover:bg-brown-700 lg:flex"
        >
          {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </button>

        <nav className="mt-2 flex gap-1 overflow-x-auto px-3 lg:flex-col lg:overflow-visible">
          <span className={`flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-cream shadow-inner ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
            <ChartIcon className="h-4 w-4 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>{t('teacher.dashboard')}</span>
          </span>
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-white/10 px-3 py-4">
          <div className={`mb-1 flex items-center gap-2 rounded-xl px-4 py-2.5 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brown-500 text-cream text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            {!collapsed && (
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-cream">{user?.name}</span>
            )}
          </div>
          <button
            onClick={() => {
              localStorage.setItem('cv_logging_out', '1');
              localStorage.removeItem('cv_token');
              localStorage.removeItem('cv_user');
              navigate('/login');
            }}
            className={`${sideBtn} ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <LogOutIcon className="h-4.5 w-4.5 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}