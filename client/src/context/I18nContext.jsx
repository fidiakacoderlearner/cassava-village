import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import en from '../i18n/en.json';
import id from '../i18n/id.json';

const dicts = { en, id };
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('cv_lang') || 'en');
  const dict = dicts[lang] || dicts.en;

  const t = useCallback(
    (key, vars) => {
      let str = key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
      if (str == null) str = key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = String(str).split(`{${k}}`).join(v);
        }
      }
      return str;
    },
    [dict]
  );

  const setLanguage = useCallback((l) => {
    if (dicts[l]) {
      localStorage.setItem('cv_lang', l);
      setLang(l);
    }
  }, []);

  const has = useCallback(
    (key) => {
      let o = dict;
      for (const k of key.split('.')) {
        if (o == null || !(k in o)) return false;
        o = o[k];
      }
      return true;
    },
    [dict]
  );

  const value = useMemo(() => ({ lang, setLanguage, t, has }), [lang, setLanguage, t, has]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
