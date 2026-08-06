import { useNavigate } from 'react-router';
import { useI18n } from '../context/I18nContext.jsx';

export default function ExitModal({ open, onClose }) {
  const { t } = useI18n();
  const navigate = useNavigate();

  if (!open) return null;

  function leave() {
    onClose();
    navigate('/');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brown-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md animate-pop-in rounded-3xl bg-white p-6 text-center shadow-xl ring-1 ring-brown-200">
        <h2 className="font-display text-xl font-bold text-brown-800">
          {t('exit.title')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brown-600">{t('exit.message')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="rounded-full bg-brown-100 px-6 py-2.5 font-semibold text-brown-800 transition-colors hover:bg-brown-200"
          >
            {t('exit.stay')}
          </button>
          <button
            onClick={leave}
            className="rounded-full bg-brown-800 px-6 py-2.5 font-display font-semibold text-cream shadow transition-transform hover:scale-105"
          >
            {t('exit.leave')}
          </button>
        </div>
      </div>
    </div>
  );
}
