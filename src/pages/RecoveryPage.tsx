import { useState } from 'react';
import { Bell, Copy, Check, Phone, MessageSquare } from 'lucide-react';
import type { BusinessData } from '@/lib/types';
import { getOverdueInvoices, getCustomerName } from '@/lib/analytics';
import { formatRWF, formatDate, daysSince } from '@/lib/format';
import { ChartCard } from '@/components/ChartCard';

interface RecoveryPageProps {
  data: BusinessData;
}

export function RecoveryPage({ data }: RecoveryPageProps) {
  const overdue = getOverdueInvoices(data);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateReminder = (invoiceId: string): string => {
    const inv = overdue.find((i) => i.id === invoiceId);
    if (!inv) return '';
    const name = getCustomerName(data, inv.customerId).split(' ')[0];
    const balance = inv.amount - inv.paidAmount;
    const customer = data.customers.find((c) => c.id === inv.customerId);
    const phone = customer?.phone ?? '';
    return `Hello ${name}, this is a friendly reminder that invoice #${inv.invoiceNumber} has an outstanding balance of ${formatRWF(balance)}. It was due on ${formatDate(inv.dueDate)}. Please let us know when we can expect payment. Thank you — ${data.business.name}.`;
  };

  const handleCopy = async (invoiceId: string, message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(invoiceId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(textarea);
      setCopiedId(invoiceId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const totalOverdue = overdue.reduce((s, i) => s + (i.amount - i.paidAmount), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-red-500/10 rounded-xl">
          <Bell className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Payment Recovery</h1>
          <p className="text-sm text-slate-400">Generate reminders for overdue invoices</p>
        </div>
      </div>

      {/* Summary */}
      {overdue.length > 0 ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6">
          <div className="text-sm text-red-300 font-medium">{overdue.length} overdue invoice{overdue.length === 1 ? '' : 's'}</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{formatRWF(totalOverdue)}</div>
          <div className="text-xs text-red-400/70 mt-1">Total outstanding balance past due date</div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 mb-6 text-center">
          <Check className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <div className="text-sm font-medium text-emerald-300">All invoices are current</div>
          <div className="text-xs text-emerald-400/70 mt-1">No overdue payments to collect</div>
        </div>
      )}

      {/* Overdue invoice cards with reminders */}
      {overdue.length > 0 && (
        <ChartCard title="Overdue Invoices & Reminders">
          <div className="space-y-4">
            {overdue.map((inv) => {
              const name = getCustomerName(data, inv.customerId);
              const customer = data.customers.find((c) => c.id === inv.customerId);
              const balance = inv.amount - inv.paidAmount;
              const message = generateReminder(inv.id);
              const overdueDays = daysSince(inv.dueDate);
              const isCopied = copiedId === inv.id;

              return (
                <div key={inv.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">{name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {customer?.phone}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-red-400 tabular-nums">{formatRWF(balance)}</div>
                      <div className="text-xs text-slate-500">{inv.invoiceNumber}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span>Due: {formatDate(inv.dueDate)}</span>
                    <span className="text-red-400 font-medium">{overdueDays} days overdue</span>
                  </div>

                  {/* Reminder message */}
                  <div className="bg-slate-900/60 rounded-xl p-3 mb-3 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-medium text-cyan-400">WhatsApp / SMS Reminder</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(inv.id, message)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isCopied
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-200 hover:bg-slate-700 border border-slate-600/50'
                    }`}
                  >
                    {isCopied ? (
                      <><Check className="w-4 h-4" /> Copied to clipboard</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy message</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl mt-6">
        <div className="text-xs text-slate-500 leading-relaxed">
          Messages are not sent automatically. Copy the reminder and send it to your customer via WhatsApp, SMS, or your preferred channel. Edit the message as needed before sending.
        </div>
      </div>
    </div>
  );
}
