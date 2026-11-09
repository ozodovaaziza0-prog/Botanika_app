import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { addons, products, type Lang, type L10n } from './data';
import { tgUser } from './telegram';

export type Screen =
  | { name: 'catalog' }
  | { name: 'product'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'card' }
  | { name: 'pay'; orderId: string }
  | { name: 'success'; orderId: string }
  | { name: 'orders' }
  | { name: 'order'; id: string }
  | { name: 'profile' }
  | { name: 'recipient'; orderId: string };

export type Tab = 'catalog' | 'cart' | 'orders' | 'profile';

export interface CartLine {
  key: string;
  productId?: string;
  variantId?: string;
  addonId?: string;
  qty: number;
}

export interface CardState {
  text: string;
  to: string; // кому
  occasion: string;
  tone: string;
  name: string;
  signature: 'name' | 'anon';
  saveDate: boolean;
}

export interface SavedDate {
  id: string;
  who: string;
  name: string;
  occasion: string;
  day: string; // MM-DD
}

export type OrderStatus = 'paid' | 'accepted' | 'assembling' | 'ready' | 'courier' | 'delivered';

export interface Order {
  id: string;
  number: number;
  createdAt: string;
  lines: { title: string; qty: number; price: number }[];
  cartLines: CartLine[];
  itemsTotal: number;
  delivery: number;
  discount: number;
  total: number;
  date: string;
  slot: string;
  address: string;
  recipient: string;
  gift: boolean;
  askRecipient: boolean;
  card: string;
  payment: 'payme' | 'click' | 'cash';
  status: OrderStatus;
}

export const unitPrice = (l: CartLine) => {
  if (l.addonId) return addons.find((a) => a.id === l.addonId)!.price;
  const p = products.find((x) => x.id === l.productId)!;
  return p.variants.find((v) => v.id === l.variantId)!.price;
};

interface Store {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (v: L10n | string, uz?: string) => string;
  stack: Screen[];
  screen: Screen;
  go: (s: Screen) => void;
  back: () => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  cart: CartLine[];
  add: (l: Omit<CartLine, 'key' | 'qty'>, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  cartCount: number;
  itemsTotal: number;
  promo: string | null;
  setPromo: (p: string | null) => void;
  card: CardState;
  setCard: (c: Partial<CardState>) => void;
  user: { name: string; phone: string };
  setUser: (u: Partial<{ name: string; phone: string }>) => void;
  orders: Order[];
  placeOrder: (o: Omit<Order, 'id' | 'number' | 'createdAt' | 'status'>) => Order;
  setOrderStatus: (id: string, s: OrderStatus) => void;
  clearCart: () => void;
  savedDates: SavedDate[];
  addSavedDate: (d: Omit<SavedDate, 'id'>) => void;
  removeSavedDate: (id: string) => void;
  waitlist: boolean;
  setWaitlist: (b: boolean) => void;
}

const Ctx = createContext<Store | null>(null);

const rootFor: Record<Tab, Screen> = {
  catalog: { name: 'catalog' },
  cart: { name: 'cart' },
  orders: { name: 'orders' },
  profile: { name: 'profile' },
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const u = tgUser();
  const [lang, setLang] = useState<Lang>(u?.language_code === 'uz' ? 'uz' : 'ru');
  const [tab, setTabState] = useState<Tab>('catalog');
  const [stack, setStack] = useState<Screen[]>([{ name: 'catalog' }]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [promo, setPromo] = useState<string | null>(null);
  const [card, setCardState] = useState<CardState>({
    text: '',
    to: '',
    occasion: '',
    tone: 'tender',
    name: '',
    signature: 'name',
    saveDate: true,
  });
  const [user, setUserState] = useState({ name: u?.first_name ?? 'Азиза', phone: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedDates, setSavedDates] = useState<SavedDate[]>([
    { id: 'd0', who: 'Маме', name: 'Мама', occasion: 'День рождения', day: '12-03' },
  ]);
  const [waitlist, setWaitlist] = useState(false);

  const store = useMemo<Store>(() => {
    const t = (v: L10n | string, uz?: string) => (typeof v === 'string' ? (lang === 'uz' && uz ? uz : v) : v[lang]);
    const cartCount = cart.reduce((s, l) => s + (l.productId ? l.qty : 0), 0);
    const itemsTotal = cart.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
    return {
      lang,
      setLang,
      t,
      stack,
      screen: stack[stack.length - 1],
      go: (s) => {
        setStack((st) => [...st, s]);
        window.scrollTo(0, 0);
      },
      back: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
      tab,
      setTab: (tb) => {
        setTabState(tb);
        setStack([rootFor[tb]]);
        window.scrollTo(0, 0);
      },
      cart,
      add: (l, qty = 1) =>
        setCart((c) => {
          const key = l.addonId ?? `${l.productId}:${l.variantId}`;
          const ex = c.find((x) => x.key === key);
          if (ex) return c.map((x) => (x.key === key ? { ...x, qty: x.qty + qty } : x));
          return [...c, { ...l, key, qty }];
        }),
      setQty: (key, qty) => setCart((c) => (qty <= 0 ? c.filter((x) => x.key !== key) : c.map((x) => (x.key === key ? { ...x, qty } : x)))),
      cartCount,
      itemsTotal,
      promo,
      setPromo,
      card,
      setCard: (c) => setCardState((s) => ({ ...s, ...c })),
      user,
      setUser: (p) => setUserState((s) => ({ ...s, ...p })),
      orders,
      placeOrder: (o) => {
        const order: Order = {
          ...o,
          id: `o${Date.now()}`,
          number: 1042 + orders.length,
          createdAt: new Date().toISOString(),
          status: 'paid',
        };
        setOrders((os) => [order, ...os]);
        return order;
      },
      setOrderStatus: (id, s) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: s } : o))),
      clearCart: () => {
        setCart([]);
        setPromo(null);
        setCardState((c) => ({ ...c, text: '', name: '', to: '', occasion: '' }));
      },
      savedDates,
      addSavedDate: (d) => setSavedDates((s) => [...s, { ...d, id: `d${Date.now()}` }]),
      removeSavedDate: (id) => setSavedDates((s) => s.filter((x) => x.id !== id)),
      waitlist,
      setWaitlist,
    };
  }, [lang, stack, tab, cart, promo, card, user, orders, savedDates, waitlist]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider missing');
  return s;
};
