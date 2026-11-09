import { useMemo, useState } from 'react';
import { bunchPrice, flowers, groups, SLOTS } from '../data';
import { FlowerArt } from '../components/FlowerArt';
import { bunchArt } from '../components/art';
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
  const { lang, setLang, go, add, cart, cartCount, itemsTotal, setTab, t, diy } = useStore();
  const [group, setGroup] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('popular');

  const list = useMemo(() => {
    let l = flowers.filter((f) => f.inBunches && (group === 'all' || f.group === group));
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      l = l.filter((f) => (f.name.ru + f.name.uz + (f.latin ?? '')).toLowerCase().includes(s));
    }
    const price = (f: (typeof l)[number]) => bunchPrice(f, f.bunchSizes[0]);
    return [...l].sort((a, b) => (sort === 'cheap' ? price(a) - price(b) : sort === 'expensive' ? price(b) - price(a) : b.sold - a.sold));
  }, [group, q, sort]);

  const minPrice = list.length ? Math.min(...list.map((f) => bunchPrice(f, f.bunchSizes[0]))) : 0;
  const slot = nextSlotToday();
  const nextSort: Record<Sort, Sort> = { popular: 'cheap', cheap: 'expensive', expensive: 'popular' };
  const sortLabel = { popular: tr(lang, 'sortPopular'), cheap: tr(lang, 'sortCheap'), expensive: tr(lang, 'sortExpensive') }[sort];
  const diyCount = Object.values(diy).reduce((s, n) => s + n, 0);

  return (
    <>
      <header className="top">
        <div className="top-row">
          <div className="brand">
            Botanika
            <small>{t('охапки свежих цветов в коробке', 'qutida yangi gullar quchog‘i')}</small>
          </div>
          <div className="lang" role="group" aria-label="Язык">
            <button aria-pressed={lang === 'ru'} onClick={() => setLang('ru')}>RU</button>
            <button aria-pressed={lang === 'uz'} onClick={() => setLang('uz')}>UZ</button>
          </div>
        </div>
        <label className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Найти цветы', 'Gul qidirish')} aria-label={t('Найти цветы', 'Gul qidirish')} />
        </label>
      </header>

      <button className="diy-entry" onClick={() => go({ name: 'diy' })}>
        <span>
          <b>{t('Собери свою охапку', "O'z quchog'ingizni yig'ing")}</b>
          <small>
            {diyCount > 0
              ? t(`В вашей охапке ${diyCount} стеблей — продолжить`, `Quchog'ingizda ${diyCount} ta poya — davom etish`)
              : t('По одному стеблю: 5 хризантем, 3 ранункулюса, 1 пион — как захотите', "Bittadan: 5 xrizantema, 3 ranunkulus, 1 pion — xohlaganingizcha")}
          </small>
        </span>
        <span className="diy-arrow" aria-hidden="true">→</span>
      </button>

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

      <div className="chips" role="group" aria-label={t('Виды цветов', 'Gul turlari')}>
        {groups.map((c) => (
          <button key={c.id} className="chip" aria-pressed={group === c.id} onClick={() => { haptic.select(); setGroup(c.id); }}>
            {pick(lang, c.name)}
          </button>
        ))}
      </div>

      <div className="list-head">
        <span>
          {t('Охапки', 'Quchoqlar')} · {list.length}
          {list.length > 0 && ` · ${tr(lang, 'from')} ${money(minPrice, lang)}`}
        </span>
        <button className="sort" onClick={() => setSort(nextSort[sort])}>↕ {sortLabel}</button>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <h2>{t('Ничего не нашлось', 'Hech narsa topilmadi')}</h2>
          <p>{t('Попробуйте другое название или уберите фильтр.', "Boshqa nomni sinab ko'ring yoki filtrni olib tashlang.")}</p>
          <button className="btn ghost small" onClick={() => { setQ(''); setGroup('all'); }}>{t('Показать все', "Hammasini ko'rsatish")}</button>
        </div>
      ) : (
        <div className="grid">
          {list.map((f) => {
            const size = f.bunchSizes[0];
            const shade = f.shades.find((s) => s.available) ?? f.shades[0];
            const inCart = cart.some((l) => l.type === 'bunch' && l.flowerId === f.id);
            return (
              <div key={f.id} className="tile">
                <button className="pic" onClick={() => go({ name: 'product', id: f.id })} aria-label={pick(lang, f.name)}>
                  <FlowerArt seed={f.id} stems={bunchArt(f, shade.id, size)} pack="box" />
                  {f.leftBunches ? (
                    <span className="tag few">{tr(lang, 'left')} {f.leftBunches}</span>
                  ) : f.badge === 'season' ? (
                    <span className="tag new">{t('Сезон', 'Mavsum')}</span>
                  ) : f.badge ? (
                    <span className={`tag ${f.badge}`}>{tr(lang, f.badge)}</span>
                  ) : null}
                </button>
                <button
                  className={`plus${inCart ? ' added' : ''}`}
                  style={{ position: 'relative', marginTop: -44, marginLeft: 'auto', marginRight: 8 }}
                  aria-label={`${tr(lang, 'toCart')}: ${pick(lang, f.name)}, ${size}`}
                  onClick={() => { haptic.tap(); add({ type: 'bunch', flowerId: f.id, shadeId: shade.id, stems: size }); }}
                >
                  {inCart ? '✓' : '+'}
                </button>
                <button style={{ textAlign: 'left' }} onClick={() => go({ name: 'product', id: f.id })}>
                  <div className="name">{pick(lang, f.name)}</div>
                  <div className="swatches" aria-label={t('Цвета', 'Ranglar')}>
                    {f.shades.map((s) => (
                      <i key={s.id} style={{ background: s.hex }} className={s.available ? '' : 'na'} title={pick(lang, s.name)} />
                    ))}
                  </div>
                  <div className="price">
                    {money(bunchPrice(f, size), lang)}
                    <span className="per"> · {size} {t('шт', 'dona')}</span>
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
