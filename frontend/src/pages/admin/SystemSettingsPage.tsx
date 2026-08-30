import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../api/dashboardApi';
import { SystemSetting } from '../../types/dashboard';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Settings, Save, Clock, DollarSign, BookMarked, ShieldCheck } from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    settingsApi
      .getSettings()
      .then((res) => {
        if (res.data) {
          setSettings(res.data);
          const initial: { [key: string]: string } = {};
          res.data.forEach((s) => {
            initial[s.settingKey] = s.settingValue;
          });
          setFormValues(initial);
        }
      })
      .catch((err) => {
        error('Failed to Load Settings', err.response?.data?.message || 'Error');
      })
      .finally(() => setIsLoading(false));
  }, [error]);

  const handleSave = async (key: string, description?: string) => {
    setIsSaving(true);
    try {
      await settingsApi.updateSetting(key, formValues[key], description);
      success('Setting Updated', `Rule "${key}" has been updated.`);
    } catch (err: any) {
      error('Update Failed', err.response?.data?.message || 'Error saving setting');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      for (const setting of settings) {
        await settingsApi.updateSetting(setting.settingKey, formValues[setting.settingKey], setting.description);
      }
      success('Settings Saved', 'All library circulation rules and parameters updated successfully.');
    } catch (err: any) {
      error('Error Saving Settings', err.response?.data?.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading system parameters..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          System Settings & Library Policies
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure automated circulation parameters, loan expiration periods, and fine calculation rules
        </p>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Borrowing & Loan Duration
              </h3>
              <p className="text-xs text-slate-500">Standard checkout timeframe for members</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Borrow Duration (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                required
                value={formValues['DEFAULT_BORROW_DAYS'] || '14'}
                onChange={(e) =>
                  setFormValues({ ...formValues, DEFAULT_BORROW_DAYS: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-slate-400 mt-1">Number of days allowed before a book is marked overdue</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Active Loans Per Member
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={formValues['MAX_ACTIVE_LOANS'] || '5'}
                onChange={(e) =>
                  setFormValues({ ...formValues, MAX_ACTIVE_LOANS: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-slate-400 mt-1">Limit on simultaneous unreturned books per reader</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Overdue Fines & Penalties
              </h3>
              <p className="text-xs text-slate-500">Automated daily penalty assessment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fine Amount Per Overdue Day (USD $)
              </label>
              <input
                type="number"
                step="0.25"
                min={0}
                max={50}
                required
                value={formValues['FINE_PER_DAY'] || '1.50'}
                onChange={(e) =>
                  setFormValues({ ...formValues, FINE_PER_DAY: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-slate-400 mt-1">Rate multiplied by overdue days upon return</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
