import { useState } from 'react';
import { Header } from '../components/Header';
import { useStore } from '../store';
import { SLOTS } from '../data';
import { haptic } from '../telegram';

const fmtDay = (mmdd: string, lang: 'ru' | 'uz') => {
  const [m, d] = mmdd.split('-').map(Number);
  return new Date(2026, m - 1, d).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { day: 'numeric', month: 'long' });
};

export function Profile() {
  const { user, lang, setLang, t, savedDates, removeSavedDate, waitlist, setWaitlist } = useStore();
  return (
    <>
      <Header title={t('Профиль', 'Profil')} />
      <div className="panel">
        <b style={{ fontSize: 17 }}>{user.name}</b>
        <div className="hint" style={{ marginTop: 2 }}>{user.phone || t('Телефон появится после первого заказа', 'Telefon birinchi buyurtmadan keyin paydo bo‘ladi')}</div>
        <div className="menu-row" style={{ marginTop: 6 }}>
          <span>{t('Язык', 'Til')}</span>
          <div className="lang">
            <button aria-pressed={lang === 'ru'} onClick={() => setLang('ru')}>RU</button>
            <button aria-pressed={lang === 'uz'} onClick={() => setLang('uz')}>UZ</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>{t('Важные даты', 'Muhim sanalar')}</h2>
        {savedDates.length === 0 ? (
          <p className="hint" style={{ marginTop: 0 }}>
            {t('Добавьте дату в открытке к заказу — напомним за 3 дня.', 'Buyurtmadagi otkritkada sanani qo‘shing — 3 kun oldin eslatamiz.')}
          </p>
        ) : (
          savedDates.map((d) => (
            <div className="menu-row" key={d.id}>
              <span>
                {fmtDay(d.day, lang)} · {d.occasion}
                <span className="hint" style={{ display: 'block', margin: 0 }}>{d.who}{d.name ? `, ${d.name}` : ''}</span>
              </span>
              <button className="link" onClick={() => removeSavedDate(d.id)}>{t('Удалить', "O'chirish")}</button>
            </div>
          ))
        )}
        <p className="hint">{t('Напоминание придёт в этот чат за 3 дня и за день до даты, в 10:00.', 'Eslatma shu chatga 3 kun va 1 kun oldin soat 10:00 da keladi.')}</p>
      </div>

      <div className="soon">
        <b>{t('Скоро: цветочная подписка', "Tez orada: gul obunasi")}</b>
        <p>{t('Мини, Классик или Макси — раз в неделю, в две недели или в месяц.', 'Mini, Klassik yoki Maksi — haftada, ikki haftada yoki oyda bir marta.')}</p>
        <button className="btn" disabled={waitlist} onClick={() => { setWaitlist(true); haptic.success(); }}>
          {waitlist ? t('Сообщим о запуске ✓', 'Ishga tushganda xabar beramiz ✓') : t('Сообщить о запуске', 'Ishga tushganda xabar berish')}
        </button>
      </div>

      <div className="panel">
        <h2>{t('О магазине', "Do'kon haqida")}</h2>
        <div className="menu-row"><span>{t('Доставка', 'Yetkazish')}</span><span className="muted">{SLOTS[0].slice(0, 5)}–{SLOTS[SLOTS.length - 1].slice(-5)}</span></div>
        <div className="menu-row"><span>{t('Стоимость доставки', 'Yetkazish narxi')}</span><span className="muted">{t('по тарифу такси', "taksi tarifi bo'yicha")}</span></div>
        <div className="menu-row"><span>{t('Оплата', "To'lov")}</span><span className="muted">Payme, Click</span></div>
        <div className="menu-row"><span>{t('Написать менеджеру', 'Menejerga yozish')}</span><span className="muted">@botanika_support</span></div>
      </div>
      <p className="demo">{t('Прототип Botanika · тестовые данные', 'Botanika prototipi · sinov maʼlumotlari')}</p>
    </>
  );
}

/** Страница, которую получатель открывает по ссылке из SMS (режим «В подарок»). */
export function RecipientLink({ orderId }: { orderId: string }) {
  const { orders, t, lang } = useStore();
  const o = orders.find((x) => x.id === orderId)!;
  const [slot, setSlot] = useState<string | null>(null);
  const [addr, setAddr] = useState('');
  const [done, setDone] = useState(false);
  return (
    <>
      <Header title={t('Вам цветы', 'Sizga gullar')} />
      {done ? (
        <div className="center">
          <div className="big-ok" aria-hidden="true">✓</div>
          <h1>{t('Спасибо!', 'Rahmat!')}</h1>
          <p className="muted">{t('Курьер привезёт цветы в выбранное время.', 'Kuryer gullarni tanlangan vaqtda olib keladi.')}</p>
        </div>
      ) : (
        <>
          <div className="panel">
            <p style={{ marginTop: 0 }}>
              {t('Для вас заказали цветы в Botanika. Подскажите, куда и когда их привезти.', "Siz uchun Botanikadan gul buyurtma qilishdi. Qayerga va qachon olib kelishni ayting.")}
            </p>
            <label className="field">
              <span>{t('Адрес', 'Manzil')}</span>
              <input className="input" value={addr} onChange={(e) => setAddr(e.target.value)} placeholder={t('Улица, дом, ориентир', "Ko'cha, uy, mo'ljal")} />
            </label>
            <div className="slots" style={{ marginTop: 14 }}>
              {SLOTS.map((s) => (
                <button key={s} className="slot" aria-pressed={slot === s} onClick={() => setSlot(s)}>{s}</button>
              ))}
            </div>
            <p className="hint">{t('Дата доставки', 'Yetkazish sanasi')}: {o.date}</p>
          </div>
          <div className="dock no-tabs">
            <div className="dock-in">
              <button className="btn" disabled={!slot || addr.trim().length < 5} onClick={() => setDone(true)}>
                {t('Подтвердить', 'Tasdiqlash')}
              </button>
            </div>
          </div>
          <p className="demo">{lang === 'ru' ? 'Так выглядит страница по ссылке из SMS' : 'SMS havolasidagi sahifa shunday ko‘rinadi'}</p>
        </>
      )}
    </>
  );
}
