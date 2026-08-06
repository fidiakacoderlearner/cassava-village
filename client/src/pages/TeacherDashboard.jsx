import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { api } from '../context/api.js';
import Avatar from '../components/Avatar.jsx';
import { BrandText } from '../components/Navbar.jsx';
import {
  ChartIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  LockIcon,
  LogOutIcon,
  TeacherIcon,
} from '../components/icons.jsx';

const TOTAL_EVAL = 7;

const ESSAY_STEP_IDS = [
  'open-gof-machines',
  'open-gof-money',
  'open-fog-money',
  'open-restu-calc',
  'open-rafif-calc',
  'open-difference-explanation',
  'open-conclusion',
];

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brown-200/50">
      <p className="text-sm font-semibold text-brown-500">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function statusOf(s, t) {
  if (s.explorationDone && s.evalDone >= TOTAL_EVAL) return { label: t('teacher.statusDone'), cls: 'bg-green-100 text-green-700' };
  if (s.explorationDone) return { label: t('teacher.statusExplored'), cls: 'bg-sand text-brown-800' };
  return { label: t('teacher.statusNew'), cls: 'bg-brown-100 text-brown-500' };
}

function EssayAnswersPanel({ student, t }) {
  const attempts = student?.attempts || [];
  const [active, setActive] = useState(() => Math.max(0, attempts.length - 1));

  if (attempts.length === 0) {
    return (
      <div className="py-6 text-center text-sm font-semibold text-brown-500">
        {t('teacher.noAttempts')}
      </div>
    );
  }

  const current = attempts[active];
  const essayByStep = {};
  for (const e of current.essays) essayByStep[e.stepId] = e.answer;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {attempts.map((a, i) => (
          <button
            key={a.attemptNo}
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              i === active ? 'bg-brown-800 text-cream' : 'bg-brown-100 text-brown-700 hover:bg-brown-200'
            }`}
          >
            {t('teacher.attempt', { n: a.attemptNo })}
          </button>
        ))}
        <span className="ml-auto text-xs font-medium text-brown-400">
          {t('teacher.submittedAt', { date: current.submittedAt })}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {ESSAY_STEP_IDS.map((stepId, n) => (
          <div key={stepId} className="rounded-2xl border border-brown-100 bg-white/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brown-400">
              {t('teacher.essayN', { n: n + 1 })}
            </p>
            <p className={`mt-1 text-sm leading-relaxed ${essayByStep[stepId] ? 'text-brown-900' : 'italic text-brown-300'}`}>
              {essayByStep[stepId] || t('teacher.noAnswer')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassDropdown({ classes, value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = classes.find((c) => c.id === value) || null;
  const disabled = classes.length === 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="flex min-w-40 max-w-52 items-center justify-between gap-2 rounded-2xl border border-brown-200 bg-white py-2.5 pl-4 pr-2 text-sm font-semibold text-brown-800 outline-none transition focus:border-brown-500 disabled:cursor-not-allowed disabled:text-brown-400"
      >
        <span className="min-w-0 flex-1 truncate">{selected ? selected.name : t('teacher.noClasses')}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-brown-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute right-0 z-30 mt-2 w-full min-w-48 overflow-hidden rounded-2xl bg-white py-1 shadow-xl ring-1 ring-brown-200">
          {classes.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onChange(c.id); setOpen(false); }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                c.id === value ? 'bg-peach/50 text-brown-800' : 'text-brown-700 hover:bg-peach/30'
              }`}
            >
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              {c.id === value && <CheckIcon className="h-4 w-4 shrink-0 text-brown-800" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeacherDashboard() {
  const { token, user, logout } = useAuth();
  const { t, lang, setLanguage } = useI18n();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState(null);
  const [students, setStudents] = useState([]);
  const [essayData, setEssayData] = useState({});
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cv_sidebar_collapsed') === '1';
    } catch {
      return false;
    }
  });
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/api/teacher/classes', { token });
      setClasses(data.classes);
      setClassId((prev) => data.classes.some((c) => c.id === prev) ? prev : (data.classes[0]?.id ?? null));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (!classId) return;
    let alive = true;
    (async () => {
      try {
        const [sData, eData] = await Promise.all([
          api(`/api/teacher/classes/${classId}/students`, { token }),
          api(`/api/teacher/classes/${classId}/essay-answers`, { token }),
        ]);
        if (alive) {
          setStudents(sData.students);
          const map = {};
          for (const s of eData.students) map[s.id] = s;
          setEssayData(map);
          setSearch('');
          setPage(1);
          setViewing(null);
        }
      } catch (err) {
        if (alive) setError(err.message);
      }
    })();
    return () => {
      alive = false;
    };
  }, [classId, token]);

  useEffect(() => {
    setPage(1);
  }, [search, perPage]);

  async function createClass(e) {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const data = await api('/api/teacher/classes', {
        method: 'POST',
        token,
        body: { name: newName },
      });
      setNewName('');
      setShowCreate(false);
      await loadClasses();
      setClassId(data.class.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function copyCode() {
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return;
    try {
      await navigator.clipboard.writeText(cls.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem('cv_sidebar_collapsed', next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  if (user?.role !== 'teacher') {
    return (
      <div className="min-h-full">
        <div className="flex min-h-screen items-center justify-center bg-cream px-4">
          <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-brown-200/60">
            <LockIcon className="mx-auto h-14 w-14 text-brown-300" />
            <h1 className="mt-4 font-display text-2xl font-bold text-brown-800">{t('teacher.onlyTitle')}</h1>
            <p className="mt-2 text-brown-600">{t('teacher.onlyDesc')}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 rounded-full bg-brown-800 px-6 py-2.5 font-semibold text-cream shadow"
            >
              {t('home.start')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selected = classes.find((c) => c.id === classId) || null;
  const totalStudents = students.length;
  const countNew = students.filter((s) => !s.explorationDone).length;
  const countExplored = students.filter((s) => s.explorationDone && s.evalDone < TOTAL_EVAL).length;
  const countDone = students.filter((s) => s.explorationDone && s.evalDone >= TOTAL_EVAL).length;

  const q = search.trim().toLowerCase();
  const filtered = q
    ? students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
    : students;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1;
  const to = Math.min(safePage * perPage, filtered.length);
  const paged = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const sideBtn =
    'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-cream/80 transition-colors hover:bg-white/10 hover:text-cream';

  return (
    <div className="flex min-h-screen flex-col bg-cream lg:flex-row">
      <aside className={`relative flex shrink-0 flex-col bg-brown-900 text-cream transition-[width] duration-300 lg:sticky lg:top-0 lg:h-screen ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}>
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
          onClick={toggleCollapsed}
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
            <Avatar name={user?.name} emoji={user?.name?.charAt(0)?.toUpperCase() || 'S'} bg="#8a5a30" size="sm" />
            {!collapsed && (
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-cream">{user?.name}</span>
            )}
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={`${sideBtn} ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <LogOutIcon className="h-4.5 w-4.5 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-brown-800">{t('teacher.title')}</h1>
            <p className="mt-1 text-sm text-brown-600">{t('teacher.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ClassDropdown classes={classes} value={classId} onChange={setClassId} t={t} />
            <button
              onClick={() => setLanguage(lang === 'en' ? 'id' : 'en')}
              className="rounded-2xl border border-brown-200 bg-white px-4 py-2.5 text-xs font-bold text-brown-800 shadow-sm transition-colors hover:bg-peach/40"
            >
              {lang === 'en' ? 'ID' : 'EN'}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-2xl bg-brown-800 px-5 py-2.5 text-sm font-semibold text-cream shadow transition-transform hover:scale-105"
            >
              + {t('teacher.createClass')}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brown-200 border-t-brown-800" />
          </div>
        )}

        {!loading && classes.length === 0 && (
          <div className="rounded-3xl bg-white p-14 text-center shadow-sm ring-1 ring-brown-200/60">
            <ClipboardIcon className="mx-auto h-12 w-12 text-brown-300" />
            <h2 className="mt-4 font-display text-xl font-bold text-brown-800">{t('teacher.noClassesTitle')}</h2>
            <p className="mx-auto mt-2 max-w-md text-brown-600">{t('teacher.noClasses')}</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-6 rounded-full bg-brown-800 px-6 py-2.5 font-semibold text-cream shadow"
            >
              + {t('teacher.createClass')}
            </button>
          </div>
        )}

        {!loading && selected && (
          <>
            <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-brown-800 to-brown-700 px-5 py-4 text-cream shadow">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cream/60">
                  {t('teacher.code')}
                </p>
                <p className="font-display text-2xl font-bold tracking-[0.3em]">{selected.code}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-cream/70">{selected.student_count} {t('teacher.students')}</span>
                <button
                  onClick={copyCode}
                  className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-white/25"
                >
                  {copied ? `✓ ${t('teacher.copied')}` : t('teacher.copy')}
                </button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label={t('teacher.totalStudents')} value={totalStudents} accent="text-brown-800" />
              <StatCard label={t('teacher.statusNew')} value={countNew} accent="text-brown-600" />
              <StatCard label={t('teacher.statusExplored')} value={countExplored} accent="text-amber-600" />
              <StatCard label={t('teacher.statusDone')} value={countDone} accent="text-green-600" />
            </div>

            {students.length === 0 ? (
              <div className="rounded-3xl bg-white p-14 text-center shadow-sm ring-1 ring-brown-200/60">
                <TeacherIcon className="mx-auto h-12 w-12 text-brown-300" />
                <p className="mt-4 text-brown-600">{t('teacher.empty')}</p>
                <p className="mt-1 text-sm font-semibold text-brown-500">
                  {t('teacher.code')}: <span className="tracking-widest">{selected.code}</span>
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-brown-600">
                    <span>{t('teacher.perPage')}</span>
                    <select
                      value={perPage}
                      onChange={(e) => setPerPage(Number(e.target.value))}
                      className="rounded-xl border border-brown-200 bg-white px-3 py-2 text-sm font-semibold text-brown-800 outline-none transition focus:border-brown-500"
                    >
                      {[5, 10, 15].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('teacher.searchPlaceholder')}
                    className="w-full max-w-xs rounded-2xl border border-brown-200 bg-white px-4 py-2.5 text-sm text-brown-800 placeholder-brown-400 outline-none transition focus:border-brown-500"
                  />
                </div>
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-brown-200/60">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-brown-200 bg-cream font-display text-xs uppercase tracking-wider text-brown-600">
                          <th className="px-5 py-3.5">#</th>
                          <th className="px-5 py-3.5">{t('teacher.student')}</th>
                          <th className="px-5 py-3.5">{t('teacher.email')}</th>
                          <th className="px-5 py-3.5 text-center">{t('teacher.explorationCount')}</th>
                          <th className="px-5 py-3.5 text-center">{t('teacher.evaluationCount')}</th>
                          <th className="px-5 py-3.5 text-center">{t('teacher.status')}</th>
                          <th className="px-5 py-3.5 text-center">{t('teacher.viewAnswers')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paged.map((s) => {
                          const st = statusOf(s, t);
                          return (
                            <tr key={s.id} className="border-b border-brown-100 transition-colors hover:bg-brown-50">
                              <td className="px-5 py-3 text-brown-400">{paged.indexOf(s) + 1 + (safePage - 1) * perPage}</td>
                              <td className="px-5 py-3 font-semibold text-brown-800">{s.name}</td>
                              <td className="px-5 py-3 text-brown-600">{s.email}</td>
                              <td className="px-5 py-3 text-center font-bold text-brown-700">{s.explorationCount}</td>
                              <td className="px-5 py-3 text-center font-bold text-brown-700">{s.evalDone}</td>
                              <td className="px-5 py-3 text-center">
                                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>
                                  {st.label}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <button
                                  onClick={() => setViewing(s)}
                                  className="rounded-full bg-peach/70 px-4 py-1.5 text-xs font-bold text-brown-800 transition-colors hover:bg-peach"
                                >
                                  {t('teacher.viewAnswers')}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {paged.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-5 py-10 text-center text-sm font-semibold text-brown-400">
                              {t('teacher.noStudentsMatch')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-brown-600">
                    {t('teacher.showing', { from, to, total: filtered.length })}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="flex items-center gap-1 rounded-xl border border-brown-200 bg-white px-3 py-1.5 text-sm font-semibold text-brown-700 transition-colors hover:bg-peach/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeftIcon className="h-3.5 w-3.5" /> {t('teacher.prev')}
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                      disabled={safePage >= pageCount}
                      className="flex items-center gap-1 rounded-xl border border-brown-200 bg-white px-3 py-1.5 text-sm font-semibold text-brown-700 transition-colors hover:bg-peach/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t('teacher.next')} <ChevronRightIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brown-900/40 px-4"
          onClick={() => setViewing(null)}
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-brown-800">{viewing.name}</h2>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-brown-500">
                  {t('teacher.essayAnswers')}
                </p>
              </div>
              <button
                onClick={() => setViewing(null)}
                className="rounded-full bg-brown-100 px-4 py-2 text-sm font-semibold text-brown-700 transition-colors hover:bg-brown-200"
              >
                {t('teacher.close')}
              </button>
            </div>
            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
              <EssayAnswersPanel student={essayData[viewing.id]} t={t} />
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-900/40 px-4">
          <form
            onSubmit={createClass}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h2 className="font-display text-lg font-bold text-brown-800">{t('teacher.createClassTitle')}</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('teacher.classNamePlaceholder')}
              className="mt-4 w-full rounded-2xl border border-brown-200 bg-white px-4 py-3 text-brown-900 placeholder-brown-300 outline-none transition focus:border-brown-500 focus:ring-2 focus:ring-brown-200"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-full bg-brown-100 px-5 py-2.5 text-sm font-semibold text-brown-700 transition-colors hover:bg-brown-200"
              >
                {t('teacher.cancel')}
              </button>
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="rounded-full bg-brown-800 px-5 py-2.5 text-sm font-semibold text-cream shadow disabled:opacity-50"
              >
                {creating ? '...' : t('teacher.create')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
