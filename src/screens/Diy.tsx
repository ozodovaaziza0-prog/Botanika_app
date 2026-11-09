import { useState } from 'react';
import { DIY, flowers, shadeOf, type Flower } from '../data';
import { FlowerArt, StemIcon } from '../components/FlowerArt';
import { diyArt } from '../components/art';
import { Header } from '../components/Header';
import { diyStems, diyTotal, useStore, type DiyItem } from '../store';
import { money, pick } from '../i18n';
import { haptic } from '../telegram';

/** «Собери сам»: охапка из отдельных стеблей разных видов и цветов. */
export function Diy() {
  const { lang, t, diy, setDiy, clearDiy, add, setTab } = useStore();
  const items: DiyItem[] = Object.entries(diy).map(([k, qty]) => {
    const [flowerId, shadeId] = k.split(':');
    return { flowerId, shadeId, qty };
  });
  const sum = diyTotal(items);
  const count = diyStems(items);
  const left = Math.max(0, DIY.minSum - sum);
  const full = count >= DIY.maxStems;

  const toCart = () => {
    haptic.success();
    add({ type: 'diy', items });
    clearDiy();
    setTab('cart');
  };

  const main = flowers.filter((f) => f.inDiy && !f.filler);
  const fill = flowers.filter((f) => f.inDiy && f.filler);

  return (
    <>
      <Header title={t('Собери свою охапку', "O'z quchog'ingizni yig'ing")} />

      <div className="diy-stage">
        <div className="diy-vase">
          {count > 0 ? (
            <FlowerArt seed="diy" stems={diyArt(items)} pack="vase" />
          ) : (
            <FlowerArt seed="diy-empty" stems={[]} pack="vase" />
          )}
        </div>
        <div className="diy-sum">
          <b>{count} {t('стеблей', 'poya')}</b>
          <span>{money(sum, lang)}</span>
          {items.length > 0 && (
            <ul>
              {items.map((i) => {
                const f = flowers.find((x) => x.id === i.flowerId)!;
                const s = shadeOf(f, i.shadeId);
                return (
                  <li key={i.flowerId + i.shadeId}>
                    <i style={{ background: s.hex }} /> {pick(lang, f.name)} × {i.qty}
                  </li>
                );
              })}
            </ul>
          )}
          {count === 0 && <small>{t('Добавляйте цветы по одному — охапка соберётся здесь.', "Gullarni bittadan qo'shing — quchoq shu yerda yig'iladi.")}</small>}
        </div>
      </div>

      <div className="section">
        <h2>{t('Цветы', 'Gullar')}</h2>
        {main.map((f) => (
          <DiyRow key={f.id} f={f} disabledAdd={full} />
        ))}
        <h2 style={{ marginTop: 18 }}>{t('Зелень и воздушность', "Ko'kat va havodorlik")}</h2>
        {fill.map((f) => (
          <DiyRow key={f.id} f={f} disabledAdd={full} />
        ))}
        <p className="hint">
          {t(
            `Минимальный заказ — ${money(DIY.minSum, lang)}, в одну коробку помещается до ${DIY.maxStems} стеблей. Флорист уложит стебли в коробку, ленту и упаковку добавит бесплатно.`,
            `Minimal buyurtma — ${money(DIY.minSum, lang)}, bitta qutiga ${DIY.maxStems} tagacha poya sig'adi.`,
          )}
        </p>
        {count > 0 && (
          <button className="link" onClick={clearDiy}>{t('Очистить охапку', 'Quchoqni tozalash')}</button>
        )}
      </div>

      <div className="dock no-tabs">
        <div className="dock-in">
          {count > 0 && left > 0 && (
            <div className="dock-note">
              <span>{t('До минимального заказа', 'Minimal buyurtmagacha')}</span>
              <b>{money(left, lang)}</b>
            </div>
          )}
          <div className="progress" aria-hidden="true"><i style={{ width: `${Math.min(100, (sum / DIY.minSum) * 100)}%` }} /></div>
          <button className="btn" disabled={left > 0} onClick={toCart}>
            {count === 0
              ? t('Выберите цветы', 'Gullarni tanlang')
              : left > 0
                ? `${t('Ещё', 'Yana')} ${money(left, lang)}`
                : `${t('Добавить охапку в корзину', "Quchoqni savatga qo'shish")} · ${money(sum, lang)}`}
          </button>
        </div>
      </div>
    </>
  );
}

function DiyRow({ f, disabledAdd }: { f: Flower; disabledAdd: boolean }) {
  const { lang, t, diy, setDiy } = useStore();
  const avail = f.shades.filter((s) => s.available);
  const [shadeId, setShadeId] = useState(avail[0]?.id ?? f.shades[0].id);
  const k = `${f.id}:${shadeId}`;
  const qty = diy[k] ?? 0;
  const s = shadeOf(f, shadeId);
  const otherShades = f.shades.filter((x) => x.id !== shadeId && (diy[`${f.id}:${x.id}`] ?? 0) > 0);

  return (
    <div className="diy-row">
      <div className="diy-thumb">
        <StemIcon kind={f.kind} c1={s.hex} c2={s.hex2 ?? s.hex} />
      </div>
      <div className="grow">
        <div className="t">{pick(lang, f.name)}</div>
        <div className="s">{money(f.stemPrice, lang)} / {t('шт', 'dona')} · {f.stemCm} {t('см', 'sm')}</div>
        {f.shades.length > 1 && (
          <div className="dots" role="group" aria-label={t('Цвет', 'Rang')}>
            {f.shades.map((x) => (
              <button
                key={x.id}
                aria-pressed={x.id === shadeId}
                disabled={!x.available}
                aria-label={pick(lang, x.name)}
                title={pick(lang, x.name)}
                style={{ background: x.hex }}
                onClick={() => { haptic.select(); setShadeId(x.id); }}
              />
            ))}
            <span className="muted">{pick(lang, s.name)}</span>
          </div>
        )}
        {otherShades.length > 0 && (
          <div className="s" style={{ marginTop: 4 }}>
            {t('Ещё в охапке', 'Quchoqda yana')}: {otherShades.map((x) => `${pick(lang, x.name).toLowerCase()} × ${diy[`${f.id}:${x.id}`]}`).join(', ')}
          </div>
        )}
      </div>
      {qty === 0 ? (
        <button className="add-stem" disabled={disabledAdd} onClick={() => { haptic.tap(); setDiy(k, 1); }} aria-label={`${t('Добавить', "Qo'shish")}: ${pick(lang, f.name)}`}>
          +
        </button>
      ) : (
        <div className="mini-step" style={{ marginTop: 0 }}>
          <button aria-label={t('Меньше', 'Kamroq')} onClick={() => setDiy(k, qty - 1)}>−</button>
          <span>{qty}</span>
          <button aria-label={t('Больше', "Ko'proq")} disabled={disabledAdd} onClick={() => { haptic.tap(); setDiy(k, qty + 1); }}>+</button>
        </div>
      )}
    </div>
  );
}
