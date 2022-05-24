export const LAST_LANGUAGE_LOCAL_STORAGE_KEY = 'bridge/last-language';

export const getLastLanguage = () => localStorage.getItem(LAST_LANGUAGE_LOCAL_STORAGE_KEY);

export const timeFormatter = new Intl.DateTimeFormat(getLastLanguage() || undefined, {
  hour: 'numeric',
  minute: 'numeric',
});
