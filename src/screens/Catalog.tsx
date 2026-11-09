import { useMemo, useState } from 'react';
import { categories, occasions, products, SLOTS } from '../data';
import { FlowerArt } from '../components/FlowerArt';
import { useStore } from '../store';
import { money, pick, tr } from '../i18n';
import { haptic } from '../telegram';

type Sort = 'popular' | 'cheap' | 'expensive';

/** Ближайший интервал, на который ещё можно успеть (сборка 2 часа). */
export function nextSlotToday(now = new Date()) {
  const ready = now.getHours() + now.getMinutes() / 60 + 2;
  return SLOTS.find((s) => parseInt(s.slice(0, 2), 10) >= ready) ?? null;
}

export function Catalog() {
  const { lang, setLang, go, add, cart, cartCount, itemsTotal, setTab, t } = useStore();
  const [cat, setCat] = useState('all');
  const [occ, setOcc] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('popular');

  const list = useMemo(() => {
    let l = products.filter((p) => (cat === 'all' || p.category === cat) && (!occ || p.occasions.includes(occ)));
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      l = l.filter((p) => (p.name.ru + p.name.uz + p.composition.ru).toLowerCase().includes(s));
    }
    const price = (p: (typeof l)[number]) => p.variants[0].price;
    l = [...l].sort((a, b) =>
      sort === 'cheap' ? price(a) - price(b) : sort === 'expensive' ? price(b) - price(a) : Number(b.available) - Number(a.available) || b.sold - a.sold,
    );
    return l;
  }, [cat, occ, q, sort]);

  const minPrice = list.length ? Math.min(...list.map((p) => p.variants[0].price)) : 0;
  const slot = nextSlotToday();
  const nextSort: Record<Sort, Sort> = { popular: 'cheap', cheap: 'expensive', expensive: 'popular' };
  const sortLabel = { popular: tr(lang, 'sortPopular'), cheap: tr(lang, 'sortCheap'), expensive: tr(lang, 'sortExpensive') }[sort];

  return (
    <>
      <header className="top">
        <div className="top-row">
          <div className="brand">
            Botanika
            <small>{t('цветы с доставкой по Ташкенту', 'Toshkent bo‘ylab gul yetkazib berish')}</small>
          </div>
          <div className="lang" role="group" aria-label="Язык">
            <button aria-pressed={lang === 'ru'} onClick={() => setLang('ru')}>RU</button>
            <button aria-pressed={lang === 'uz'} onClick={() => setLang('uz')}>UZ</button>
          </div>
        </div>
        <label className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr(lang, 'search')} aria-label={tr(lang, 'search')} />
        </label>
      </header>

      <div className="eta">
        <span className="dot" />
        <span>
          {slot ? (
            <>
              {tr(lang, 'deliverToday')} <b>{slot.slice(0, 5)}</b>
            </>
          ) : (
            tr(lang, 'closedToday')
          )}
        </span>
      </div>

      <div className="chips" role="group" aria-label={t('Категории', 'Toifalar')}>
        {categories.map((c) => (
          <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => { haptic.select(); setCat(c.id); }}>
            {pick(lang, c.name)}
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label={t('Повод', 'Sabab')} style={{ paddingTop: 8 }}>
        {occasions.map((o) => (
          <button key={o.id} className="chip soft" aria-pressed={occ === o.id} onClick={() => setOcc(occ === o.id ? null : o.id)}>
            {pick(lang, o.name)}
          </button>
        ))}
      </div>

      <div className="list-head">
        <span>
          {list.length} {tr(lang, 'bouquets')}
          {list.length > 0 && ` · ${tr(lang, 'from')} ${money(minPrice, lang)}`}
        </span>
        <button className="sort" onClick={() => setSort(nextSort[sort])}>
          ↕ {sortLabel}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <h2>{t('Ничего не нашлось', 'Hech narsa topilmadi')}</h2>
          <p>{t('Попробуйте другое слово или уберите фильтр повода.', "Boshqa so'zni sinab ko'ring yoki sabab filtrini olib tashlang.")}</p>
          <button className="btn ghost small" onClick={() => { setQ(''); setOcc(null); setCat('all'); }}>
            {t('Сбросить фильтры', 'Filtrlarni tozalash')}
          </button>
        </div>
      ) : (
        <div className="grid">
          {list.map((p) => {
            const v0 = p.variants[0];
            const inCart = cart.some((l) => l.productId === p.id);
            return (
              <div key={p.id} className={`tile${p.available ? '' : ' off'}`}>
                <button className="pic" onClick={() => go({ name: 'product', id: p.id })} aria-label={pick(lang, p.name)}>
                  <FlowerArt seed={p.id} kind={p.kind} wrap={p.wrap} colors={p.colors} stems={v0.stems} />
                  {!p.available ? (
                    <span className="tag">{tr(lang, 'soldOut')}</span>
                  ) : p.badge === 'few' ? (
                    <span className="tag few">{tr(lang, 'left')} {p.left}</span>
                  ) : p.badge === 'sale' && p.oldPrice ? (
                    <span className="tag sale">−{Math.round((1 - v0.price / p.oldPrice) * 100)}%</span>
                  ) : p.badge ? (
                    <span className={`tag ${p.badge}`}>{tr(lang, p.badge)}</span>
                  ) : null}
                </button>
                {p.available && (
                  <button
                    className={`plus${inCart ? ' added' : ''}`}
                    style={{ position: 'relative', marginTop: -44, marginLeft: 'auto', marginRight: 8 }}
                    aria-label={`${tr(lang, 'toCart')}: ${pick(lang, p.name)}`}
                    onClick={() => { haptic.tap(); add({ productId: p.id, variantId: v0.id }); }}
                  >
                    {inCart ? '✓' : '+'}
                  </button>
                )}
                <button style={{ textAlign: 'left' }} onClick={() => go({ name: 'product', id: p.id })}>
                  <div className="name">{pick(lang, p.name)}</div>
                  <div className="price">
                    {p.variants.length > 1 && `${tr(lang, 'from')} `}
                    {money(v0.price, lang)}
                    {p.oldPrice && <s>{money(p.oldPrice, lang)}</s>}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {cartCount > 0 && (
        <div className="dock">
          <div className="dock-in">
            <button className="btn" onClick={() => setTab('cart')}>
              {tr(lang, 'goCart')} <span className="sum">· {money(itemsTotal, lang)}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
