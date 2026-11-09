import type { Lang, L10n } from './data';

const dict = {
  search: { ru: 'Найти букет', uz: 'Guldasta qidirish' },
  deliverToday: { ru: 'Привезём сегодня с', uz: 'Bugun yetkazamiz, soat' },
  closedToday: { ru: 'Сегодня уже не успеем — привезём завтра с 09:00', uz: 'Bugun ulgurmaymiz — ertaga 09:00 dan' },
  from: { ru: 'от', uz: 'dan' },
  sum: { ru: 'сум', uz: "so'm" },
  bouquets: { ru: 'букетов', uz: 'guldasta' },
  sortPopular: { ru: 'Популярные', uz: 'Ommabop' },
  sortCheap: { ru: 'Дешевле', uz: 'Arzonroq' },
  sortExpensive: { ru: 'Дороже', uz: 'Qimmatroq' },
  hit: { ru: 'Хит', uz: 'Xit' },
  new: { ru: 'Новинка', uz: 'Yangi' },
  sale: { ru: 'Скидка', uz: 'Chegirma' },
  left: { ru: 'Осталось', uz: 'Qoldi' },
  soldOut: { ru: 'Нет в наличии', uz: 'Mavjud emas' },
  sold: { ru: 'Уже купили', uz: 'Allaqachon olishdi' },
  stems: { ru: 'стеблей', uz: 'dona' },
  lasts: { ru: 'Простоит', uz: 'Turadi' },
  days: { ru: 'дней', uz: 'kun' },
  size: { ru: 'Размер, см', uz: "O'lcham, sm" },
  composition: { ru: 'Состав', uz: 'Tarkibi' },
  care: { ru: 'Как ухаживать', uz: 'Qanday parvarish qilish' },
  photoNote: {
    ru: 'Каждый букет собирается вручную, он может немного отличаться от фото. Перед доставкой пришлём фото вашего букета.',
    uz: "Har bir guldasta qo'lda yig'iladi va rasmdan biroz farq qilishi mumkin. Yetkazishdan oldin guldastangiz rasmini yuboramiz.",
  },
  addToBouquet: { ru: 'Добавить к букету', uz: "Guldastaga qo'shish" },
  toCart: { ru: 'В корзину', uz: 'Savatga' },
  inCart: { ru: 'В корзине', uz: 'Savatda' },
  goCart: { ru: 'Перейти в корзину', uz: "Savatga o'tish" },
  cart: { ru: 'Корзина', uz: 'Savat' },
  cartEmpty: { ru: 'В корзине пока пусто', uz: "Savat hozircha bo'sh" },
  cartEmptyHint: { ru: 'Выберите букет в каталоге — доставим по Ташкенту с 09:00 до 21:00.', uz: "Katalogdan guldasta tanlang — Toshkent bo'ylab 09:00–21:00." },
  toCatalog: { ru: 'Открыть каталог', uz: 'Katalogni ochish' },
  items: { ru: 'Товары', uz: 'Mahsulotlar' },
  delivery: { ru: 'Доставка', uz: 'Yetkazib berish' },
  deliveryLater: { ru: 'посчитаем по адресу', uz: "manzil bo'yicha hisoblaymiz" },
  total: { ru: 'Итого', uz: 'Jami' },
  checkout: { ru: 'Оформить заказ', uz: 'Buyurtma berish' },
  promo: { ru: 'Промокод', uz: 'Promokod' },
  apply: { ru: 'Применить', uz: "Qo'llash" },
  promoOk: { ru: 'Скидка 10% применена', uz: "10% chegirma qo'llandi" },
  promoBad: { ru: 'Такого промокода нет. Проверьте написание.', uz: "Bunday promokod yo'q. Yozilishini tekshiring." },
  catalog: { ru: 'Каталог', uz: 'Katalog' },
  orders: { ru: 'Заказы', uz: 'Buyurtmalar' },
  profile: { ru: 'Профиль', uz: 'Profil' },
} satisfies Record<string, L10n>;

export type Key = keyof typeof dict;
export const tr = (lang: Lang, k: Key) => dict[k][lang];
export const pick = (lang: Lang, v: L10n) => v[lang];

export const money = (n: number, lang: Lang) =>
  `${Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ')} ${lang === 'ru' ? 'сум' : "so'm"}`;
