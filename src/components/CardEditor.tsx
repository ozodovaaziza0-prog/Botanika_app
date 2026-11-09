import { useState } from 'react';
import { cardOccasions, continueText, generate, MAX_CARD, PERSONAL_OCCASIONS, recipients, tones } from '../cardAssistant';
import { useStore } from '../store';
import { haptic } from '../telegram';

export function CardEditor({ suggestedOccasion }: { suggestedOccasion: string | null }) {
  const { lang, card, setCard, user, t } = useStore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const occasion = card.occasion || suggestedOccasion || '';
  const ready = !!card.to && !!occasion;

  const run = (nextRound: number) => {
    setBusy(true);
    setVariants([]);
    // имитация задержки ответа модели
    window.setTimeout(() => {
      setVariants(generate({ lang, to: card.to, occasion, tone: card.tone, name: card.name, round: nextRound }));
      setRound(nextRound);
      setBusy(false);
      haptic.success();
    }, 700);
  };

  const continueMine = () => {
    setCard({ text: continueText(card.text, occasion || 'just', lang) });
    haptic.success();
  };

  const sign = card.signature === 'anon' ? t('Без подписи', 'Imzosiz') : `— ${user.name}`;

  return (
    <>
      <div className="postcard">
        <svg className="stamp" viewBox="0 0 24 32" aria-hidden="true">
          <circle cx="12" cy="12" r="5" fill="#E89AAE" />
          <circle cx="8" cy="9" r="3.5" fill="#F2C7CF" />
          <circle cx="16" cy="9" r="3.5" fill="#F2C7CF" />
          <path d="M12 17v12" stroke="#5E8A73" strokeWidth="1.5" />
          <ellipse cx="15" cy="23" rx="2.2" ry="4" fill="#5E8A73" transform="rotate(35 15 23)" />
        </svg>
        <textarea
          value={card.text}
          maxLength={MAX_CARD}
          onChange={(e) => setCard({ text: e.target.value })}
          placeholder={t('Пара тёплых слов… или попросите помощника ниже', 'Bir-ikki iliq so‘z… yoki pastdagi yordamchidan so‘rang')}
          aria-label={t('Текст открытки', 'Otkritka matni')}
        />
        <div className="pc-sign">{sign}</div>
      </div>
      <div className="counter">
        {card.text.length} / {MAX_CARD}
      </div>

      <div className="toggle" role="group" aria-label={t('Подпись', 'Imzo')} style={{ marginTop: 8 }}>
        <button aria-pressed={card.signature === 'name'} onClick={() => setCard({ signature: 'name' })}>
          {t('С моим именем', 'Ismim bilan')}
        </button>
        <button aria-pressed={card.signature === 'anon'} onClick={() => setCard({ signature: 'anon' })}>
          {t('Анонимно', 'Anonim')}
        </button>
      </div>

      {!open ? (
        <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setOpen(true)}>
          ✦ {t('Помочь с текстом', 'Matn bilan yordam')}
        </button>
      ) : (
        <div className="ai">
          <h3>{t('Помощник по открытке', 'Otkritka yordamchisi')}</h3>
          <p>{t('Выберите, кому и по какому поводу — предложу три варианта.', 'Kimga va qanday sabab bilan — uchta variant taklif qilaman.')}</p>

          <div className="lbl">{t('Кому', 'Kimga')}</div>
          <div className="chips">
            {recipients.map((r) => (
              <button key={r.id} className="chip" aria-pressed={card.to === r.id} onClick={() => setCard({ to: r.id })}>
                {r[lang]}
              </button>
            ))}
          </div>

          <div className="lbl">{t('Повод', 'Sabab')}</div>
          <div className="chips">
            {cardOccasions.map((o) => (
              <button key={o.id} className="chip" aria-pressed={occasion === o.id} onClick={() => setCard({ occasion: o.id })}>
                {o[lang]}
              </button>
            ))}
          </div>

          <div className="lbl">{t('Тон', 'Ohang')}</div>
          <div className="chips">
            {tones.map((x) => (
              <button key={x.id} className="chip" aria-pressed={card.tone === x.id} onClick={() => setCard({ tone: x.id })}>
                {x[lang]}
              </button>
            ))}
          </div>

          <input
            value={card.name}
            onChange={(e) => setCard({ name: e.target.value })}
            placeholder={t('Имя получателя (необязательно)', 'Qabul qiluvchi ismi (ixtiyoriy)')}
            aria-label={t('Имя получателя', 'Qabul qiluvchi ismi')}
          />

          {card.text.trim().length > 3 && (
            <button className="btn" onClick={continueMine} disabled={!occasion}>
              {t('Дописать мой текст', 'Matnimni davom ettirish')}
            </button>
          )}
          <button className="btn" disabled={!ready || busy} onClick={() => run(variants.length ? round + 1 : 0)}>
            {variants.length ? t('Ещё варианты', 'Yana variantlar') : t('Предложить тексты', 'Matn taklif qilish')}
          </button>

          {busy && (
            <div className="thinking" aria-label={t('Пишу варианты', 'Variantlar yozilmoqda')}>
              <i /><i /><i />
            </div>
          )}
          {variants.length > 0 && (
            <div className="variants">
              {variants.map((v) => (
                <button key={v} className="variant" aria-pressed={card.text === v} onClick={() => { haptic.select(); setCard({ text: v }); }}>
                  {v}
                </button>
              ))}
            </div>
          )}

          {PERSONAL_OCCASIONS.includes(occasion) && (
            <label className="check" style={{ color: '#dfe9e2' }}>
              <input type="checkbox" checked={card.saveDate} onChange={(e) => setCard({ saveDate: e.target.checked })} />
              <span>
                {t(
                  'Напомнить мне об этой дате в следующем году — за 3 дня и за день до.',
                  'Keyingi yili bu sanani 3 kun va 1 kun oldin eslatib qo‘ying.',
                )}
              </span>
            </label>
          )}
          <p style={{ marginTop: 12, fontSize: 12 }}>
            {t('Прототип: тексты из шаблонов. В рабочей версии их пишет AI.', 'Prototip: matnlar shablondan. Ishchi versiyada AI yozadi.')}
          </p>
        </div>
      )}
    </>
  );
}
