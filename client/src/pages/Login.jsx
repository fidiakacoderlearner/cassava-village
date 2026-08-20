import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useAudio, playBubble } from '../context/AudioContext.jsx';
import LetterTitle from '../components/LetterTitle.jsx';
import { EyeIcon, EyeOffIcon } from '../components/icons.jsx';
import { api } from '../context/api.js';

const loginBg = import.meta.glob('/src/assets/login-bg.{png,jpg,jpeg,svg,webp,gif}', { eager: true });
const bgUrl = Object.values(loginBg)[0]?.default || null;

function mapError(message) {
  return {
    'Network error': 'errors.network',
    'Invalid class code': 'errors.invalidClassCode',
    'Email is already registered': 'errors.emailExists',
    'Incorrect email or password': 'errors.wrongCredentials',
    'Password must be at least 6 characters': 'errors.passwordShort',
    'Name, email and password are required': 'errors.required',
  }[message];
}

export default function Login() {
  const { token, login, signup, updateUser } = useAuth();
  const { t, lang, setLanguage } = useI18n();
  const { startMusic } = useAudio();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needClass, setNeedClass] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('cv_user') || 'null');
      return user?.role === 'student' && !user?.class_id;
    } catch { return false; }
  });
  const [joinCode, setJoinCode] = useState('');

  async function handleJoinClass(e) {
    e.preventDefault();
    if (!joinCode.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/auth/join-class', {
        method: 'POST',
        token,
        body: { classCode: joinCode },
      });
      updateUser(data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message === 'Network error' ? t('errors.network') : t('joinClass.error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password || (mode === 'signup' && (!name.trim() || (role === 'student' && !classCode.trim())))) {
      setError(t('errors.required'));
      return;
    }
    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(email, password);
      } else {
        user = await signup(name, email, password, classCode, role);
      }
      if (user?.role !== 'teacher') startMusic();

      if (user?.role === 'student' && !user?.class_id) {
        setNeedClass(true);
        setLoading(false);
        return;
      }

      let resumePath = '/';
      try {
        const resume = JSON.parse(localStorage.getItem('cv_resume') || 'null');
        if (resume && resume.userId === user.id && resume.path) {
          resumePath = resume.path;
        }
      } catch {
        /* ignore */
      }
      localStorage.removeItem('cv_resume');
      navigate(user?.role === 'teacher' ? '/teacher' : resumePath, { replace: true });
    } catch (err) {
      const key = mapError(err.message);
      setError(key ? t(key) : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-white/40 bg-white/45 px-4 py-3 text-brown-900 placeholder-brown-400 outline-none backdrop-blur transition focus:border-brown-500 focus:ring-2 focus:ring-brown-200';

  return (
    <div className="relative min-h-screen">
      {bgUrl ? (
        <img src={bgUrl} alt="" className="fixed inset-0 h-full w-full object-cover" />
      ) : (
        <div className="fixed inset-0 bg-gradient-to-br from-sand via-peach-light to-peach" />
      )}
      <div className="fixed inset-0 bg-brown-900/15" />

      <header className="absolute left-5 top-1/2 z-30 hidden -translate-y-1/2 md:left-12 lg:block">
        <LetterTitle
          lines={[
            { text: 'Cassava' },
            { text: 'Village', indent: 2 },
          ]}
          sound={playBubble}
          className="text-[90px] text-cream [text-shadow:0_4px_18px_rgba(59,42,26,0.55)] sm:text-[108px] lg:text-[144px]"
        />
      </header>

      <button
        onClick={() => setLanguage(lang === 'en' ? 'id' : 'en')}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/60 bg-white/40 px-3 py-1.5 text-xs font-semibold text-brown-800 backdrop-blur transition-colors hover:bg-white/70"
      >
        {lang === 'en' ? 'ID' : 'EN'}
      </button>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 lg:flex-row lg:items-center lg:justify-end lg:pr-16">
        <div className="mb-8 w-full text-center lg:hidden">
          <LetterTitle
            lines={[
              { text: 'Cassava' },
              { text: 'Village' },
            ]}
            interactive={false}
            className="text-[52px] text-cream [text-shadow:0_4px_18px_rgba(59,42,26,0.55)] sm:text-[60px]"
          />
        </div>
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white/10 p-6 shadow-2xl ring-1 ring-white/30 backdrop-blur-xl md:p-8">
            {needClass ? (
              <>
                <h2 className="font-display text-2xl font-bold text-brown-900">{t('joinClass.title')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-brown-700">{t('joinClass.desc')}</p>

                <form onSubmit={handleJoinClass} className="mt-6 space-y-4">
                  <label className="block">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder={t('joinClass.placeholder')}
                      maxLength={8}
                      autoFocus
                      className={`${inputClass} text-center font-display text-lg uppercase tracking-[0.2em]`}
                    />
                  </label>

                  {error && (
                    <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 ring-1 ring-red-200">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !joinCode.trim()}
                    className="w-full rounded-2xl bg-brown-800 py-3 font-display font-semibold text-cream shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                  >
                    {loading ? '...' : t('joinClass.join')}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-brown-900">
                  {mode === 'login' ? t('login.welcome') : t('login.join')}
                </h2>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {mode === 'signup' && (
                    <>
                      <div>
                        <span className="mb-1.5 block text-sm font-semibold text-brown-800">
                          {t('login.role')}
                        </span>
                        <div className="flex rounded-2xl bg-white/30 p-1 ring-1 ring-white/40">
                          {['student', 'teacher'].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRole(r)}
                              className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
                                role === r ? 'bg-brown-800 text-cream shadow' : 'text-brown-700 hover:bg-white/40'
                              }`}
                            >
                              {r === 'student' ? t('login.roleStudent') : t('login.roleTeacher')}
                            </button>
                          ))}
                        </div>
                        {role === 'teacher' && (
                          <p className="mt-1.5 text-xs font-medium text-brown-600">{t('login.teacherInfo')}</p>
                        )}
                      </div>
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-brown-800">
                          {t('login.name')}
                        </span>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('login.namePlaceholder')}
                          className={inputClass}
                        />
                      </label>
                      {role === 'student' && (
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-semibold text-brown-800">
                            {t('login.classCode')}
                          </span>
                          <input
                            type="text"
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                            placeholder={t('login.classCodePlaceholder')}
                            maxLength={8}
                            className={`${inputClass} font-display uppercase tracking-widest`}
                          />
                        </label>
                      )}
                    </>
                  )}

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-brown-800">
                      {t('login.email')}
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('login.emailPlaceholder')}
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-brown-800">
                      {t('login.password')}
                    </span>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-500 transition-colors hover:text-brown-800"
                      >
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </label>

                  {error && (
                    <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 ring-1 ring-red-200">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-brown-800 py-3 font-display font-semibold text-cream shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                  >
                    {loading ? '...' : mode === 'login' ? t('login.signIn') : t('login.signUp')}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm font-semibold text-brown-800">
                  {mode === 'login' ? (
                    <button onClick={() => { setMode('signup'); setError(''); }} className="underline-offset-2 hover:underline">
                      {t('login.switchToSignup')}
                    </button>
                  ) : (
                    <button onClick={() => { setMode('login'); setError(''); }} className="underline-offset-2 hover:underline">
                      {t('login.switchToLogin')}
                    </button>
                  )}
                </p>
              </>
            )}
          </div>

          {!needClass && (
            <p className="mt-4 rounded-2xl bg-white/10 px-4 py-2.5 text-center text-xs font-medium text-brown-800 backdrop-blur whitespace-pre-line">
              {t('login.demoHint')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
