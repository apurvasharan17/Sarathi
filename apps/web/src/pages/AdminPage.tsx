import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';

export default function AdminPage() {
  const { t } = useTranslation();
  const [months, setMonths] = useState('6');
  const [amount, setAmount] = useState('2500');
  const [counterparty, setCounterparty] = useState('+919999999999');

  const seedMutation = useMutation({
    mutationFn: () =>
      api.seedData(parseInt(months), parseInt(amount), counterparty),
    onSuccess: data => {
      alert(
        `${t('admin.seedSuccess')}\nScore: ${data.score.score} (${data.score.band})`
      );
    },
  });

  return (
    <Layout title={t('admin.title')} showBack>
      <div className="card">
        <h2 className="text-xl font-bold mb-4">{t('admin.seedData')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.months')}
            </label>
            <input
              type="number"
              className="input"
              value={months}
              onChange={e => setMonths(e.target.value)}
              min="1"
              max="12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.amount')}
            </label>
            <input
              type="number"
              className="input"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('sendMoney.counterparty')}
            </label>
            <input
              type="tel"
              className="input"
              value={counterparty}
              onChange={e => setCounterparty(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary w-full"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
          >
            {seedMutation.isPending ? t('common.loading') : t('admin.seed')}
          </button>

          {seedMutation.isError && (
            <p className="text-red-600 text-sm">
              {(seedMutation.error as Error).message}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

