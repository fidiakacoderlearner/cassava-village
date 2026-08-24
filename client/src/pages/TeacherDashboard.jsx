import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { api } from '../context/api.js';
import { EVALUATION } from '../data/evaluation.js';
import { DRAG_CARDS, DRAG_BEST, formatRupiah, EVAL_STEP_IDS, OPEN_STEP_IDS } from '../data/drag.js';
import MathText from '../components/MathText.jsx';
import Sidebar from '../components/teacher/Sidebar.jsx';
import StatCard from '../components/teacher/StatCard.jsx';
import ClassDropdown from '../components/teacher/ClassDropdown.jsx';
import ConfirmationModal from '../components/teacher/ConfirmationModal.jsx';
import EssayAnswersPanel from '../components/teacher/EssayAnswersPanel.jsx';
import EvaluationAnswersPanel from '../components/teacher/EvaluationAnswersPanel.jsx';
import StudentTable from '../components/teacher/StudentTable.jsx';

const TOTAL_EVAL = EVALUATION.length;

function statusOf(s, t) {
  const evalDone = (s.evalCount ?? 0) >= 1;
  if (s.explorationDone && evalDone) return { label: t('teacher.statusDone'), cls: 'bg-green-100 text-green-700' };
  if (s.explorationDone || evalDone) return { label: t('teacher.statusOngoing'), cls: 'bg-sand text-brown-800' };
  return { label: t('teacher.statusNew'), cls: 'bg-brown-100 text-brown-500' };
}

export default function TeacherDashboard() {
  const { token, user, logout, api } = useAuth();
  const { t, lang, setLanguage } = useI18n();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState(() => {
    try {
      const saved = localStorage.getItem(`cv_last_class_${user?.id}`);
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });
  const [students, setStudents] = useState([]);
  const [essayData, setEssayData] = useState({});
  const [evaluationData, setEvaluationData] = useState({});
  const [viewing, setViewing] = useState(null);
  const [activeTab, setActiveTab] = useState('essay');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showKick, setShowKick] = useState(null);
  const [kicking, setKicking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cv_sidebar_collapsed') === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/api/teacher/classes');
      setClasses(data.classes);
      setClassId((prev) => {
        if (prev && data.classes.some((c) => c.id === prev)) {
          return prev;
        }
        return data.classes[0]?.id ?? null;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (classId && user?.id) {
      localStorage.setItem(`cv_last_class_${user.id}`, String(classId));
    }
  }, [classId, user?.id]);

  useEffect(() => {
    if (!classId) return;
    let alive = true;
    (async () => {
      try {
        const data = await api(`/api/teacher/classes/${classId}/summary`);
        if (alive) {
          setStudents(data.students);
          const essayMap = {};
          for (const s of data.essays) essayMap[s.id] = s;
          setEssayData(essayMap);
          const evalMap = {};
          for (const s of data.evaluations) evalMap[s.id] = s;
          setEvaluationData(evalMap);
          setClasses((prev) => {
            const merged = prev.map((c) => (c.id === classId ? { ...c, student_count: data.class.student_count } : c));
            return prev.some((c) => c.id === classId) ? merged : prev;
          });
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
  }, [classId, api]);

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

  async function deleteClass() {
    if (!selected || deleting) return;
    setDeleting(true);
    try {
      await api(`/api/teacher/classes/${selected.id}`, { method: 'DELETE' });
      setShowDelete(false);
      if (selected.id === classId) {
        localStorage.removeItem(`cv_last_class_${user?.id}`);
      }
      await loadClasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  async function kickStudent() {
    if (!showKick || kicking || !classId) return;
    setKicking(true);
    try {
      await api(`/api/teacher/classes/${classId}/students/${showKick.id}`, { method: 'DELETE' });
      setShowKick(null);
      const data = await api(`/api/teacher/classes/${classId}/summary`);
      setStudents(data.students);
      const essayMap = {};
      for (const s of data.essays) essayMap[s.id] = s;
      setEssayData(essayMap);
      const evalMap = {};
      for (const s of data.evaluations) evalMap[s.id] = s;
      setEvaluationData(evalMap);
      setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, student_count: data.class.student_count } : c)));
      setViewing(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setKicking(false);
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
            <div className="mx-auto h-14 w-14 rounded-full bg-brown-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-brown-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
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
  const evalDone = (s) => (s.evalCount ?? 0) >= 1;
  const countNew = students.filter((s) => !s.explorationDone && !evalDone(s)).length;
  const countOngoing = students.filter((s) => (s.explorationDone || evalDone(s)) && !(s.explorationDone && evalDone(s))).length;
  const countDone = students.filter((s) => s.explorationDone && evalDone(s)).length;

  const q = search.trim().toLowerCase();
  const filtered = q
    ? students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
    : students;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1;
  const to = Math.min(safePage * perPage, filtered.length);

  return (
    <div className="relative flex min-h-screen flex-col bg-cream lg:flex-row">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        t={t}
      />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-brown-800">{t('teacher.title')}</h1>
            <p className="mt-1 text-sm text-brown-600">{t('teacher.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brown-800 text-cream shadow lg:hidden"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <ClassDropdown classes={classes} value={classId} onChange={setClassId} t={t} />
            {selected && (
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center justify-center rounded-2xl border border-red-200 bg-white p-2.5 text-red-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
                title={t('teacher.deleteClass')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
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
            <svg className="mx-auto h-12 w-12 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
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
                  {copied ? `✓ {t('teacher.copied')}` : t('teacher.copy')}
                </button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label={t('teacher.totalStudents')} value={totalStudents} accent="text-brown-800" />
              <StatCard label={t('teacher.statusNew')} value={countNew} accent="text-brown-600" />
              <StatCard label={t('teacher.statusOngoing')} value={countOngoing} accent="text-amber-600" />
              <StatCard label={t('teacher.statusDone')} value={countDone} accent="text-green-600" />
            </div>

            {students.length === 0 ? (
              <div className="rounded-3xl bg-white p-14 text-center shadow-sm ring-1 ring-brown-200/60">
                <svg className="mx-auto h-12 w-12 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0v6v1h2v-1a4 4 0 002-2V9a4 4 0 00-2-2h-2a4 4 0 00-2 2v4a4 4 0 012 2z" />
                </svg>
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
                <StudentTable
                  students={filtered}
                  page={page}
                  perPage={perPage}
                  pageCount={pageCount}
                  filteredLength={filtered.length}
                  from={from}
                  to={to}
                  onPageChange={setPage}
                  onViewAnswers={(s) => { setActiveTab('essay'); setViewing(s); }}
                  onKickStudent={setShowKick}
                  t={t}
                />
              </>
            )}
          </>
        )}

        {viewing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-brown-900/40 px-4"
            onClick={() => { setViewing(null); setActiveTab('essay'); }}
          >
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-brown-800">{viewing.name}</h2>
                </div>
                <button
                  onClick={() => { setViewing(null); setActiveTab('essay'); }}
                  className="rounded-full bg-brown-100 px-4 py-2 text-sm font-semibold text-brown-700 transition-colors hover:bg-brown-200"
                >
                  {t('teacher.close')}
                </button>
              </div>

              <div className="mt-4 border-b border-brown-200">
                <nav className="flex gap-4" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('essay')}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                      activeTab === 'essay' ? 'text-brown-800 border-brown-800' : 'text-brown-400 border-transparent hover:text-brown-600'
                    }`}
                  >
                    {t('teacher.explorationAnswers')}
                  </button>
                  <button
                    onClick={() => setActiveTab('eval')}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                      activeTab === 'eval' ? 'text-brown-800 border-brown-800' : 'text-brown-400 border-transparent hover:text-brown-600'
                    }`}
                  >
                    {t('teacher.evalTab')}
                  </button>
                </nav>
              </div>

              <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
                {activeTab === 'essay' ? (
                  <EssayAnswersPanel student={essayData[viewing.id]} t={t} />
                ) : (
                  <EvaluationAnswersPanel student={evaluationData[viewing.id]} t={t} />
                )}
              </div>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onConfirm={createClass}
          title={t('teacher.createClassTitle')}
          message={t('teacher.createClassDesc')}
          confirmText={t('teacher.create')}
          cancelText={t('teacher.cancel')}
          variant="primary"
          confirmLoading={creating}
          confirmDisabled={!newName.trim()}
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('teacher.classNamePlaceholder')}
            className="mt-4 w-full rounded-2xl border border-brown-200 bg-white px-4 py-3 text-brown-900 placeholder-brown-300 outline-none transition focus:border-brown-500 focus:ring-2 focus:ring-brown-200"
          />
        </ConfirmationModal>

        <ConfirmationModal
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={deleteClass}
          title={t('teacher.deleteClassTitle')}
          message={t('teacher.deleteClassDesc', { name: selected?.name })}
          confirmText={t('teacher.deleteClassConfirm')}
          cancelText={t('teacher.cancel')}
          variant="danger"
          confirmLoading={deleting}
          warningMessage={selected?.student_count > 0 ? t('teacher.deleteClassWarning', { n: selected.student_count }) : null}
        />

        <ConfirmationModal
          isOpen={!!showKick}
          onClose={() => setShowKick(null)}
          onConfirm={kickStudent}
          title={t('teacher.kickStudentTitle')}
          message={t('teacher.kickStudentDesc', { name: showKick?.name })}
          confirmText={t('teacher.kickStudentConfirm')}
          cancelText={t('teacher.cancel')}
          variant="danger"
          confirmLoading={kicking}
        />
      </main>
    </div>
  );
}