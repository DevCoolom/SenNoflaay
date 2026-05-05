import React, { useState } from 'react';
import { Settings as SettingsIcon, Image as ImageIcon, Type, Save, DollarSign, Calendar, Users } from 'lucide-react';
import { FormField, Input, Select } from './Modals';
import { useLanguage } from '../lib/LanguageContext';
import { MembershipFeeConfig } from '../types';

interface SettingsProps {
  settings: Record<string, string>;
  onUpdateSetting: (key: string, value: string) => void;
  membershipFeeConfig: MembershipFeeConfig | null;
  onUpdateFeeConfig: (config: Omit<MembershipFeeConfig, 'associationId'>) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSetting, membershipFeeConfig, onUpdateFeeConfig }) => {
  const { t } = useLanguage();
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '');
  const [appName, setAppName] = useState(settings.app_name || '');
  const [feeConfig, setFeeConfig] = useState<Omit<MembershipFeeConfig, 'associationId'>>({
    frequency: 'yearly',
    period: 'yearly',
    amountAll: 0,
    amountMale: 0,
    amountFemale: 0,
    amountMinor: 0,
    useCategories: false
  });
  const [showAppConfirmation, setShowAppConfirmation] = useState(false);
  const [showFeeConfirmation, setShowFeeConfirmation] = useState(false);

  React.useEffect(() => {
    if (membershipFeeConfig) {
      setFeeConfig(membershipFeeConfig);
    }
  }, [membershipFeeConfig]);

  const handleSaveFeeConfig = () => {
    onUpdateFeeConfig({
      ...feeConfig,
      period: feeConfig.period,
      amountAll: isNaN(feeConfig.amountAll) ? 0 : feeConfig.amountAll,
      amountMale: isNaN(feeConfig.amountMale) ? 0 : feeConfig.amountMale,
      amountFemale: isNaN(feeConfig.amountFemale) ? 0 : feeConfig.amountFemale,
      amountMinor: isNaN(feeConfig.amountMinor) ? 0 : feeConfig.amountMinor,
    });
    setShowFeeConfirmation(true);
    setTimeout(() => setShowFeeConfirmation(false), 3000);
  };

  const handleSave = () => {
    onUpdateSetting('logo_url', logoUrl);
    onUpdateSetting('app_name', appName);
    setShowAppConfirmation(true);
    setTimeout(() => setShowAppConfirmation(false), 3000);
    handleSaveFeeConfig();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-brand-50 rounded-3xl">
          <SettingsIcon className="w-8 h-8 text-brand-600" />
        </div>
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">{t('settings')}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('manageAppSettings')}</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 card-shadow space-y-8 transition-colors">
        <FormField label={t('logoUrl')} required>
          <div className="relative">
            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <Input 
              className="pl-12"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 ml-1">{t('logoUrlHelp')}</p>
        </FormField>

        <FormField label={t('appName')} required>
          <div className="relative">
            <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <Input 
              className="pl-12"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="SenNoflaay"
            />
          </div>
        </FormField>

        {logoUrl && (
          <div className="pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">{t('logoPreview')}</p>
            <div className="p-8 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100 flex justify-center">
              <img src={logoUrl} alt="Preview" className="h-32 w-auto object-contain" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          </div>
        )}

        <div className="pt-8 flex items-center justify-end gap-4">
          {showAppConfirmation && (
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
              {t('settingsSaved')}
            </p>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-100 active:scale-[0.98]"
          >
            <Save className="w-5 h-5" />
            {t('saveSettings')}
          </button>
        </div>
      </div>

      {/* Membership Fee Configuration */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 card-shadow space-y-8 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-xl font-serif font-bold text-slate-900">{t('membershipFees')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label={t('feeFrequency')} required>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Select 
                className="pl-12"
                value={feeConfig.frequency}
                onChange={(e) => setFeeConfig({ ...feeConfig, frequency: e.target.value as any })}
              >
                <option value="monthly">{t('monthly')}</option>
                <option value="yearly">{t('yearly')}</option>
              </Select>
            </div>
          </FormField>

          <FormField label={t('feePeriod')} required>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Select 
                className="pl-12"
                value={feeConfig.period}
                onChange={(e) => setFeeConfig({ ...feeConfig, period: e.target.value as any })}
              >
                <option value="monthly">{t('monthly')}</option>
                <option value="yearly">{t('yearly')}</option>
              </Select>
            </div>
          </FormField>

          <div className="flex items-center gap-3 pt-8">
            <input 
              type="checkbox"
              id="useCategories"
              checked={feeConfig.useCategories}
              onChange={(e) => setFeeConfig({ ...feeConfig, useCategories: e.target.checked })}
              className="w-5 h-5 rounded-lg text-brand-600 focus:ring-brand-500 border-slate-200"
            />
            <label htmlFor="useCategories" className="text-sm font-bold text-slate-700 uppercase tracking-widest cursor-pointer">
              {t('useCategories')}
            </label>
          </div>
        </div>

        {!feeConfig.useCategories ? (
          <FormField label={t('amountAll')} required>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input 
                type="number"
                className="pl-12"
                value={isNaN(feeConfig.amountAll) ? '' : feeConfig.amountAll}
                onChange={(e) => setFeeConfig({ ...feeConfig, amountAll: e.target.value === '' ? NaN : parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
          </FormField>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label={t('amountMale')} required>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input 
                  type="number"
                  className="pl-12"
                  value={isNaN(feeConfig.amountMale) ? '' : feeConfig.amountMale}
                  onChange={(e) => setFeeConfig({ ...feeConfig, amountMale: e.target.value === '' ? NaN : parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </FormField>
            <FormField label={t('amountFemale')} required>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input 
                  type="number"
                  className="pl-12"
                  value={isNaN(feeConfig.amountFemale) ? '' : feeConfig.amountFemale}
                  onChange={(e) => setFeeConfig({ ...feeConfig, amountFemale: e.target.value === '' ? NaN : parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </FormField>
            <FormField label={t('amountMinor')} required>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input 
                  type="number"
                  className="pl-12"
                  value={isNaN(feeConfig.amountMinor) ? '' : feeConfig.amountMinor}
                  onChange={(e) => setFeeConfig({ ...feeConfig, amountMinor: e.target.value === '' ? NaN : parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </FormField>
          </div>
        )}

        <div className="pt-8 flex items-center justify-end gap-4">
          {showFeeConfirmation && (
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
              {t('settingsSaved')}
            </p>
          )}
          <button
            onClick={handleSaveFeeConfig}
            className="flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-100 active:scale-[0.98]"
          >
            <Save className="w-5 h-5" />
            {t('saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
