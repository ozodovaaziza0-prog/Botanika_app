import { useState } from 'react';
import { addons, bunchPrice, flowerById } from '../data';
import { FlowerArt } from '../components/FlowerArt';
import { bunchArt } from '../components/art';
import { Header } from '../components/Header';
import { useStore } from '../store';
import { money, pick, tr } from '../i18n';
import { haptic } from '../telegram';

/** Карточка охапки одного вида цветов. */
export function Product({ id }: { id: string }) {
  const { lang, add, cart, setQty, setTab, t, go, setDiy, diy } = useStore();
  const f = flowerById(id);
  const firstShade = f.shades.find((s) => s.available) ?? f.shades[0];
  const [shadeId, setShadeId] = useState(firstShade.id);
  const [stems, setStems] = useState(f.bunchSizes[Math.min(1, f.bunchSizes.length - 1)]);
  const [extras, setExtras] = useState<string[]>([]);
  const shade = f.shades.find((s) => s.id === shadeId)!;
  const price = bunchPrice(f, stems);
  const key = `b:${f.id}:${shadeId}:${stems}`;
  const line = cart.find((l) => l.key === key);
  const extrasSum = extras.reduce((s, a) => s + addons.find((x) => x.id === a)!.price, 0);

  const addAll = () => {
    haptic.success();
    add({ type: 'bunch', flowerId: f.id, shadeId, stems });
    extras.forEach((a) => add({ type: 'addon', addonId: a }));
    setExtras([]);
  };

  const toDiy = () => {
    const k = `${f.id}:${shadeId}`;
    setDiy(k, (diy[k] ?? 0) + 3);
    go({ name: 'diy' });
  };

  return (
    <>
      <Header title="" />
      <div className="hero">
        <FlowerArt seed={f.id + shadeId} stems={bunchArt(f, shadeId, stems)} pack="box" />
      </div>

      <div className="section">
        <h1 className="p-name">{t('Охапка', 'Quchoq')}: {pick(lang, f.name)}</h1>
        <div className="p-meta">
          {tr(lang, 'sold')}: {f.sold.toLocaleString('ru-RU')} {t('стеблей', 'poya')}
          {f.latin && ` · ${f.latin}`}
        </div>
        <div className="p-price">
          <b>{money(price, lang)}</b>
          <span>
            {money(Math.round(price / stems / 100) * 100, lang)} / {t('стебель', 'poya')}
          </span>
        </div>

        <h2 style={{ marginTop: 18 }}>
          {t('Цвет', 'Rang')}: <span className="muted" style={{ fontWeight: 400 }}>{pick(lang, shade.name)}</span>
        </h2>
        <div className="shades" role="group" aria-label={t('Цвет', 'Rang')}>
          {f.shades.map((s) => (
            <button
              key={s.id}
              aria-pressed={s.id === shadeId}
              disabled={!s.available}
              onClick={() => { haptic.select(); setShadeId(s.id); }}
              aria-label={pick(lang, s.name) + (s.available ? '' : ` — ${tr(lang, 'soldOut')}`)}
            >
              <i style={{ background: `linear-gradient(135deg, ${s.hex} 55%, ${s.hex2 ?? s.hex} 55%)` }} />
              <span>{pick(lang, s.name)}</span>
            </button>
          ))}
        </div>

        <h2 style={{ marginTop: 18 }}>{t('Сколько стеблей', 'Nechta poya')}</h2>
        <div className="seg" role="group">
          {f.bunchSizes.map((n, i) => (
            <button key={n} aria-pressed={n === stems} onClick={() => { haptic.select(); setStems(n); }}>
              {n} {t('шт', 'dona')}
              <small>{money(bunchPrice(f, n), lang)}</small>
              {f.bunchDiscount[i] > 0 && <small className="ok">−{Math.round(f.bunchDiscount[i] * 100)}%</small>}
            </button>
          ))}
        </div>

        <div className="facts">
          <div>
            <small>{tr(lang, 'lasts')}</small>
            <b>{f.lastsDays[0]}–{f.lastsDays[1]} {tr(lang, 'days')}</b>
          </div>
          <div>
            <small>{t('Высота', 'Balandlik')}</small>
            <b>{f.stemCm} {t('см', 'sm')}</b>
          </div>
          <div>
            <small>{t('Налить воды', 'Suv quying')}</small>
            <b>{pick(lang, f.water)}</b>
          </div>
        </div>

        {f.note && <div className="note"><b>{t('Важно знать', 'Bilish muhim')}:</b> {pick(lang, f.note)}</div>}
        <div className="info" style={{ marginTop: 10 }}>
          {t(
            'Привезём охапку в фирменной коробке Botanika, стебли в воде. Перед отправкой пришлём фото.',
            "Quchoqni Botanika qutisida, poyalari suvda olib kelamiz. Jo'natishdan oldin rasmini yuboramiz.",
          )}
        </div>
        <details className="acc">
          <summary>{tr(lang, 'care')}</summary>
          <p>{pick(lang, f.care)}</p>
        </details>
        <button className="link" style={{ marginTop: 14 }} onClick={toDiy}>
          {t('Хочу смешать с другими цветами — в «Собери сам»', "Boshqa gullar bilan aralashtirmoqchiman — «O'zingiz yig'ing»ga")}
        </button>
      </div>

      <div className="section">
        <h2>{t('Добавить к заказу', "Buyurtmaga qo'shish")}</h2>
        <div className="addons">
          {addons.map((a) => {
            const on = extras.includes(a.id);
            return (
              <button key={a.id} className="addon" aria-pressed={on} onClick={() => setExtras(on ? extras.filter((x) => x !== a.id) : [...extras, a.id])}>
                <div className="em" aria-hidden="true">{a.emoji}</div>
                <div className="nm">{pick(lang, a.name)}</div>
                <div className="pr">+{money(a.price, lang)}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="dock">
        <div className="dock-in">
          {line && extras.length === 0 ? (
            <div className="row-gap">
              <div className="stepper">
                <button aria-label={t('Меньше', 'Kamroq')} onClick={() => setQty(key, line.qty - 1)}>−</button>
                <span>{line.qty}</span>
                <button aria-label={t('Больше', "Ko'proq")} onClick={() => setQty(key, line.qty + 1)}>+</button>
              </div>
              <button className="btn" onClick={() => setTab('cart')}>
                {tr(lang, 'inCart')} <span className="sum">· {t('перейти', "o'tish")}</span>
              </button>
            </div>
          ) : (
            <button className="btn" onClick={addAll}>
              {tr(lang, 'toCart')} <span className="sum">· {money(price + extrasSum, lang)}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
