import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: api.getMe,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-20">{t('common.loading')}</div>
      </Layout>
    );
  }

  const tiles = [
    { number: 1, label: t('home.tiles.sendMoney'), path: '/send-money' },
    { number: 2, label: t('home.tiles.creditScore'), path: '/score' },
    { number: 3, label: t('home.tiles.loan'), path: '/loan', badge: data?.activeLoan ? '!' : null },
    { number: 4, label: t('home.tiles.transactions'), path: '/transactions' },
    { number: 5, label: t('home.tiles.changeState'), path: '/settings' },
    { number: 6, label: t('home.tiles.help'), path: '/admin' },
  ];

  return (
    <Layout title={t('app.name')}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('home.welcome', { name: data?.user.sarathiId.substring(0, 8) })}
        </h2>
        <p className="text-gray-600">{t('home.sarathiId', { id: data?.user.sarathiId })}</p>
        {data?.latestScore && (
          <div className="mt-4 card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('score.title')}</p>
                <p className="text-3xl font-bold text-primary-600">
                  {data.latestScore.score}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('score.band', { band: data.latestScore.band })}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {tiles.map(tile => (
          <div
            key={tile.number}
            className="tile relative"
            onClick={() => navigate(tile.path)}
          >
            {tile.badge && (
              <span className="absolute top-3 right-3 badge">{tile.badge}</span>
            )}
            <div className="tile-number">{tile.number}</div>
            <div className="tile-label">{tile.label}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

