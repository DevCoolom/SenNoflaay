import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Upload, 
  File, 
  Trash2, 
  Download,
  Calendar as CalendarIcon,
  DollarSign,
  Tag,
  X
} from 'lucide-react';
import { Bill } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

interface BillsProps {
  bills: Bill[];
  onAddBill: (bill: Omit<Bill, 'id'>) => void;
  onDeleteBill: (id: string) => void;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const Bills: React.FC<BillsProps> = ({ bills, onAddBill, onDeleteBill, canAdd, canEdit, canDelete }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Utility',
    fileName: '',
    fileUrl: ''
  });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // In a real app, upload to InsForge Storage
      // For now, we'll simulate with a blob URL
      setNewBill(prev => ({
        ...prev,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file)
      }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: false
  } as any);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBill(newBill);
    setIsModalOpen(false);
    setNewBill({
      title: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: 'Utility',
      fileName: '',
      fileUrl: ''
    });
  };

  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow border-t-4 border-t-brand-600">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('totalBillsCount')}</p>
          <p className="text-4xl font-serif font-bold text-slate-900">{bills.length}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow border-t-4 border-t-red-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('totalBillsAmount')}</p>
          <p className="text-4xl font-serif font-bold text-slate-900">{formatCurrency(totalBills)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
        <h3 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <Receipt className="w-6 h-6 text-brand-600" />
          {t('billsInvoices')}
        </h3>
        {canAdd && (
          <div className="flex gap-2">
            <button
              onClick={onImportBill}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border border-slate-100 transition-all"
            >
              <File className="w-4 h-4" />
              {t('import') || 'Import'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t('addBill')}
            </button>
          </div>
        )}
      </div>

      {/* Bills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.length > 0 ? (
          bills.map((bill) => (
            <motion.div
              layout
              key={bill.id}
              className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-brand-50 transition-colors">
                  <File className="w-6 h-6 text-slate-400 group-hover:text-brand-600" />
                </div>
                {canDelete && (
                  <button
                    onClick={() => onDeleteBill(bill.id)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-serif font-bold text-slate-900 group-hover:text-brand-700 transition-colors">{bill.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <Tag className="w-3.5 h-3.5" />
                    {bill.category}
                  </p>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {bill.date}
                    </p>
                    <p className="text-2xl font-serif font-bold text-brand-700">{formatCurrency(bill.amount)}</p>
                  </div>
                  
                  {bill.fileUrl && (
                    <a
                      href={bill.fileUrl}
                      download={bill.fileName}
                      className="p-2.5 bg-slate-50 hover:bg-brand-600 hover:text-white text-slate-400 rounded-xl transition-all shadow-sm"
                      title="Download Attachment"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Receipt className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-medium italic">{t('noBillsFound')}</p>
          </div>
        )}
      </div>

      {/* Add Bill Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-2xl font-serif font-bold text-slate-900">{t('addBill')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('title')}</label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                    value={newBill.title}
                    onChange={e => setNewBill(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('amount')}</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                      value={isNaN(newBill.amount) ? '' : newBill.amount}
                      onChange={e => setNewBill(prev => ({ ...prev, amount: e.target.value === '' ? NaN : parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('date')}</label>
                    <input
                      required
                      type="date"
                      className="w-full px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                      value={newBill.date}
                      onChange={e => setNewBill(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('category')}</label>
                  <select
                    className="w-full px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium appearance-none"
                    value={newBill.category}
                    onChange={e => setNewBill(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Utility">{t('utility')}</option>
                    <option value="Rent">{t('rent')}</option>
                    <option value="Maintenance">{t('maintenance')}</option>
                    <option value="Event Expense">{t('eventExpense')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('attachment')}</label>
                  <div 
                    {...getRootProps()} 
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all",
                      isDragActive ? "border-brand-500 bg-brand-50" : "border-slate-100 hover:border-brand-400 bg-slate-50/30"
                    )}
                  >
                    <input {...getInputProps()} />
                    {newBill.fileName ? (
                      <div className="flex items-center justify-center gap-2 text-brand-600 font-bold text-sm">
                        <File className="w-5 h-5" />
                        <span className="truncate max-w-[200px]">{newBill.fileName}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-10 h-10 text-slate-200 mx-auto" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {isDragActive ? t('dropFileHere') : t('clickOrDragFile')}
                        </p>
                        <p className="text-[10px] text-slate-300 uppercase tracking-wider">{t('fileLimitInfo')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3.5 rounded-2xl bg-brand-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
                  >
                    {t('saveBill')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bills;
