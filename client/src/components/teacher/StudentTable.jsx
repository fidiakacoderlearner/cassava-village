import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from '../icons.jsx';

export default function StudentTable({
  students,
  page,
  perPage,
  pageCount,
  filteredLength,
  from,
  to,
  onPageChange,
  onViewAnswers,
  onKickStudent,
  t,
}) {
  const paged = students.slice((page - 1) * perPage, page * perPage);
  const safePage = Math.min(page, pageCount);

  return (
    <>
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
              {paged.map((s, idx) => {
                const evalDone = (s.evalCount ?? 0) >= 1;
                let status;
                if (s.explorationDone && evalDone) status = { label: t('teacher.statusDone'), cls: 'bg-green-100 text-green-700' };
                else if (s.explorationDone || evalDone) status = { label: t('teacher.statusOngoing'), cls: 'bg-sand text-brown-800' };
                else status = { label: t('teacher.statusNew'), cls: 'bg-brown-100 text-brown-500' };

                return (
                  <tr key={s.id} className="border-b border-brown-100 transition-colors hover:bg-brown-50">
                    <td className="px-5 py-3 text-brown-400">{idx + 1 + (safePage - 1) * perPage}</td>
                    <td className="px-5 py-3 font-semibold text-brown-800">{s.name}</td>
                    <td className="px-5 py-3 text-brown-600">{s.email}</td>
                    <td className="px-5 py-3 text-center font-bold text-brown-700">{s.explorationCount}</td>
                    <td className="px-5 py-3 text-center font-bold text-brown-700">{s.evalCount ?? 0}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewAnswers(s)}
                          className="rounded-full bg-peach/70 px-4 py-1.5 text-xs font-bold text-brown-800 transition-colors hover:bg-peach"
                        >
                          {t('teacher.viewAnswers')}
                        </button>
                        <button
                          onClick={() => onKickStudent(s)}
                          className="flex items-center justify-center rounded-full border border-red-200 bg-white p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          title={t('teacher.kickStudent')}
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
          {t('teacher.showing', { from, to, total: filteredLength })}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage <= 1}
            className="flex items-center gap-1 rounded-xl border border-brown-200 bg-white px-3 py-1.5 text-sm font-semibold text-brown-700 transition-colors hover:bg-peach/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" /> {t('teacher.prev')}
          </button>
          <button
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= pageCount}
            className="flex items-center gap-1 rounded-xl border border-brown-200 bg-white px-3 py-1.5 text-sm font-semibold text-brown-700 transition-colors hover:bg-peach/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('teacher.next')} <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}