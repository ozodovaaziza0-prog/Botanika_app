import type { Lang } from './data';

// Прототип AI-помощника для открытки.
// В рабочей версии этот модуль вызывает LLM на сервере (см. PRD, раздел 4.6),
// а здесь подбирает тексты из шаблонов, чтобы показать сценарий без сервера.

export const recipients = [
  { id: 'gf', ru: 'Девушке', uz: 'Qizga', addrRu: 'Любимая', addrUz: 'Sevgilim' },
  { id: 'wife', ru: 'Жене', uz: 'Turmush o‘rtog‘imga', addrRu: 'Родная моя', addrUz: 'Jonim' },
  { id: 'mom', ru: 'Маме', uz: 'Onamga', addrRu: 'Мамочка', addrUz: 'Onajon' },
  { id: 'sister', ru: 'Сестре', uz: 'Opa-singlimga', addrRu: 'Сестрёнка', addrUz: 'Opajon' },
  { id: 'friend', ru: 'Подруге', uz: 'Dugonamga', addrRu: 'Дорогая', addrUz: 'Azizam' },
  { id: 'colleague', ru: 'Коллеге', uz: 'Hamkasbga', addrRu: 'Уважаемая', addrUz: 'Hurmatli' },
  { id: 'teacher', ru: 'Учителю', uz: 'Ustozga', addrRu: 'Дорогой учитель', addrUz: 'Aziz ustoz' },
] as const;

export const cardOccasions = [
  { id: 'mar8', ru: '8 Марта', uz: '8-mart', md: '03-08' },
  { id: 'feb14', ru: '14 февраля', uz: '14-fevral', md: '02-14' },
  { id: 'birthday', ru: 'День рождения', uz: "Tug'ilgan kun", md: null },
  { id: 'anniversary', ru: 'Годовщина', uz: 'Yilligimiz', md: null },
  { id: 'just', ru: 'Просто так', uz: 'Shunchaki', md: null },
  { id: 'sorry', ru: 'Прости', uz: 'Kechir', md: null },
  { id: 'thanks', ru: 'Спасибо', uz: 'Rahmat', md: null },
] as const;

export const tones = [
  { id: 'tender', ru: 'Нежно', uz: 'Nozik' },
  { id: 'fun', ru: 'С юмором', uz: 'Hazil bilan' },
  { id: 'short', ru: 'Коротко', uz: 'Qisqa' },
  { id: 'formal', ru: 'Официально', uz: 'Rasmiy' },
] as const;

/** Поводы, которые стоит сохранять как личную дату клиента. */
export const PERSONAL_OCCASIONS = ['birthday', 'anniversary'];

type T = Record<string, { ru: string[]; uz: string[] }>;

const warm: T = {
  mar8: {
    ru: [
      '{a}, с 8 Марта! Пусть весна начинается с тебя — с твоей улыбки, тепла и света, которым ты делишься с нами каждый день.',
      '{a}, с праздником весны! Желаю, чтобы рядом всегда были люди, которые ценят тебя так же сильно, как я.',
      '{a}, эти цветы — лишь маленькая часть того, что ты заслуживаешь. С 8 Марта!',
    ],
    uz: [
      '{a}, 8-mart bayramingiz bilan! Bahor sizning tabassumingiz va iliqligingizdan boshlansin.',
      '{a}, bahor bayrami muborak! Doimo sizni qadrlaydigan insonlar yoningizda bo‘lsin.',
      '{a}, bu gullar siz munosib bo‘lgan narsalarning kichik bir qismi xolos. 8-mart muborak!',
    ],
  },
  feb14: {
    ru: [
      '{a}, с тобой каждый день похож на праздник. С Днём всех влюблённых!',
      '{a}, спасибо, что ты есть. Люблю тебя сегодня и каждый следующий день.',
      '{a}, эти цветы завянут, а моё чувство к тебе — нет. С 14 февраля!',
    ],
    uz: [
      '{a}, sen bilan har kun bayramdek. Sevishganlar kuni muborak!',
      '{a}, borliging uchun rahmat. Seni bugun ham, har kuni ham sevaman.',
      '{a}, bu gullar so‘lishi mumkin, lekin senga bo‘lgan tuyg‘um hech qachon. 14-fevral muborak!',
    ],
  },
  birthday: {
    ru: [
      '{a}, с днём рождения! Пусть этот год будет щедрым на радость, здоровье и тёплые встречи.',
      '{a}, поздравляю! Желаю, чтобы всё задуманное сбывалось легко, а рядом были самые близкие.',
      '{a}, с днём рождения! Пусть каждый день нового года будет таким же красивым, как эти цветы.',
    ],
    uz: [
      '{a}, tug‘ilgan kuningiz muborak! Bu yil quvonch, salomatlik va iliq uchrashuvlarga boy bo‘lsin.',
      '{a}, tabriklayman! Barcha orzularingiz oson ro‘yobga chiqsin, yoningizda eng yaqinlaringiz bo‘lsin.',
      '{a}, tug‘ilgan kuningiz bilan! Yangi yoshingizning har bir kuni shu gullar kabi go‘zal bo‘lsin.',
    ],
  },
  anniversary: {
    ru: [
      '{a}, ещё один год вместе — и я снова выбрал(а) бы тебя. С годовщиной!',
      '{a}, спасибо за каждый день рядом. С нашей годовщиной, люблю тебя.',
      '{a}, с годовщиной! Пусть впереди будет ещё больше счастливых лет вдвоём.',
    ],
    uz: [
      '{a}, yana bir yil birga — va men yana seni tanlagan bo‘lardim. Yilligimiz muborak!',
      '{a}, yonimda bo‘lgan har bir kun uchun rahmat. Yilligimiz muborak, seni sevaman.',
      '{a}, yilligimiz muborak! Oldinda yanada baxtli yillar bo‘lsin.',
    ],
  },
  just: {
    ru: [
      '{a}, без повода — просто потому что ты есть.',
      '{a}, хотелось, чтобы сегодня ты улыбнулась. Думаю о тебе.',
      '{a}, просто так. Потому что ты делаешь мой мир красивее.',
    ],
    uz: [
      '{a}, sababsiz — shunchaki borliging uchun.',
      '{a}, bugun jilmayishingni istadim. Seni o‘ylayapman.',
      '{a}, shunchaki. Chunki sen dunyoimni chiroyliroq qilasan.',
    ],
  },
  sorry: {
    ru: [
      '{a}, прости меня. Ты для меня очень важна, и мне жаль, что так вышло.',
      '{a}, я был(а) неправ(а). Давай начнём этот день заново?',
      '{a}, прости. Эти цветы — моё «мне жаль» без лишних слов.',
    ],
    uz: [
      '{a}, meni kechir. Sen men uchun juda muhimsan, shunday bo‘lganidan afsusdaman.',
      '{a}, men noto‘g‘ri edim. Bu kunni qaytadan boshlaymizmi?',
      '{a}, kechir. Bu gullar — ortiqcha so‘zsiz «afsusdaman».',
    ],
  },
  thanks: {
    ru: [
      '{a}, спасибо за вашу доброту и поддержку. Это очень ценно.',
      '{a}, от всего сердца — спасибо!',
      '{a}, спасибо, что вы рядом в нужный момент.',
    ],
    uz: [
      '{a}, mehribonligingiz va qo‘llab-quvvatlaganingiz uchun rahmat.',
      '{a}, chin yurakdan — rahmat!',
      '{a}, kerakli paytda yonimda bo‘lganingiz uchun rahmat.',
    ],
  },
};

const formal: T = {
  mar8: {
    ru: ['{a}, поздравляем вас с Международным женским днём! Желаем весеннего настроения, вдохновения и успехов.'],
    uz: ['{a}, Xalqaro xotin-qizlar kuni bilan tabriklaymiz! Bahoriy kayfiyat, ilhom va muvaffaqiyatlar tilaymiz.'],
  },
  birthday: {
    ru: ['{a}, примите искренние поздравления с днём рождения! Крепкого здоровья, благополучия и новых достижений.'],
    uz: ['{a}, tug‘ilgan kuningiz bilan samimiy tabriklaymiz! Mustahkam sog‘liq, farovonlik va yangi yutuqlar tilaymiz.'],
  },
  thanks: {
    ru: ['{a}, благодарим вас за сотрудничество и внимание. Для нас это большая ценность.'],
    uz: ['{a}, hamkorlik va e’tiboringiz uchun minnatdormiz.'],
  },
};

const funTail = {
  ru: [' P.S. Цветы не ешь — я проверял(а), невкусно 🙂', ' P.S. Поставь в воду, а то обижусь 🙂', ' P.S. Курьер обещал не нюхать по дороге.'],
  uz: [' P.S. Gullarni yemang — tekshirib ko‘rdim 🙂', ' P.S. Suvga qo‘ying, bo‘lmasa xafa bo‘laman 🙂', ' P.S. Kuryer yo‘lda hidlamaslikka va’da berdi.'],
};

const closings: Record<string, { ru: string; uz: string }> = {
  mar8: { ru: ' С 8 Марта!', uz: ' 8-mart muborak!' },
  feb14: { ru: ' С Днём всех влюблённых!', uz: ' Sevishganlar kuni muborak!' },
  birthday: { ru: ' С днём рождения, пусть этот год будет самым счастливым!', uz: ' Tug‘ilgan kuning muborak, bu yil eng baxtli bo‘lsin!' },
  anniversary: { ru: ' С годовщиной — люблю тебя.', uz: ' Yilligimiz muborak — seni sevaman.' },
  just: { ru: ' Просто думаю о тебе.', uz: ' Shunchaki seni o‘ylayapman.' },
  sorry: { ru: ' Прости меня, пожалуйста.', uz: ' Iltimos, meni kechir.' },
  thanks: { ru: ' Спасибо тебе за всё.', uz: ' Hamma narsa uchun rahmat.' },
};

export const MAX_CARD = 250;

export function generate(o: { lang: Lang; to: string; occasion: string; tone: string; name: string; round: number }): string[] {
  const r = recipients.find((x) => x.id === o.to) ?? recipients[0];
  const addr = o.name.trim() ? o.name.trim() : o.lang === 'ru' ? r.addrRu : r.addrUz;
  const useFormal = o.tone === 'formal' || o.to === 'colleague' || o.to === 'teacher';
  const bank = (useFormal && formal[o.occasion]) || warm[o.occasion] || warm.just;
  const list = bank[o.lang];
  const out: string[] = [];
  for (let i = 0; i < 3; i++) {
    let s = list[(i + o.round) % list.length].replace('{a}', addr);
    if (o.tone === 'short') s = s.split(/(?<=[.!?])\s/)[0];
    if (o.tone === 'fun' && !useFormal) s += funTail[o.lang][(i + o.round) % 3];
    if (!out.includes(s)) out.push(s.slice(0, MAX_CARD));
  }
  return out;
}

export function continueText(text: string, occasion: string, lang: Lang): string {
  const base = text.trim().replace(/[,\s]+$/, '');
  const end = /[.!?…]$/.test(base) ? '' : '.';
  const tail = (closings[occasion] ?? closings.just)[lang];
  return (base + end + tail).slice(0, MAX_CARD);
}
