import { useState } from 'react';
import { addons, products } from '../data';
import { FlowerArt } from '../components/FlowerArt';
import { Header } from '../components/Header';
import { unitPrice, useStore } from '../store';
import { money, pick, tr } from '../i18n';

export const PROMO_CODES: Record<string, number> = { BOTANIKA10: 0.1 };

export function Cart() {
  const { lang, cart, setQty, itemsTotal, setTab, go, promo, setPromo, t, add } = useStore();
  const [code, setCode] = useState(promo ?? '');
  const [promoErr, setPromoErr] = useState(false);
  const discount = promo ? Math.round(itemsTotal * (PROMO_CODES[promo] ?? 0)) : 0;
  const hasBouquet = cart.some((l) => l.productId);

  if (cart.length === 0) {
    return (
      <>
        <Header title={tr(lang, 'cart')} />
        <div className="empty">
          <h2>{tr(lang, 'cartEmpty')}</h2>
          <p>{tr(lang, 'cartEmptyHint')}</p>
          <button className="btn" onClick={() => setTab('catalog')}>
            {tr(lang, 'toCatalog')}
          </button>
        </div>
      </>
    );
  }

  const applyPromo = () => {
    const c = code.trim().toUpperCase();
    if (PROMO_CODES[c]) {
      setPromo(c);
      setPromoErr(false);
    } else {
      setPromo(null);
      setPromoErr(true);
    }
  };

  const missingAddons = addons.filter((a) => !cart.some((l) => l.addonId === a.id)).slice(0, 3);

  return (
    <>
      <Header title={tr(lang, 'cart')} />
      <div className="panel">
        {cart.map((l) => {
          const p = l.productId ? products.find((x) => x.id === l.productId)! : null;
          const v = p?.variants.find((x) => x.id === l.variantId);
          const a = l.addonId ? addons.find((x) => x.id === l.addonId)! : null;
          return (
            <div className="line" key={l.key}>
              <div className="thumb">
                {p && v ? <FlowerArt seed={p.id} kind={p.kind} wrap={p.wrap} colors={p.colors} stems={v.stems} /> : <span aria-hidden="true">{a?.emoji}</span>}
              </div>
              <div className="grow">
                <div className="t">{p ? pick(lang, p.name) : a && pick(lang, a.name)}</div>
                <div className="s">{v ? pick(lang, v.label) : t('Дополнение', "Qo'shimcha")}</div>
                <div className="mini-step">
                  <button aria-label={t('Меньше', 'Kamroq')} onClick={() => setQty(l.key, l.qty - 1)}>−</button>
                  <span>{l.qty}</span>
                  <button aria-label={t('Больше', "Ko'proq")} onClick={() => setQty(l.key, l.qty + 1)}>+</button>
                </div>
              </div>
              <b>{money(unitPrice(l) * l.qty, lang)}</b>
            </div>
          );
        })}
      </div>

      {missingAddons.length > 0 && (
        <div className="section">
          <h2>{t('Часто добавляют', "Ko'pincha qo'shishadi")}</h2>
          <div className="addons">
            {missingAddons.map((a) => (
              <button key={a.id} className="addon" onClick={() => add({ addonId: a.id })}>
                <div className="em" aria-hidden="true">{a.emoji}</div>
                <div className="nm">{pick(lang, a.name)}</div>
                <div className="pr">+{money(a.price, lang)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="panel">
        <div className="row-gap">
          <input
            className={`input${promoErr ? ' bad' : ''}`}
            placeholder={tr(lang, 'promo')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-label={tr(lang, 'promo')}
          />
          <button className="btn small ghost" onClick={applyPromo} disabled={!code.trim()}>
            {tr(lang, 'apply')}
          </button>
        </div>
        {promo && <div className="hint ok">{tr(lang, 'promoOk')}</div>}
        {promoErr && <div className="err">{tr(lang, 'promoBad')}</div>}
        {!promo && !promoErr && <div className="hint">{t('Для проверки: BOTANIKA10', 'Sinov uchun: BOTANIKA10')}</div>}
      </div>

      <div className="panel">
        <div className="sumrow"><span>{tr(lang, 'items')}</span><span>{money(itemsTotal, lang)}</span></div>
        {discount > 0 && <div className="sumrow ok"><span>{t('Скидка', 'Chegirma')}</span><span>−{money(discount, lang)}</span></div>}
        <div className="sumrow muted"><span>{tr(lang, 'delivery')}</span><span>{tr(lang, 'deliveryLater')}</span></div>
        <div className="sumrow total"><span>{tr(lang, 'total')}</span><span>{money(itemsTotal - discount, lang)}</span></div>
      </div>

      <div className="dock">
        <div className="dock-in">
          <button className="btn" disabled={!hasBouquet} onClick={() => go({ name: 'checkout' })}>
            {hasBouquet ? tr(lang, 'checkout') : t('Добавьте букет — дополнения не продаём отдельно', "Guldasta qo'shing — qo'shimchalar alohida sotilmaydi")}
          </button>
        </div>
      </div>
    </>
  );
}
