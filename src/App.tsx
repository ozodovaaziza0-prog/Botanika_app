import { useEffect } from 'react';
import { useStore, type Tab } from './store';
import { Catalog } from './screens/Catalog';
import { Product } from './screens/Product';
import { Diy } from './screens/Diy';
import { Cart } from './screens/Cart';
import { Checkout } from './screens/Checkout';
import { OrderDetail, Orders, Pay, Success } from './screens/Orders';
import { Profile, RecipientLink } from './screens/Profile';
import { tg } from './telegram';

const icons: Record<Tab, JSX.Element> = {
  catalog: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.2" /><path d="M12 11.2V21M12 15c-2.5 0-4.5-1.6-5-4M12 17c2.4 0 4.3-1.5 4.8-3.8" /><circle cx="8" cy="6" r="2" /><circle cx="16" cy="6" r="2" /></svg>,
  cart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>,
  orders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="3.5" width="14" height="17" rx="2.5" /><path d="M9 9h6M9 13h6M9 17h3" /></svg>,
  profile: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></svg>,
};

export function App() {
  const { screen, tab, setTab, cartCount, orders, t, stack, back } = useStore();

  // системная кнопка «Назад» Telegram
  useEffect(() => {
    if (!tg?.BackButton) return;
    if (stack.length > 1) {
      tg.BackButton.show();
      tg.BackButton.onClick(back);
      return () => tg?.BackButton?.offClick(back);
    }
    tg.BackButton.hide();
  }, [stack, back]);

  const hideTabs = ['checkout', 'pay', 'success', 'recipient', 'order', 'diy'].includes(screen.name);
  const activeOrders = orders.filter((o) => o.status !== 'delivered').length;

  let body: JSX.Element;
  switch (screen.name) {
    case 'catalog': body = <Catalog />; break;
    case 'product': body = <Product id={screen.id} key={screen.id} />; break;
    case 'diy': body = <Diy />; break;
    case 'cart': body = <Cart />; break;
    case 'checkout': body = <Checkout />; break;
    case 'pay': body = <Pay orderId={screen.orderId} />; break;
    case 'success': body = <Success orderId={screen.orderId} />; break;
    case 'orders': body = <Orders />; break;
    case 'order': body = <OrderDetail id={screen.id} />; break;
    case 'profile': body = <Profile />; break;
    case 'recipient': body = <RecipientLink orderId={screen.orderId} />; break;
    default: body = <Catalog />;
  }

  const labels: Record<Tab, string> = {
    catalog: t('Каталог', 'Katalog'),
    cart: t('Корзина', 'Savat'),
    orders: t('Заказы', 'Buyurtmalar'),
    profile: t('Профиль', 'Profil'),
  };

  return (
    <div className="app">
      {body}
      {!hideTabs && (
        <nav className="tabbar" aria-label={t('Разделы', "Bo'limlar")}>
          <div className="tabbar-in">
            {(Object.keys(icons) as Tab[]).map((k) => (
              <button key={k} aria-current={tab === k ? 'page' : undefined} onClick={() => setTab(k)}>
                {icons[k]}
                {labels[k]}
                {k === 'cart' && cartCount > 0 && <span className="badge">{cartCount}</span>}
                {k === 'orders' && activeOrders > 0 && <span className="badge">{activeOrders}</span>}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
