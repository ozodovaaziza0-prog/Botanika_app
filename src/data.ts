// Тестовые данные прототипа. В рабочей версии всё это приходит из API и админки.

export type Lang = 'ru' | 'uz';
export type L10n = { ru: string; uz: string };

export type FlowerKind = 'rose' | 'peony' | 'tulip' | 'chrys' | 'mix' | 'hydrangea';
export type Wrap = 'paper' | 'box' | 'basket' | 'vase';

export interface Variant {
  id: string;
  label: L10n;
  price: number;
  stems: number;
}

export interface Product {
  id: string;
  category: string;
  name: L10n;
  composition: L10n;
  variants: Variant[];
  oldPrice?: number; // для первого варианта
  badge?: 'hit' | 'new' | 'sale' | 'few';
  left?: number;
  sold: number;
  lastsDays: [number, number];
  water: L10n;
  care: L10n;
  colors: string[]; // палитра для иллюстрации
  kind: FlowerKind;
  wrap: Wrap;
  occasions: string[];
  available: boolean;
  sizeCm: string;
}

export interface Addon {
  id: string;
  name: L10n;
  price: number;
  emoji: string;
}

export const categories: { id: string; name: L10n }[] = [
  { id: 'all', name: { ru: 'Все', uz: 'Hammasi' } },
  { id: 'author', name: { ru: 'Авторские', uz: 'Muallif guldastalari' } },
  { id: 'mono', name: { ru: 'Монобукеты', uz: 'Monobuketlar' } },
  { id: 'roses', name: { ru: 'Розы', uz: 'Atirgullar' } },
  { id: 'box', name: { ru: 'В коробке', uz: 'Qutida' } },
  { id: 'basket', name: { ru: 'Корзины', uz: 'Savatlar' } },
];

export const occasions: { id: string; name: L10n }[] = [
  { id: 'love', name: { ru: 'Любимой', uz: 'Sevimliga' } },
  { id: 'mom', name: { ru: 'Маме', uz: 'Onaga' } },
  { id: 'birthday', name: { ru: 'День рождения', uz: "Tug'ilgan kun" } },
  { id: 'thanks', name: { ru: 'Спасибо', uz: 'Rahmat' } },
  { id: 'office', name: { ru: 'Коллеге', uz: 'Hamkasbga' } },
];

const v = (id: string, ru: string, uz: string, price: number, stems: number): Variant => ({
  id,
  label: { ru, uz },
  price,
  stems,
});

const water7 = { ru: 'Свежая вода каждые 2 дня', uz: 'Har 2 kunda yangi suv' };
const careStd = {
  ru: 'Подрежьте стебли наискосок на 2 см, уберите листья ниже уровня воды, держите вдали от солнца и батарей.',
  uz: "Poyalarni qiya qilib 2 sm kesing, suv ostidagi barglarni olib tashlang, quyosh va isitgichdan uzoqda saqlang.",
};

export const products: Product[] = [
  {
    id: 'p1',
    category: 'author',
    name: { ru: 'Утро в Чиланзаре', uz: 'Chilonzorda tong' },
    composition: { ru: 'Кустовая роза, эустома, ранункулюс, эвкалипт', uz: "Shoxli atirgul, eustoma, ranunkulus, evkalipt" },
    variants: [v('s', 'S', 'S', 390000, 11), v('m', 'M', 'M', 520000, 17), v('l', 'L', 'L', 690000, 25)],
    badge: 'hit',
    sold: 412,
    lastsDays: [6, 9],
    water: water7,
    care: careStd,
    colors: ['#F2C7CF', '#E89AAE', '#FFF4EC', '#9DB7A5'],
    kind: 'mix',
    wrap: 'paper',
    occasions: ['love', 'birthday', 'mom'],
    available: true,
    sizeCm: '45 × 35',
  },
  {
    id: 'p2',
    category: 'roses',
    name: { ru: 'Розы Кения', uz: 'Keniya atirgullari' },
    composition: { ru: 'Роза Кения 40 см', uz: 'Keniya atirguli 40 sm' },
    variants: [v('15', '15 шт', '15 dona', 285000, 15), v('25', '25 шт', '25 dona', 450000, 25), v('51', '51 шт', '51 dona', 890000, 51)],
    oldPrice: 320000,
    badge: 'sale',
    sold: 2380,
    lastsDays: [7, 10],
    water: { ru: 'Вода на ⅓ стебля', uz: "Poyaning ⅓ qismigacha suv" },
    care: careStd,
    colors: ['#C8304F', '#A8233F', '#E0566F'],
    kind: 'rose',
    wrap: 'paper',
    occasions: ['love', 'birthday'],
    available: true,
    sizeCm: '40 × 30',
  },
  {
    id: 'p3',
    category: 'mono',
    name: { ru: 'Пионы Сара Бернар', uz: 'Sara Bernar pionlari' },
    composition: { ru: 'Пион Сара Бернар', uz: 'Sara Bernar pioni' },
    variants: [v('7', '7 шт', '7 dona', 420000, 7), v('15', '15 шт', '15 dona', 850000, 15)],
    badge: 'few',
    left: 3,
    sold: 186,
    lastsDays: [4, 6],
    water: { ru: 'Много воды, раскрываются за сутки', uz: "Ko'p suv, bir kunda ochiladi" },
    care: careStd,
    colors: ['#F6C9D3', '#EDA6B8', '#FBE2E8'],
    kind: 'peony',
    wrap: 'paper',
    occasions: ['love', 'mom'],
    available: true,
    sizeCm: '40 × 35',
  },
  {
    id: 'p4',
    category: 'mono',
    name: { ru: 'Тюльпаны микс', uz: 'Lolalar miks' },
    composition: { ru: 'Тюльпаны трёх цветов', uz: 'Uch rangli lolalar' },
    variants: [v('25', '25 шт', '25 dona', 260000, 25), v('51', '51 шт', '51 dona', 510000, 51)],
    badge: 'new',
    sold: 97,
    lastsDays: [5, 7],
    water: { ru: 'Холодная вода, немного', uz: 'Ozgina sovuq suv' },
    care: careStd,
    colors: ['#F7B43C', '#E8667A', '#FFFFFF'],
    kind: 'tulip',
    wrap: 'paper',
    occasions: ['mom', 'office', 'thanks'],
    available: true,
    sizeCm: '45 × 30',
  },
  {
    id: 'p5',
    category: 'box',
    name: { ru: 'Шляпная коробка «Нежность»', uz: "«Nafislik» quti" },
    composition: { ru: 'Роза, гвоздика, гипсофила в коробке', uz: "Atirgul, chinnigul, gipsofila qutida" },
    variants: [v('m', 'M', 'M', 480000, 21), v('l', 'L', 'L', 640000, 31)],
    sold: 264,
    lastsDays: [7, 12],
    water: { ru: 'Поливайте губку раз в 2 дня', uz: "Gubkani har 2 kunda sug'oring" },
    care: { ru: 'Не доставайте цветы — они стоят во влажной флористической губке.', uz: "Gullarni chiqarmang — ular nam gubkada turadi." },
    colors: ['#F4D3DA', '#FFFFFF', '#E7B1BF'],
    kind: 'mix',
    wrap: 'box',
    occasions: ['love', 'mom', 'birthday'],
    available: true,
    sizeCm: '25 × 25',
  },
  {
    id: 'p6',
    category: 'author',
    name: { ru: 'Сад Мирабада', uz: "Mirobod bog'i" },
    composition: { ru: 'Гортензия, роза, маттиола, зелень', uz: "Gortenziya, atirgul, mattiola, ko'kat" },
    variants: [v('m', 'M', 'M', 610000, 15), v('l', 'L', 'L', 820000, 21)],
    sold: 151,
    lastsDays: [5, 8],
    water: water7,
    care: careStd,
    colors: ['#B9C6E8', '#8EA2D6', '#F1E9F5', '#9DB7A5'],
    kind: 'hydrangea',
    wrap: 'paper',
    occasions: ['mom', 'thanks', 'birthday'],
    available: true,
    sizeCm: '50 × 40',
  },
  {
    id: 'p7',
    category: 'mono',
    name: { ru: 'Хризантема кустовая', uz: 'Shoxli xrizantema' },
    composition: { ru: 'Хризантема кустовая', uz: 'Shoxli xrizantema' },
    variants: [v('9', '9 шт', '9 dona', 210000, 9), v('15', '15 шт', '15 dona', 330000, 15)],
    sold: 640,
    lastsDays: [10, 20],
    water: { ru: 'Вода на ⅓ стебля', uz: "Poyaning ⅓ qismigacha suv" },
    care: careStd,
    colors: ['#F2E9D0', '#E9D79C', '#FFFFFF'],
    kind: 'chrys',
    wrap: 'paper',
    occasions: ['office', 'thanks', 'mom'],
    available: true,
    sizeCm: '45 × 35',
  },
  {
    id: 'p8',
    category: 'basket',
    name: { ru: 'Корзина «Праздник»', uz: "«Bayram» savati" },
    composition: { ru: 'Роза, хризантема, альстромерия, зелень', uz: "Atirgul, xrizantema, alstromeriya, ko'kat" },
    variants: [v('m', 'M', 'M', 750000, 35), v('l', 'L', 'L', 1150000, 55)],
    sold: 73,
    lastsDays: [7, 10],
    water: { ru: 'Поливайте губку раз в 2 дня', uz: "Gubkani har 2 kunda sug'oring" },
    care: { ru: 'Корзина стоит во влажной губке — доливайте воду в центр.', uz: "Savat nam gubkada turadi — o'rtasiga suv qo'shing." },
    colors: ['#F28C5B', '#F6C35B', '#E8667A', '#9DB7A5'],
    kind: 'mix',
    wrap: 'basket',
    occasions: ['birthday', 'office', 'thanks'],
    available: true,
    sizeCm: '55 × 45',
  },
  {
    id: 'p9',
    category: 'roses',
    name: { ru: 'Белые розы Аваланш', uz: 'Oq atirgullar Avalansh' },
    composition: { ru: 'Роза Аваланш 60 см', uz: 'Avalansh atirguli 60 sm' },
    variants: [v('11', '11 шт', '11 dona', 330000, 11), v('25', '25 шт', '25 dona', 720000, 25)],
    sold: 302,
    lastsDays: [8, 12],
    water: { ru: 'Вода на ⅓ стебля', uz: "Poyaning ⅓ qismigacha suv" },
    care: careStd,
    colors: ['#FFFFFF', '#F3F0E6', '#E8E4D6'],
    kind: 'rose',
    wrap: 'paper',
    occasions: ['love', 'office'],
    available: false,
    sizeCm: '60 × 30',
  },
];

export const addons: Addon[] = [
  { id: 'a1', name: { ru: 'Ваза стеклянная', uz: 'Shisha guldon' }, price: 95000, emoji: '🫙' },
  { id: 'a2', name: { ru: 'Шары, 3 шт', uz: 'Sharlar, 3 dona' }, price: 60000, emoji: '🎈' },
  { id: 'a3', name: { ru: 'Конфеты Raffaello', uz: 'Raffaello konfetlari' }, price: 75000, emoji: '🍬' },
  { id: 'a4', name: { ru: 'Мягкий мишка', uz: 'Yumshoq ayiqcha' }, price: 120000, emoji: '🧸' },
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
