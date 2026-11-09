import { Header } from '../components/Header';
import { useStore, type Order, type OrderStatus } from '../store';
import { money } from '../i18n';
import { haptic } from '../telegram';

const STEPS: { id: OrderStatus; ru: string; uz: string }[] = [
  { id: 'paid', ru: 'Оплачен', uz: "To'langan" },
  { id: 'accepted', ru: 'Принят магазином', uz: "Do'kon qabul qildi" },
  { id: 'assembling', ru: 'Флорист собирает охапку', uz: "Florist quchoqni yig'moqda" },
  { id: 'ready', ru: 'Собран — фото отправили вам', uz: "Tayyor — rasmini yubordik" },
  { id: 'courier', ru: 'Курьер в пути', uz: "Kuryer yo'lda" },
  { id: 'delivered', ru: 'Доставлен', uz: 'Yetkazildi' },
];

export const statusLabel = (s: OrderStatus, lang: 'ru' | 'uz') => STEPS.find((x) => x.id === s)![lang];

/** Экран «оплата» — имитация страницы Payme/Click. В рабочей версии здесь редирект на checkout платёжки. */
export function Pay({ orderId }: { orderId: string }) {
  const { orders, go, t, lang } = useStore();
  const o = orders.find((x) => x.id === orderId)!;
  const name = o.payment === 'click' ? 'Click' : 'Payme';
  return (
    <>
      <Header title={name} noBack />
      <div className="payme-sheet">
        <p className="muted" style={{ marginTop: 0 }}>{t('Тестовая страница оплаты', "Sinov to'lov sahifasi")}</p>
        <div className="sumrow"><span>Botanika · {t('заказ', 'buyurtma')} №{o.number}</span></div>
        <div className="sumrow total"><span>{t('Сумма', 'Summa')}</span><span>{money(o.total, lang)}</span></div>
        <p className="hint">
          {t(
            'В рабочей версии откроется страница оплаты картой Uzcard или Humo с SMS-кодом. Статус «Оплачен» ставит сервер по уведомлению от платёжной системы.',
            "Ishchi versiyada Uzcard yoki Humo karta bilan SMS-kodli to'lov sahifasi ochiladi.",
          )}
        </p>
        <button className="btn" style={{ marginTop: 12 }} onClick={() => { haptic.success(); go({ name: 'success', orderId }); }}>
          {t('Оплатить (тест)', "To'lash (sinov)")}
        </button>
      </div>
    </>
  );
}

export function Success({ orderId }: { orderId: string }) {
  const { orders, setTab, go, t } = useStore();
  const o = orders.find((x) => x.id === orderId)!;
  return (
    <>
      <div className="center">
        <div className="big-ok" aria-hidden="true">✓</div>
        <h1>{o.payment === 'cash' ? t('Заказ оформлен', 'Buyurtma qabul qilindi') : t('Заказ оплачен', "Buyurtma to'landi")}</h1>
        <p className="muted">
          №{o.number} · {o.date}, {o.slot}
        </p>
      </div>
      <div className="panel">
        <h2>{t('Что будет дальше', 'Keyin nima bo‘ladi')}</h2>
        <ul className="timeline">
          <li className="done"><span className="b" /><span>{t('Менеджер подтвердит заказ в течение 10 минут', 'Menejer 10 daqiqa ichida tasdiqlaydi')}</span></li>
          {o.askRecipient && (
            <li className="now"><span className="b" /><span>{t('Получатель получит SMS и выберет адрес и время', 'Qabul qiluvchi SMS oladi va manzil hamda vaqtni tanlaydi')}</span></li>
          )}
          <li className="todo"><span className="b" /><span>{t('Перед доставкой пришлём в этот чат фото охапки', "Yetkazishdan oldin quchoq rasmini shu chatga yuboramiz")}</span></li>
          <li className="todo"><span className="b" /><span>{t('Напишем, когда курьер выедет и когда цветы вручат', 'Kuryer chiqqanda va gullar topshirilganda yozamiz')}</span></li>
        </ul>
      </div>
      {o.askRecipient && (
        <div className="panel">
          <button className="link" onClick={() => go({ name: 'recipient', orderId })}>
            {t('Посмотреть, что увидит получатель по ссылке', 'Qabul qiluvchi havolada nimani ko‘rishini ko‘rish')}
          </button>
        </div>
      )}
      <div className="dock no-tabs">
        <div className="dock-in row-gap">
          <button className="btn ghost" onClick={() => setTab('catalog')}>{t('В каталог', 'Katalogga')}</button>
          <button className="btn" onClick={() => { setTab('orders'); }}>{t('Мои заказы', 'Buyurtmalarim')}</button>
        </div>
      </div>
    </>
  );
}

export function Orders() {
  const { orders, go, t, lang, setTab } = useStore();
  if (orders.length === 0) {
    return (
      <>
        <Header title={t('Заказы', 'Buyurtmalar')} />
        <div className="empty">
          <h2>{t('Заказов пока нет', "Hozircha buyurtmalar yo'q")}</h2>
          <p>{t('Здесь будут статусы и фото ваших охапок.', 'Bu yerda quchoqlaringiz holati va rasmlari bo‘ladi.')}</p>
          <button className="btn" onClick={() => setTab('catalog')}>{t('Выбрать цветы', 'Gul tanlash')}</button>
        </div>
      </>
    );
  }
  return (
    <>
      <Header title={t('Заказы', 'Buyurtmalar')} />
      {orders.map((o) => (
        <div className="panel" key={o.id}>
          <button className="order-card" onClick={() => go({ name: 'order', id: o.id })}>
            <div className="row-gap" style={{ justifyContent: 'space-between' }}>
              <b>№{o.number}</b>
              <span className="status">{statusLabel(o.status, lang)}</span>
            </div>
            <div className="hint" style={{ marginTop: 4 }}>{o.lines[0].title}{o.lines.length > 1 && ` +${o.lines.length - 1}`}</div>
            <div className="hint" style={{ marginTop: 2 }}>{o.date}, {o.slot} · {money(o.total, lang)}</div>
          </button>
        </div>
      ))}
    </>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const { orders, t, lang, setOrderStatus, setTab, add } = useStore();
  const o = orders.find((x) => x.id === id)!;
  const idx = STEPS.findIndex((s) => s.id === o.status);
  const advance = () => idx < STEPS.length - 1 && setOrderStatus(o.id, STEPS[idx + 1].id);
  return (
    <>
      <Header title={`${t('Заказ', 'Buyurtma')} №${o.number}`} />
      <div className="panel">
        <ul className="timeline">
          {STEPS.map((s, i) => (
            <li key={s.id} className={i < idx ? 'done' : i === idx ? 'done' : 'todo'}>
              <span className="b" />
              <span>{s[lang]}</span>
            </li>
          ))}
        </ul>
        {idx < STEPS.length - 1 && (
          <button className="btn ghost small" onClick={advance}>
            {t('Демо: следующий статус', 'Demo: keyingi holat')}
          </button>
        )}
      </div>
      <div className="panel">
        <OrderSummary o={o} />
      </div>
      {o.status === 'delivered' && (
        <div className="dock no-tabs">
          <div className="dock-in">
            <button className="btn" onClick={() => { o.cartLines.forEach(({ key: _k, qty, ...l }) => add(l, qty)); setTab('cart'); }}>
              {t('Повторить заказ', 'Buyurtmani takrorlash')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function OrderSummary({ o }: { o: Order }) {
  const { t, lang } = useStore();
  return (
    <>
      {o.lines.map((l) => (
        <div className="sumrow" key={l.title}><span>{l.title} × {l.qty}</span><span>{money(l.price * l.qty, lang)}</span></div>
      ))}
      <div className="sumrow"><span>{t('Доставка', 'Yetkazish')}</span><span>{money(o.delivery, lang)}</span></div>
      {o.discount > 0 && <div className="sumrow ok"><span>{t('Скидка', 'Chegirma')}</span><span>−{money(o.discount, lang)}</span></div>}
      <div className="sumrow total"><span>{t('Итого', 'Jami')}</span><span>{money(o.total, lang)}</span></div>
      <p className="hint">{t('Кому', 'Kimga')}: {o.recipient}</p>
      <p className="hint">{t('Адрес', 'Manzil')}: {o.address}</p>
      {o.card && (
        <div className="postcard" style={{ marginTop: 12, minHeight: 0 }}>
          <div className="pc-text">{o.card}</div>
        </div>
      )}
    </>
  );
}
