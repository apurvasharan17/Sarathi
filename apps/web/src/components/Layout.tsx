import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function Layout({ children, title, showBack }: LayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-600 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-primary-700 rounded-lg"
            >
              ← {t('common.back')}
            </button>
          )}
          <h1 className="text-xl font-bold">{title || t('app.name')}</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

