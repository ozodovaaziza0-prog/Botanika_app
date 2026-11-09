import { useMemo, useRef, useState } from 'react';
import { addons, addressSuggestions, HOLIDAYS, products, SLOTS, taxi } from '../data';
import { Header } from '../components/Header';
import { CardEditor } from '../components/CardEditor';
import { cardOccasions, PERSONAL_OCCASIONS, recipients } from '../cardAssistant';
import { unitPrice, useStore } from '../store';
import { money, pick } from '../i18n';
import { haptic, requestPhone } from '../telegram';
import { PROMO_CODES } from './Cart';

const STD_DELIVERY = 35000; // стандартная сумма, когда адрес уточняет получатель
const SHOP_ADDRESS = 'адрес магазина Botanika (уточнить)';

const md = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const roundUp = (n: number) => Math.ceil(n / 1000) * 1000;

export function taxiPrice(km: number, holiday: boolean) {
  const p = Math.max(taxi.min, taxi.base + taxi.perKm * km);
  return roundUp(holiday ? p * 1.3 : p);
}

export function Checkout() {
  const { lang, t, cart, itemsTotal, promo, card, user, setUser, placeOrder, go, addSavedDate, clearCart } = useStore();
  const [gift, setGift] = useState(true);
  const [rName, setRName] = useState('');
  const [rPhone, setRPhone] = useState('');
  const [askAddress, setAskAddress] = useState(false);
  const [askTime, setAskTime] = useState(false);
  const [pickup, setPickup] = useState(false);
  const [addrQ, setAddrQ] = useState('');
  const [addr, setAddr] = useState<(typeof addressSuggestions)[number] | null>(null);
  const [flat, setFlat] = useState({ entrance: '', floor: '', apt: '' });
  const [landmark, setLandmark] = useState('');
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [pay, setPay] = useState<'payme' | 'click' | 'cash'>('payme');
  const [offer, setOffer] = useState(true);
  const [tried, setTried] = useState(false);
  const refs = { recipient: useRef<HTMLDivElement>(null), address: useRef<HTMLDivElement>(null), time: useRef<HTMLDivElement>(null), contacts: useRef<HTMLDivElement>(null) };

  const now = new Date();
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        return { d, holiday: HOLIDAYS.includes(md(d)) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const day = days[dayIdx];
  const readyHour = now.getHours() + now.getMinutes() / 60 + 2;
  const slotState = (s: string) => {
    const start = parseInt(s.slice(0, 2), 10);
    if (dayIdx === 0 && start < readyHour) return 'past';
    if (dayIdx === 1 && s === '17:00–19:00') return 'full'; // пример заполненного интервала
    return 'free';
  };
  const todayClosed = SLOTS.every((s) => parseInt(s.slice(0, 2), 10) < readyHour);

  const suggested = cardOccasions.find((o) => o.md === md(day.d))?.id ?? null;
  const occasion = card.occasion || suggested || '';

  const sugg = addrQ.trim().length >= 2 && !addr
    ? addressSuggestions.filter((a) => (a.title + a.area).toLowerCase().includes(addrQ.trim().toLowerCase())).concat(
        addressSuggestions.filter((a) => !(a.title + a.area).toLowerCase().includes(addrQ.trim().toLowerCase())).slice(0, 2),
      ).slice(0, 4)
    : [];

  const delivery = pickup ? 0 : gift && askAddress ? STD_DELIVERY : addr ? taxiPrice(addr.km, day.holiday) : null;
  const discount = promo ? Math.round(itemsTotal * (PROMO_CODES[promo] ?? 0)) : 0;
  const total = itemsTotal - discount + (delivery ?? 0);

  const phoneOk = (p: string) => p.replace(/\D/g, '').length >= 9;
  const missing: { key: keyof typeof refs; label: string } | null = (() => {
    if (gift && (!rName.trim() || !phoneOk(rPhone))) return { key: 'recipient', label: t('Укажите получателя', 'Qabul qiluvchini kiriting') };
    if (!pickup && !(gift && askAddress) && !addr) return { key: 'address', label: t('Укажите адрес', 'Manzilni kiriting') };
    if (!(gift && askTime) && !slot) return { key: 'time', label: t('Выберите время', 'Vaqtni tanlang') };
    if (!phoneOk(user.phone)) return { key: 'contacts', label: t('Укажите ваш телефон', 'Telefoningizni kiriting') };
    return null;
  })();

  const submit = () => {
    if (missing) {
      setTried(true);
      haptic.error();
      refs[missing.key].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const lines = cart.map((l) => {
      const p = l.productId ? products.find((x) => x.id === l.productId) : null;
      const a = l.addonId ? addons.find((x) => x.id === l.addonId) : null;
      const v = p?.variants.find((x) => x.id === l.variantId);
      return { title: p ? `${pick(lang, p.name)}, ${pick(lang, v!.label)}` : pick(lang, a!.name), qty: l.qty, price: unitPrice(l) };
    });
    const dateLabel = day.d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { day: 'numeric', month: 'long' });
    const order = placeOrder({
      lines,
      cartLines: cart,
      itemsTotal,
      delivery: delivery ?? 0,
      discount,
      total,
      date: dateLabel,
      slot: gift && askTime ? t('время выберет получатель', 'vaqtni qabul qiluvchi tanlaydi') : slot!,
      address: pickup ? SHOP_ADDRESS : gift && askAddress ? t('адрес уточнит получатель', 'manzilni qabul qiluvchi aniqlaydi') : `${addr!.title}${flat.apt ? `, кв. ${flat.apt}` : ''}`,
      recipient: gift ? `${rName}, ${rPhone}` : `${user.name}, ${user.phone}`,
      gift,
      askRecipient: gift && (askAddress || askTime),
      card: card.text,
      payment: pay,
    });
    if (card.saveDate && PERSONAL_OCCASIONS.includes(occasion) && card.text) {
      const r = recipients.find((x) => x.id === card.to);
      addSavedDate({
        who: r ? r[lang] : t('Получателю', 'Qabul qiluvchiga'),
        name: card.name || rName,
        occasion: cardOccasions.find((o) => o.id === occasion)![lang],
        day: md(day.d),
      });
    }
    clearCart();
    go(pay === 'cash' ? { name: 'success', orderId: order.id } : { name: 'pay', orderId: order.id });
  };

  const bad = (cond: boolean) => (tried && cond ? ' bad' : '');
  const weekday = (d: Date, i: number) =>
    i === 0 ? t('Сег', 'Bugun') : i === 1 ? t('Завт', 'Ertaga') : d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { weekday: 'short' });

  return (
    <>
      <Header title={t('Оформление', 'Rasmiylashtirish')} />

      <div className="panel" ref={refs.recipient}>
        <h2>{t('Кому', 'Kimga')}</h2>
        <div className="toggle" role="group">
          <button aria-pressed={!gift} onClick={() => setGift(false)}>{t('Себе', "O'zimga")}</button>
          <button aria-pressed={gift} onClick={() => setGift(true)}>{t('В подарок', "Sovg'a")}</button>
        </div>
        {gift && (
          <>
            <label className="field">
              <span>{t('Имя получателя', 'Qabul qiluvchi ismi')}</span>
              <input className={`input${bad(!rName.trim())}`} value={rName} onChange={(e) => setRName(e.target.value)} autoComplete="off" />
            </label>
            <label className="field">
              <span>{t('Телефон получателя', 'Qabul qiluvchi telefoni')}</span>
              <input className={`input${bad(!phoneOk(rPhone))}`} value={rPhone} onChange={(e) => setRPhone(e.target.value)} inputMode="tel" placeholder="+998 __ ___-__-__" />
            </label>
            <div className="info">
              {askAddress || askTime
                ? t(
                    'После оплаты отправим получателю SMS со ссылкой: он сам выберет адрес и время. Не ответит — позвоним.',
                    "To'lovdan keyin qabul qiluvchiga havola bilan SMS yuboramiz: manzil va vaqtni o'zi tanlaydi. Javob bermasa — qo'ng'iroq qilamiz.",
                  )
                : t('Сюрприз: получатель узнает о букете, только когда приедет курьер.', "Syurpriz: qabul qiluvchi guldasta haqida faqat kuryer kelganda biladi.")}
            </div>
          </>
        )}
      </div>

      <div className="panel" ref={refs.address}>
        <h2>{t('Куда', 'Qayerga')}</h2>
        <div className="toggle" role="group">
          <button aria-pressed={!pickup} onClick={() => setPickup(false)}>{t('Доставка', 'Yetkazish')}</button>
          <button aria-pressed={pickup} onClick={() => setPickup(true)}>{t('Самовывоз · 0 сум', "Olib ketish · 0 so'm")}</button>
        </div>
        {pickup ? (
          <p className="hint">{t('Заберите букет в магазине:', "Guldastani do'kondan oling:")} {SHOP_ADDRESS}</p>
        ) : gift && askAddress ? (
          <>
            <div className="info">
              {t(
                `Адрес уточнит получатель. Сейчас оплачиваете стандартную доставку ${money(STD_DELIVERY, lang)} — если адрес окажется дальше, пришлём ссылку на доплату.`,
                `Manzilni qabul qiluvchi aniqlaydi. Hozir standart yetkazish ${money(STD_DELIVERY, lang)} — manzil uzoqroq bo'lsa, qo'shimcha to'lov havolasini yuboramiz.`,
              )}
            </div>
            <button className="link" style={{ marginTop: 10 }} onClick={() => setAskAddress(false)}>{t('Я знаю адрес', 'Manzilni bilaman')}</button>
          </>
        ) : (
          <>
            {!addr ? (
              <label className="field">
                <span>{t('Улица и дом', "Ko'cha va uy")}</span>
                <input className={`input${bad(true)}`} value={addrQ} onChange={(e) => setAddrQ(e.target.value)} placeholder={t('Начните вводить адрес', 'Manzilni yozishni boshlang')} autoComplete="off" />
              </label>
            ) : (
              <div className="field">
                <span>{t('Адрес', 'Manzil')}</span>
                <div className="row-gap" style={{ alignItems: 'center' }}>
                  <b style={{ flex: 1 }}>{addr.title}<span className="muted" style={{ fontWeight: 400 }}>, {addr.area}</span></b>
                  <button className="link" onClick={() => { setAddr(null); setAddrQ(''); }}>{t('Изменить', "O'zgartirish")}</button>
                </div>
              </div>
            )}
            {sugg.length > 0 && (
              <div className="suggest">
                {sugg.map((s) => (
                  <button key={s.title} onClick={() => { setAddr(s); haptic.select(); }}>
                    {s.title}
                    <small>{s.area}, Ташкент</small>
                  </button>
                ))}
              </div>
            )}
            {addr && (
              <>
                <div className="map" aria-label={t('Точка на карте', 'Xaritadagi nuqta')}>
                  <svg viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 40 L400 70 M0 110 L400 90 M120 0 L150 140 M280 0 L250 140" stroke="#fff" strokeWidth="10" />
                    <path d="M0 40 L400 70 M0 110 L400 90 M120 0 L150 140 M280 0 L250 140" stroke="#d6dfd3" strokeWidth="1" />
                    <rect x="300" y="10" width="70" height="40" rx="6" fill="#cfe0c8" />
                  </svg>
                  <span className="pin" />
                </div>
                <span className="zone">
                  {addr.km.toLocaleString('ru-RU')} {t('км от магазина · такси', "km do'kondan · taksi")} {money(delivery!, lang)}
                </span>
                <div className="cols" style={{ marginTop: 10 }}>
                  <input className="input" placeholder={t('Подъезд', "Yo'lak")} value={flat.entrance} onChange={(e) => setFlat({ ...flat, entrance: e.target.value })} />
                  <input className="input" placeholder={t('Этаж', 'Qavat')} value={flat.floor} onChange={(e) => setFlat({ ...flat, floor: e.target.value })} />
                  <input className="input" placeholder={t('Кв./офис', 'Xonadon')} value={flat.apt} onChange={(e) => setFlat({ ...flat, apt: e.target.value })} />
                </div>
                <label className="field">
                  <span>{t('Ориентир', "Mo'ljal")}</span>
                  <input className="input" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder={t('Например: напротив школы №110', 'Masalan: 110-maktab qarshisida')} />
                </label>
              </>
            )}
            {gift && (
              <button className="link" style={{ marginTop: 12 }} onClick={() => setAskAddress(true)}>
                {t('Не знаю адрес — спросите у получателя', 'Manzilni bilmayman — qabul qiluvchidan so‘rang')}
              </button>
            )}
          </>
        )}
      </div>

      <div className="panel" ref={refs.time}>
        <h2>{t('Когда', 'Qachon')}</h2>
        {gift && askTime ? (
          <>
            <div className="info">{t(`Получатель выберет время ${day.d.getDate()}-го числа или позже.`, `Qabul qiluvchi vaqtni o'zi tanlaydi.`)}</div>
            <button className="link" style={{ marginTop: 10 }} onClick={() => setAskTime(false)}>{t('Я знаю время', 'Vaqtni bilaman')}</button>
          </>
        ) : (
          <>
            <div className="days" role="group">
              {days.map((x, i) => (
                <button
                  key={i}
                  className={`day${x.holiday ? ' hol' : ''}`}
                  aria-pressed={i === dayIdx}
                  disabled={i === 0 && todayClosed}
                  onClick={() => { setDayIdx(i); setSlot(null); }}
                >
                  {weekday(x.d, i)}
                  <b>{x.d.getDate()}</b>
                </button>
              ))}
            </div>
            <div className="slots">
              {SLOTS.map((s) => {
                const st = slotState(s);
                return (
                  <button key={s} className="slot" disabled={st !== 'free'} aria-pressed={slot === s} onClick={() => { setSlot(s); haptic.select(); }}>
                    {s}
                    {st === 'full' && ` · ${t('занято', 'band')}`}
                  </button>
                );
              })}
            </div>
            {tried && !slot && <div className="err">{t('Выберите интервал доставки', 'Yetkazish vaqtini tanlang')}</div>}
            {day.holiday && <div className="hint">{t('Праздничный день: принимаем до 200 заказов, такси дороже обычного.', "Bayram kuni: 200 tagacha buyurtma, taksi qimmatroq.")}</div>}
            {gift && (
              <button className="link" style={{ marginTop: 12 }} onClick={() => setAskTime(true)}>
                {t('Не знаю, когда удобно — спросите у получателя', 'Qachon qulayligini bilmayman — qabul qiluvchidan so‘rang')}
              </button>
            )}
          </>
        )}
      </div>

      <div className="panel">
        <h2>{t('Открытка', 'Otkritka')} <span className="muted" style={{ fontWeight: 400, fontSize: 14 }}>· {t('бесплатно', 'bepul')}</span></h2>
        <CardEditor suggestedOccasion={suggested} />
      </div>

      <div className="panel">
        <label className="field" style={{ marginTop: 0 }}>
          <span>{t('Комментарий флористу и курьеру', 'Florist va kuryerga izoh')}</span>
          <textarea className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('Например: позвонить за 15 минут', 'Masalan: 15 daqiqa oldin qo‘ng‘iroq qiling')} />
        </label>
      </div>

      <div className="panel" ref={refs.contacts}>
        <h2>{t('Ваши контакты', 'Sizning kontaktlaringiz')}</h2>
        <label className="field">
          <span>{t('Как к вам обращаться', 'Sizga qanday murojaat qilaylik')}</span>
          <input className="input" value={user.name} onChange={(e) => setUser({ name: e.target.value })} />
        </label>
        <label className="field">
          <span>{t('Телефон', 'Telefon')}</span>
          <input className={`input${bad(!phoneOk(user.phone))}`} value={user.phone} onChange={(e) => setUser({ phone: e.target.value })} inputMode="tel" placeholder="+998 __ ___-__-__" />
        </label>
        {!phoneOk(user.phone) && (
          <button className="btn ghost small" style={{ marginTop: 10 }} onClick={async () => { const p = await requestPhone(); if (p) setUser({ phone: p }); }}>
            {t('Взять номер из Telegram', 'Raqamni Telegramdan olish')}
          </button>
        )}
      </div>

      <div className="panel">
        <h2>{t('Оплата', "To'lov")}</h2>
        <div className="pay" role="group">
          <button aria-pressed={pay === 'payme'} onClick={() => setPay('payme')}>
            <span className="logo" style={{ background: '#33CCCC' }}>Payme</span>
            <span>Payme<small>Uzcard, Humo</small></span>
          </button>
          <button aria-pressed={pay === 'click'} onClick={() => setPay('click')}>
            <span className="logo" style={{ background: '#0073FF' }}>Click</span>
            <span>Click<small>Uzcard, Humo</small></span>
          </button>
          {!pickup && (
            <button aria-pressed={pay === 'cash'} onClick={() => setPay('cash')}>
              <span className="logo" style={{ background: '#2E5A4C' }}>{t('Нал', 'Naqd')}</span>
              <span>{t('Наличными при получении', 'Qabul qilganda naqd')}<small>{t('Доставит такси Миллениум', 'Millennium taksisi yetkazadi')}</small></span>
            </button>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="sumrow"><span>{t('Букет и дополнения', "Guldasta va qo'shimchalar")}</span><span>{money(itemsTotal, lang)}</span></div>
        {discount > 0 && <div className="sumrow ok"><span>{t('Скидка по промокоду', 'Promokod chegirmasi')}</span><span>−{money(discount, lang)}</span></div>}
        <div className="sumrow">
          <span>{t('Доставка по тарифу такси', "Taksi tarifi bo'yicha yetkazish")}</span>
          <span>{delivery === null ? t('после адреса', 'manzildan keyin') : money(delivery, lang)}</span>
        </div>
        <div className="sumrow total"><span>{t('К оплате', "To'lovga")}</span><span>{money(total, lang)}</span></div>
        <label className="check">
          <input type="checkbox" checked={offer} onChange={(e) => setOffer(e.target.checked)} />
          <span>{t('Принимаю условия оферты', 'Oferta shartlarini qabul qilaman')}</span>
        </label>
      </div>

      <div className="dock no-tabs">
        <div className="dock-in">
          <button className="btn" disabled={!offer} onClick={submit}>
            {missing ? `${missing.label} ↓` : pay === 'cash' ? t('Оформить заказ', 'Buyurtma berish') : `${t('Оплатить', "To'lash")} ${money(total, lang)}`}
          </button>
        </div>
      </div>
    </>
  );
}
