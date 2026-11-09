import { useState } from 'react';
import { addons, products } from '../data';
import { FlowerArt } from '../components/FlowerArt';
import { Header } from '../components/Header';
import { useStore } from '../store';
import { money, pick, tr } from '../i18n';
import { haptic } from '../telegram';

export function Product({ id }: { id: string }) {
  const { lang, add, cart, setQty, setTab, t } = useStore();
  const p = products.find((x) => x.id === id)!;
  const [vid, setVid] = useState(p.variants[Math.min(1, p.variants.length - 1)].id);
  const [extras, setExtras] = useState<string[]>([]);
  const v = p.variants.find((x) => x.id === vid)!;
  const key = `${p.id}:${v.id}`;
  const line = cart.find((l) => l.key === key);
  const extrasSum = extras.reduce((s, a) => s + addons.find((x) => x.id === a)!.price, 0);

  const addAll = () => {
    haptic.success();
    add({ productId: p.id, variantId: v.id });
    extras.forEach((a) => add({ addonId: a }));
    setExtras([]);
  };

  return (
    <>
      <Header title="" />
      <div className="hero">
        <FlowerArt seed={p.id} kind={p.kind} wrap={p.wrap} colors={p.colors} stems={v.stems} />
      </div>

      <div className="section">
        <h1 className="p-name">{pick(lang, p.name)}</h1>
        <div className="p-meta">
          {tr(lang, 'sold')}: {p.sold.toLocaleString('ru-RU')} · {pick(lang, p.composition)}
        </div>
        <div className="p-price">
          <b>{money(v.price, lang)}</b>
          {p.oldPrice && vid === p.variants[0].id && <s>{money(p.oldPrice, lang)}</s>}
          <span>
            {money(Math.round(v.price / v.stems / 1000) * 1000, lang)} / {t('стебель', 'dona')}
          </span>
        </div>

        {p.variants.length > 1 && (
          <div className="seg" role="group" aria-label={t('Размер букета', 'Guldasta o‘lchami')}>
            {p.variants.map((x) => (
              <button key={x.id} aria-pressed={x.id === vid} onClick={() => { haptic.select(); setVid(x.id); }}>
                {pick(lang, x.label)}
                <small>{money(x.price, lang)}</small>
              </button>
            ))}
          </div>
        )}

        <div className="facts">
          <div>
            <small>{tr(lang, 'lasts')}</small>
            <b>{p.lastsDays[0]}–{p.lastsDays[1]} {tr(lang, 'days')}</b>
          </div>
          <div>
            <small>{tr(lang, 'size')}</small>
            <b>{p.sizeCm}</b>
          </div>
          <div>
            <small>{t('Стеблей', 'Poyalar')}</small>
            <b>{v.stems}</b>
          </div>
        </div>

        <div className="note">{tr(lang, 'photoNote')}</div>

        <details className="acc">
          <summary>{tr(lang, 'composition')}</summary>
          <p>{pick(lang, p.composition)}</p>
        </details>
        <details className="acc">
          <summary>{tr(lang, 'care')}</summary>
          <p>
            {pick(lang, p.water)}. {pick(lang, p.care)}
          </p>
        </details>
      </div>

      <div className="section">
        <h2>{tr(lang, 'addToBouquet')}</h2>
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
          {!p.available ? (
            <button className="btn" disabled>
              {tr(lang, 'soldOut')}
            </button>
          ) : line && extras.length === 0 ? (
            <div className="row-gap">
              <div className="stepper">
                <button aria-label={t('Меньше', 'Kamroq')} onClick={() => setQty(key, line.qty - 1)}>−</button>
                <span>{line.qty}</span>
                <button aria-label={t('Больше', 'Ko‘proq')} onClick={() => setQty(key, line.qty + 1)}>+</button>
              </div>
              <button className="btn" onClick={() => setTab('cart')}>
                {tr(lang, 'inCart')} <span className="sum">· {t('перейти', 'o‘tish')}</span>
              </button>
            </div>
          ) : (
            <button className="btn" onClick={addAll}>
              {tr(lang, 'toCart')} <span className="sum">· {money(v.price + extrasSum, lang)}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
