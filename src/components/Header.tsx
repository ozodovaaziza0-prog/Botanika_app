import { useStore } from '../store';

export function Header({ title, noBack }: { title: string; noBack?: boolean }) {
  const { back, stack, t } = useStore();
  const canBack = !noBack && stack.length > 1;
  return (
    <header className="top">
      <div className="title-row">
        {canBack && (
          <button className="back" onClick={back} aria-label={t('Назад', 'Orqaga')}>
            ←
          </button>
        )}
        {title && <h1>{title}</h1>}
      </div>
    </header>
  );
}
