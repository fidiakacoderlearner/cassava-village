import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useAudio } from '../context/AudioContext.jsx';
import Avatar from './Avatar.jsx';
import { SpeakerOnIcon, SpeakerOffIcon } from './icons.jsx';

export function BrandText({ className = '' }) {
  return (
    <span
      className={`uppercase ${className}`}
      style={{ fontFamily: "'Beaver Punch', 'Lilita One', 'Poppins', ui-sans-serif, system-ui, sans-serif" }}
    >
      Cassava Village
    </span>
  );
}

function Logo() {
  return (
    <div className="flex items-center">
      <BrandText className="text-xl leading-none text-cream sm:text-2xl lg:text-3xl" />
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, setLanguage } = useI18n();
  const { musicOn, toggleMusic, stopMusic, musicAvailable } = useAudio();
  const navigate = useNavigate();
  const location = useLocation();

  const isTeacher = user?.role === 'teacher';

  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-cream text-brown-900 shadow'
        : 'text-cream/80 hover:bg-white/10 hover:text-cream'
    }`;

  const links = isTeacher ? [{ to: '/teacher', label: t('nav.teacher') }] : [];

  return (
    <header className="sticky top-0 z-30 border-b border-brown-800 bg-brown-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
        <Link to={isTeacher ? '/teacher' : '/'} aria-label="Home">
          <Logo />
        </Link>

        {links.length > 0 && (
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} end>
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {musicAvailable && !isTeacher && (
            <button
              onClick={toggleMusic}
              title={musicOn ? t('audio.off') : t('audio.on')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 text-cream transition-colors hover:bg-white/10"
            >
              {musicOn ? <SpeakerOnIcon className="h-4.5 w-4.5" /> : <SpeakerOffIcon className="h-4.5 w-4.5" />}
            </button>
          )}

          <button
            onClick={() => setLanguage(lang === 'en' ? 'id' : 'en')}
            className="rounded-full border border-cream/30 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-white/10"
            title="Switch language"
          >
            {lang === 'en' ? 'ID' : 'EN'}
          </button>

          <div className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3">
            <Avatar name={user?.name} emoji={user?.name?.charAt(0)?.toUpperCase() || 'G'} bg="#dfc9a8" />
            <span className="hidden max-w-32 truncate text-sm font-semibold text-cream sm:block">
              {user?.name}
            </span>
          </div>

          <button
            onClick={() => {
              stopMusic();
              if (user) {
                localStorage.setItem(
                  'cv_resume',
                  JSON.stringify({ userId: user.id, path: location.pathname })
                );
              }
              sessionStorage.setItem('cv_logging_out', '1');
              logout();
              navigate('/login');
            }}
            className="rounded-full bg-cream px-4 py-1.5 text-sm font-semibold text-brown-900 shadow transition-transform hover:scale-105"
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </header>
  );
}
