// Тестовые данные прототипа. В рабочей версии всё это приходит из API и админки.
// Модель: продаём не авторские букеты, а охапки одного вида цветов в коробке Botanika
// и поштучные стебли для режима «Собери сам».

export type Lang = 'ru' | 'uz';
export type L10n = { ru: string; uz: string };

export type FlowerKind =
  | 'rose'
  | 'spray'
  | 'peony'
  | 'tulip'
  | 'chrys'
  | 'ranunculus'
  | 'eustoma'
  | 'carnation'
  | 'alstro'
  | 'gyps'
  | 'eucalyptus'
  | 'hydrangea';

export interface Shade {
  id: string;
  name: L10n;
  hex: string;
  /** второй тон для иллюстрации */
  hex2?: string;
  available: boolean;
}

export interface Flower {
  id: string;
  group: string; // фильтр-чип
  name: L10n;
  latin?: string;
  kind: FlowerKind;
  shades: Shade[];
  /** цена одного стебля в режиме «Собери сам» и в охапке минимального размера */
  stemPrice: number;
  /** размеры охапок в стеблях; скидка растёт с размером */
  bunchSizes: number[];
  bunchDiscount: number[]; // доля скидки на каждый размер
  stemCm: number;
  lastsDays: [number, number];
  water: L10n;
  note?: L10n; // «Важно знать»
  care: L10n;
  sold: number; // стеблей продано
  badge?: 'hit' | 'new' | 'season';
  leftBunches?: number;
  inBunches: boolean;
  inDiy: boolean;
  /** зелень и наполнители — в «Собери сам» показываем отдельным блоком */
  filler?: boolean;
}

export interface Addon {
  id: string;
  name: L10n;
  price: number;
  emoji: string;
}

export const groups: { id: string; name: L10n }[] = [
  { id: 'all', name: { ru: 'Все', uz: 'Hammasi' } },
  { id: 'roses', name: { ru: 'Розы', uz: 'Atirgullar' } },
  { id: 'chrys', name: { ru: 'Хризантемы', uz: 'Xrizantemalar' } },
  { id: 'peony', name: { ru: 'Пионы', uz: 'Pionlar' } },
  { id: 'tulip', name: { ru: 'Тюльпаны', uz: 'Lolalar' } },
  { id: 'other', name: { ru: 'Другие', uz: 'Boshqalar' } },
  { id: 'green', name: { ru: 'Зелень', uz: "Ko'kat" } },
];

const sh = (id: string, ru: string, uz: string, hex: string, hex2?: string, available = true): Shade => ({
  id,
  name: { ru, uz },
  hex,
  hex2,
  available,
});

const careStd: L10n = {
  ru: 'Подрежьте стебли наискосок на 2 см острым ножом, уберите листья ниже уровня воды. Меняйте воду каждые 2 дня, держите вдали от солнца, батарей и фруктов.',
  uz: "Poyalarni o'tkir pichoq bilan qiya qilib 2 sm kesing, suv ostidagi barglarni olib tashlang. Suvni har 2 kunda almashtiring, quyosh, isitgich va mevalardan uzoqda saqlang.",
};
const third: L10n = { ru: '⅓ стебля', uz: 'poyaning ⅓ qismi' };
const half: L10n = { ru: '½ стебля', uz: 'poyaning ½ qismi' };
const little: L10n = { ru: '5–7 см воды', uz: '5–7 sm suv' };

export const flowers: Flower[] = [
  {
    id: 'chrys-spray',
    group: 'chrys',
    name: { ru: 'Хризантема кустовая', uz: 'Shoxli xrizantema' },
    latin: 'Chrysanthemum',
    kind: 'chrys',
    shades: [sh('white', 'Белая', 'Oq', '#F7F4EA', '#E9D79C'), sh('pink', 'Розовая', 'Pushti', '#EDB3C4', '#D98BA3'), sh('yellow', 'Жёлтая', 'Sariq', '#F3D66B', '#E2B93B'), sh('lilac', 'Сиреневая', 'Siren', '#C9A6D8', '#A985BE')],
    stemPrice: 22000,
    bunchSizes: [9, 15, 25],
    bunchDiscount: [0, 0.05, 0.1],
    stemCm: 60,
    lastsDays: [10, 20],
    water: third,
    note: { ru: 'Самые стойкие: на одной ветке 5–8 соцветий, они раскрываются не одновременно.', uz: "Eng chidamli: bitta shoxda 5–8 ta gul, ular bir vaqtda ochilmaydi." },
    care: careStd,
    sold: 4820,
    badge: 'hit',
    leftBunches: undefined,
    inBunches: true,
    inDiy: true,
  },
  {
    id: 'rose-kenya',
    group: 'roses',
    name: { ru: 'Роза Кения', uz: 'Keniya atirguli' },
    latin: 'Rosa',
    kind: 'rose',
    shades: [sh('red', 'Красная', 'Qizil', '#C8304F', '#9E2038'), sh('pink', 'Розовая', 'Pushti', '#EE9BB1', '#D86F8D'), sh('white', 'Белая', 'Oq', '#FBF7EF', '#E6DFCF'), sh('peach', 'Персиковая', 'Shaftoli', '#F6BE9A', '#E89D74')],
    stemPrice: 19000,
    bunchSizes: [15, 25, 51],
    bunchDiscount: [0, 0.05, 0.12],
    stemCm: 40,
    lastsDays: [7, 10],
    water: third,
    care: careStd,
    sold: 12940,
    inBunches: true,
    inDiy: true,
  },
  {
    id: 'rose-spray',
    group: 'roses',
    name: { ru: 'Роза кустовая', uz: 'Shoxli atirgul' },
    latin: 'Rosa',
    kind: 'spray',
    shades: [sh('blush', 'Пудровая', 'Pudra', '#F4CDD4', '#E7AAB7'), sh('cream', 'Кремовая', 'Krem', '#F6EBD4', '#E8D5AE'), sh('hot', 'Малиновая', 'Malina', '#D9467A', '#B32E5E')],
    stemPrice: 26000,
    bunchSizes: [9, 15, 25],
    bunchDiscount: [0, 0.05, 0.1],
    stemCm: 50,
    lastsDays: [7, 10],
    water: third,
    note: { ru: 'На каждой ветке 4–7 бутонов — охапка выглядит пышнее, чем кажется по числу стеблей.', uz: "Har shoxda 4–7 g'uncha — guldasta poyalar sonidan ko'ra hajmliroq ko'rinadi." },
    care: careStd,
    sold: 3210,
    inBunches: true,
    inDiy: true,
  },
  {
    id: 'peony',
    group: 'peony',
    name: { ru: 'Пион Сара Бернар', uz: 'Sara Bernar pioni' },
    latin: 'Paeonia',
    kind: 'peony',
    shades: [sh('pink', 'Розовый', 'Pushti', '#F3C2CF', '#E59AB0'), sh('white', 'Белый', 'Oq', '#FBF4F0', '#EFDCD3'), sh('coral', 'Коралловый', 'Marjon', '#F2977F', '#E0735B', false)],
    stemPrice: 65000,
    bunchSizes: [5, 9, 15],
    bunchDiscount: [0, 0.05, 0.08],
    stemCm: 50,
    lastsDays: [4, 6],
    water: half,
    note: { ru: 'Приезжают бутонами и раскрываются за сутки в тёплой воде.', uz: "G'uncha holida keladi va iliq suvda bir kunda ochiladi." },
    care: careStd,
    sold: 960,
    badge: 'season',
    leftBunches: 3,
    inBunches: true,
    inDiy: true,
  },
  {
    id: 'tulip',
    group: 'tulip',
    name: { ru: 'Тюльпан', uz: 'Lola' },
    latin: 'Tulipa',
    kind: 'tulip',
    shades: [sh('yellow', 'Жёлтый', 'Sariq', '#F6C343', '#E3A51E'), sh('pink', 'Розовый', 'Pushti', '#EE8FA6', '#D96884'), sh('white', 'Белый', 'Oq', '#FBF9F2', '#E5E1D2'), sh('red', 'Красный', 'Qizil', '#D63A3A', '#B02626')],
    stemPrice: 11000,
    bunchSizes: [15, 25, 51],
    bunchDiscount: [0, 0.05, 0.1],
    stemCm: 40,
    lastsDays: [5, 7],
    water: little,
    note: { ru: 'Тюльпаны тянутся к свету и растут в вазе — подрезайте раз в 2 дня.', uz: "Lolalar yorug'likka intiladi va guldonda o'sadi — har 2 kunda kesib turing." },
    care: careStd,
    sold: 7400,
    badge: 'new',
    inBunches: true,
    inDiy: true,
  },
  {
    id: 'ranunculus',
    group: 'other',
    name: { ru: 'Ранункулюс', uz: 'Ranunkulus' },
    latin: 'Ranunculus',
    kind: 'ranunculus',
    shades: [sh('peach', 'Персиковый', 'Shaftoli', '#F7B993', '#E9946A'), sh('white', 'Белый', 'Oq', '#FBF6EE', '#EADFCC'), sh('pink', 'Розовый', 'Pushti', '#F2A7B9', '#DD7F97')],
    stemPrice: 28000,
    bunchSizes: [9, 15],
    bunchDiscount: [0, 0.06],
    stemCm: 40,
    lastsDays: [6, 9],
    water: little,
    care: careStd,
    sold: 1280,
    inBunches: true,
    inDiy: true,
  },
  {
    id: 'eustoma',
    group: 'other',
    name: { ru: 'Эустома', uz: 'Eustoma' },
    latin: 'Eustoma',
    kind: 'eustoma',
    shades: [sh('white', 'Белая', 'Oq', '#FAF8F2', '#E7E2D2'), sh('lilac', 'Лиловая', 'Binafsha', '#B79AD6', '#9677BE'), sh('green', 'Зеленоватая', 'Yashilroq', '#E4EDCF', '#C9D9A6')],
    stemPrice: 24000,
    bunchSizes: [9, 15],
    bunchDiscount: [0, 0.06],
    stemCm: 60,
    lastsDays: [8, 12],
    water: third,
    care: careStd,
    sold: 2050,
    inBunches: true,
    inDiy: true,
  },
  {
    id: 'carnation',
    group: 'other',
    name: { ru: 'Гвоздика', uz: 'Chinnigul' },
    latin: 'Dianthus',
    kind: 'carnation',
    shades: [sh('pink', 'Розовая', 'Pushti', '#F0A8BB', '#DD8199'), sh('white', 'Белая', 'Oq', '#FAF7F1', '#E6DECF'), sh('burgundy', 'Бордовая', 'Bordo', '#8E2440', '#6E1730')],
    stemPrice: 12000,
    bunchSizes: [15, 25],
    bunchDiscount: [0, 0.06],
    stemCm: 60,
    lastsDays: [10, 14],
    water: third,
    care: careStd,
    sold: 3900,
    inBunches: true,
    inDiy: true,
  },
  {
    id: 'alstro',
    group: 'other',
    name: { ru: 'Альстромерия', uz: 'Alstromeriya' },
    latin: 'Alstroemeria',
    kind: 'alstro',
    shades: [sh('mix', 'Микс', 'Miks', '#F2A35E', '#E8667A'), sh('white', 'Белая', 'Oq', '#FAF6EE', '#E7DCC8')],
    stemPrice: 16000,
    bunchSizes: [10, 20],
    bunchDiscount: [0, 0.06],
    stemCm: 60,
    lastsDays: [10, 14],
    water: third,
    care: careStd,
    sold: 1460,
    inBunches: true,
    inDiy: true,
  },
  {
    id: 'hydrangea',
    group: 'other',
    name: { ru: 'Гортензия', uz: 'Gortenziya' },
    latin: 'Hydrangea',
    kind: 'hydrangea',
    shades: [sh('blue', 'Голубая', 'Havorang', '#A9BCE6', '#8098D2'), sh('white', 'Белая', 'Oq', '#F4F6F0', '#DDE3D3')],
    stemPrice: 55000,
    bunchSizes: [3, 5],
    bunchDiscount: [0, 0.05],
    stemCm: 50,
    lastsDays: [5, 8],
    water: half,
    note: { ru: 'Любит много воды: если голова поникла — опустите её в воду на час.', uz: "Ko'p suv yoqtiradi: boshi egilsa — bir soatga suvga botiring." },
    care: careStd,
    sold: 610,
    inBunches: true,
    inDiy: true,
  },
  {
    id: 'gyps',
    group: 'green',
    name: { ru: 'Гипсофила', uz: 'Gipsofila' },
    kind: 'gyps',
    shades: [sh('white', 'Белая', 'Oq', '#FFFFFF', '#E9ECE4')],
    stemPrice: 18000,
    bunchSizes: [3, 5],
    bunchDiscount: [0, 0.05],
    stemCm: 60,
    lastsDays: [7, 12],
    water: third,
    care: careStd,
    sold: 1840,
    inBunches: true,
    inDiy: true,
    filler: true,
  },
  {
    id: 'eucalyptus',
    group: 'green',
    name: { ru: 'Эвкалипт', uz: 'Evkalipt' },
    kind: 'eucalyptus',
    shades: [sh('green', 'Серебристый', 'Kumushrang', '#9DB7A5', '#7E9C8A')],
    stemPrice: 14000,
    bunchSizes: [5, 9],
    bunchDiscount: [0, 0.05],
    stemCm: 60,
    lastsDays: [10, 20],
    water: third,
    care: careStd,
    sold: 2200,
    inBunches: true,
    inDiy: true,
    filler: true,
  },
];

export const flowerById = (id: string) => flowers.find((f) => f.id === id)!;
export const shadeOf = (f: Flower, shadeId: string) => f.shades.find((s) => s.id === shadeId) ?? f.shades[0];

/** Цена охапки: стебли × цена стебля, со скидкой за размер, округление до 1 000 сум. */
export function bunchPrice(f: Flower, stems: number) {
  const i = f.bunchSizes.indexOf(stems);
  const d = i >= 0 ? f.bunchDiscount[i] : 0;
  return Math.round((stems * f.stemPrice * (1 - d)) / 1000) * 1000;
}

/** «Собери сам»: минимальная сумма и максимум стеблей в одной коробке. */
export const DIY = { minSum: 150000, maxStems: 41, boxPrice: 0 };

export const addons: Addon[] = [
  { id: 'a1', name: { ru: 'Ваза стеклянная', uz: 'Shisha guldon' }, price: 95000, emoji: '🫙' },
  { id: 'a2', name: { ru: 'Подкормка для цветов', uz: "Gullar uchun o'g'it" }, price: 8000, emoji: '🧪' },
  { id: 'a3', name: { ru: 'Конфеты Raffaello', uz: 'Raffaello konfetlari' }, price: 75000, emoji: '🍬' },
  { id: 'a4', name: { ru: 'Секатор', uz: 'Sekator' }, price: 65000, emoji: '✂️' },
];

// Тестовые адреса вместо подсказок карт (в рабочей версии — Google Maps / 2ГИС)
export const addressSuggestions = [
  { title: 'ул. Шота Руставели, 41', area: 'Яккасарайский район', km: 3.2 },
  { title: 'ул. Амира Темура, 107Б', area: 'Юнусабадский район', km: 6.8 },
  { title: 'массив Чиланзар, 9-й квартал, 14', area: 'Чиланзарский район', km: 9.4 },
  { title: 'ул. Мирзо-Улугбека, 56', area: 'Мирзо-Улугбекский район', km: 7.1 },
  { title: 'ТЦ Samarqand Darvoza', area: 'Шайхантахурский район', km: 5.5 },
  { title: 'ул. Нукус, 22', area: 'Мирабадский район', km: 1.6 },
];

// Тариф такси для запасной формулы (в рабочей версии цену даёт API Яндекс Доставки)
export const taxi = { base: 12000, perKm: 2600, min: 15000 };

export const DAY_LIMIT = { normal: 50, holiday: 200 };
export const HOLIDAYS = ['02-14', '03-08'];
export const SLOTS = ['09:00–11:00', '11:00–13:00', '13:00–15:00', '15:00–17:00', '17:00–19:00', '19:00–21:00'];
