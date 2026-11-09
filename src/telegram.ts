// Тонкая обёртка над Telegram WebApp. Вне Telegram (в браузере) всё работает без него.

type TgWebApp = {
  ready: () => void;
  expand: () => void;
  initDataUnsafe?: { user?: { first_name?: string; last_name?: string; language_code?: string } };
  HapticFeedback?: {
    impactOccurred: (s: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (t: 'success' | 'error' | 'warning') => void;
    selectionChanged: () => void;
  };
  BackButton?: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
  requestContact?: (cb: (ok: boolean, res?: { responseUnsafe?: { contact?: { phone_number?: string } } }) => void) => void;
  openLink?: (url: string) => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
};

export const tg: TgWebApp | undefined = (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
export const inTelegram = !!tg && !!tg.initDataUnsafe?.user;

export function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  tg.setHeaderColor?.('#F6F7F3');
  tg.setBackgroundColor?.('#F6F7F3');
}

export const haptic = {
  tap: () => tg?.HapticFeedback?.impactOccurred('light'),
  select: () => tg?.HapticFeedback?.selectionChanged(),
  success: () => tg?.HapticFeedback?.notificationOccurred('success'),
  error: () => tg?.HapticFeedback?.notificationOccurred('error'),
};

export const tgUser = () => tg?.initDataUnsafe?.user;

/** Номер телефона из Telegram одной кнопкой; в браузере — тестовый номер. */
export function requestPhone(): Promise<string | null> {
  return new Promise((resolve) => {
    if (tg?.requestContact && inTelegram) {
      tg.requestContact((ok, res) => resolve(ok ? res?.responseUnsafe?.contact?.phone_number ?? null : null));
    } else {
      resolve('+998 90 123-45-67');
    }
  });
}
