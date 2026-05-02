import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { Campaign, Donation } from '../types';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DonationPage() {
  const { associationId } = useParams();
  const [searchParams] = useSearchParams();
  const campaignIdParam = searchParams.get('campaign');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(campaignIdParam);
  const [loading, setLoading] = useState(true);
  const [assocName, setAssocName] = useState<string>('');

  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    isAnonymous: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!associationId) return;
      try {
        const [
          { data: cData },
          { data: aData }
        ] = await Promise.all([
          insforge.database.from('campaigns').select('*').eq('association_id', associationId).eq('status', 'active'),
          insforge.database.from('users').select('association_id').eq('association_id', associationId).limit(1).maybeSingle()
        ]);
        
        if (cData) {
          const formatted = cData.map((c: any) => ({
            id: c.id,
            associationId: c.association_id,
            title: c.title,
            description: c.description,
            goalAmount: c.goal_amount,
            currentAmount: c.current_amount,
            startDate: c.start_date,
            endDate: c.end_date,
            status: c.status,
            imageUrl: c.image_url,
            createdAt: c.created_at
          }));
          setCampaigns(formatted);
          if (!selectedCampaign && formatted.length > 0) {
            setSelectedCampaign(formatted[0].id);
          }
        }
        
        // Very basic way to get some association context
        if (aData) {
          setAssocName(`Association (${associationId.slice(0,8)})`);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [associationId, selectedCampaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associationId || !selectedCampaign) return;
    
    const finalAmount = amount === -1 ? parseFloat(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) return;

    setIsSubmitting(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const id = crypto.randomUUID();
      const date = new Date().toISOString();
      
      const { error } = await insforge.database.from('donations').insert({
        id,
        association_id: associationId,
        campaign_id: selectedCampaign,
        amount: finalAmount,
        donor_name: formData.name || 'Generous Donor',
        donor_email: formData.email,
        message: formData.message,
        is_anonymous: formData.isAnonymous,
        date
      });
      
      if (error) throw error;
      
      // Update campaign total
      const { data: cData } = await insforge.database.from('campaigns').select('current_amount').eq('id', selectedCampaign).single();
      if (cData) {
        await insforge.database.from('campaigns').update({
          current_amount: (cData.current_amount || 0) + finalAmount
        }).eq('id', selectedCampaign);
      }
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Donation failed:', error);
      alert('An error occurred while processing your donation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (campaigns.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow text-center max-w-md w-full">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">No Active Campaigns</h2>
          <p className="text-slate-500">
            This association does not currently have any active fundraising campaigns.
          </p>
        </div>
      </div>
    );
  }

  const activeCampaign = campaigns.find(c => c.id === selectedCampaign) || campaigns[0];
  const progress = activeCampaign ? Math.min(100, Math.round(((activeCampaign.currentAmount || 0) / activeCampaign.goalAmount) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl">
              S
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-slate-900">SenNoflaay</span>
          </div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Secure Donation
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-8 py-12">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-[2rem] border border-slate-100 card-shadow text-center max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Thank You!</h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Your generous donation has been successfully processed. An email receipt will be sent to you shortly.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="text-brand-600 font-bold uppercase tracking-widest text-sm hover:text-brand-700 transition-colors"
              >
                Make another donation
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12"
            >
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2">You are supporting</h2>
                  <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4 leading-tight">
                    {activeCampaign.title}
                  </h1>
                  <p className="text-slate-600 leading-relaxed">
                    {activeCampaign.description}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span className="text-brand-600 text-xl">{formatCurrency(activeCampaign.currentAmount || 0)}</span>
                    <span className="text-slate-400 self-end">raised of {formatCurrency(activeCampaign.goalAmount)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-brand-500 rounded-full"
                    />
                  </div>
                  <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {progress}% Funded
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-100 card-shadow space-y-8">
                  
                  {/* Amount Selection */}
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Amount</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[25, 50, 100, 250, 500].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className={cn(
                            "py-4 rounded-2xl font-serif font-bold text-xl transition-all",
                            amount === val 
                              ? "bg-brand-600 text-white shadow-lg shadow-brand-100" 
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                          )}
                        >
                          ${val}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAmount(-1)}
                        className={cn(
                          "py-4 rounded-2xl font-bold text-sm transition-all",
                          amount === -1
                            ? "bg-brand-600 text-white shadow-lg shadow-brand-100" 
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                        )}
                      >
                        Custom
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {amount === -1 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-serif font-bold text-xl pt-1">$</span>
                            <input 
                              type="number"
                              min="1"
                              step="1"
                              required
                              value={customAmount}
                              onChange={e => setCustomAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-serif font-bold text-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Donor Details */}
                  <div className="space-y-6">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Details</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <input 
                          type="text"
                          required={!formData.isAnonymous}
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div>
                        <input 
                          type="email"
                          required
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <textarea 
                        placeholder="Leave a message of support (Optional)"
                        rows={3}
                        value={formData.message}
                        onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                      />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox"
                          checked={formData.isAnonymous}
                          onChange={e => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 peer-checked:border-brand-600 peer-checked:bg-brand-600 transition-all" />
                        <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Make my donation anonymous</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || (amount === -1 && !customAmount)}
                    className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand-100 text-sm disabled:opacity-50 disabled:hover:bg-brand-600 active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Donate {formatCurrency(amount === -1 ? parseFloat(customAmount || '0') : amount)}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium pt-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Secure payment processing via Stripe
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
