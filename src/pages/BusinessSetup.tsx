import { useState } from 'react';
import { ArrowRight, Building2, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { createBusiness } from '@/lib/dataLoader';
import type { BusinessProfile } from '@/lib/types';

interface BusinessSetupProps {
  onComplete: (business: BusinessProfile) => void;
  onBack: () => void;
}

const inputClass = 'w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function BusinessSetup({ onComplete, onBack }: BusinessSetupProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('Rwanda');
  const [city, setCity] = useState('');
  const [currency, setCurrency] = useState('RWF');
  const [description, setDescription] = useState('');
  const [employees, setEmployees] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Business name is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      const profile = await createBusiness({
        name: name.trim(),
        type: type.trim(),
        industry: industry.trim(),
        country: country.trim(),
        city: city.trim(),
        currency,
        description: description.trim(),
        employees: parseInt(employees) || 0,
      });
      onComplete(profile);
    } catch (e) {
      setError(`Failed to create business: ${(e as Error).message}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={onBack}>
            <Logo size={40} />
          </button>
          <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Back
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-500/10 rounded-xl">
            <Building2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Set Up Your Business</h1>
            <p className="text-sm text-slate-400">Tell CORA about your business so it can start analyzing</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <Field label="Business Name *">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amahoro Trading Ltd" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business Type">
              <input className={inputClass} value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Retail, Services" />
            </Field>
            <Field label="Industry">
              <input className={inputClass} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Wholesale Trade" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Country">
              <input className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Rwanda" />
            </Field>
            <Field label="City">
              <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kigali" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Currency">
              <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="RWF">RWF (Rwandan Franc)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="KES">KES (Kenyan Shilling)</option>
                <option value="UGX">UGX (Ugandan Shilling)</option>
                <option value="NGN">NGN (Nigerian Naira)</option>
                <option value="GHS">GHS (Ghanaian Cedi)</option>
              </select>
            </Field>
            <Field label="Number of Employees">
              <input type="number" min="0" className={inputClass} value={employees} onChange={(e) => setEmployees(e.target.value)} />
            </Field>
          </div>

          <Field label="Business Description">
            <textarea className={`${inputClass} resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your business do?" />
          </Field>

          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {submitting ? 'Creating...' : <>Create My Business <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          Your business data is saved and private. You can add products, customers, sales, and more after setup.
        </div>
      </div>
    </div>
  );
}
