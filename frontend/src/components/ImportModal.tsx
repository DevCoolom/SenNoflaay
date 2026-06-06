import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { Modal } from './Modals';
import { Member } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  type: 'member' | 'expense' | 'event' | 'bill' | 'task';
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, type }) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTargetFields = () => {
    switch (type) {
      case 'member':
        return [
          { key: 'firstName', label: t('firstName') || 'First Name', required: true },
          { key: 'lastName', label: t('lastName') || 'Last Name', required: true },
          { key: 'tel', label: t('phone') || 'Phone', required: true },
          { key: 'city', label: t('city') || 'City', required: false },
          { key: 'fee', label: t('fee') || 'Fee', required: false },
          { key: 'gender', label: t('gender') || 'Gender', required: false },
          { key: 'isMinor', label: t('minor') || 'Minor', required: false },
          { key: 'joinedDate', label: t('joinedDate') || 'Joined Date', required: false },
        ];
      case 'expense':
        return [
          { key: 'desc', label: t('description') || 'Description', required: true },
          { key: 'amount', label: t('amount') || 'Amount', required: true },
          { key: 'date', label: t('date') || 'Date', required: true },
          { key: 'category', label: t('category') || 'Category', required: false },
          { key: 'objectiveId', label: t('objective') || 'Objective ID', required: false },
        ];
      case 'event':
        return [
          { key: 'name', label: t('eventName') || 'Event Name', required: true },
          { key: 'player', label: t('speakerPlayer') || 'Speaker/Player', required: true },
          { key: 'date', label: t('date') || 'Date', required: true },
          { key: 'time', label: t('time') || 'Time', required: false },
          { key: 'place', label: t('location') || 'Location', required: false },
          { key: 'description', label: t('description') || 'Description', required: false },
        ];
      case 'bill':
        return [
          { key: 'title', label: t('title') || 'Title', required: true },
          { key: 'amount', label: t('amount') || 'Amount', required: true },
          { key: 'date', label: t('date') || 'Date', required: true },
          { key: 'category', label: t('category') || 'Category', required: false },
          { key: 'description', label: t('description') || 'Description', required: false },
        ];
      case 'task':
        return [
          { key: 'title', label: t('title') || 'Title', required: true },
          { key: 'description', label: t('description') || 'Description', required: false },
          { key: 'status', label: t('status') || 'Status', required: false },
        ];
      default:
        return [];
    }
  };

  const targetFields = getTargetFields();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  }, [type]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false
  });

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (rawData.length > 0) {
        const headers = rawData[0] as string[];
        const rows = rawData.slice(1);
        setColumns(headers);
        setData(rows);
        
        // Auto-mapping logic
        const newMapping: Record<string, string> = {};
        headers.forEach(h => {
          const header = h.toLowerCase().trim();
          
          // Member fields
          if (header.includes('first') || header.includes('prénom')) newMapping.firstName = h;
          if (header.includes('last') || header.includes('nom')) newMapping.lastName = h;
          if (header.includes('tel') || header.includes('phone') || header.includes('téléphone')) newMapping.tel = h;
          
          // Generic fields
          if (header === 'title' || header === 'titre' || header === 'name' || header === 'nom') {
             if (type === 'event') newMapping.name = h;
             else newMapping.title = h;
          }
          if (header.includes('desc')) newMapping.desc = h;
          if (header.includes('description')) newMapping.description = h;
          if (header.includes('amount') || header.includes('montant') || header.includes('fee')) {
             if (type === 'member') newMapping.fee = h;
             else newMapping.amount = h;
          }
          if (header.includes('date')) newMapping.date = h;
          if (header.includes('time') || header.includes('heure')) newMapping.time = h;
          if (header.includes('place') || header.includes('loc') || header.includes('lieu')) newMapping.place = h;
          if (header.includes('category') || header.includes('catégorie')) newMapping.category = h;
          if (header.includes('status') || header.includes('état')) newMapping.status = h;
          if (header.includes('player') || header.includes('speaker') || header.includes('intervenant')) newMapping.player = h;
          if (header.includes('city') || header.includes('ville')) newMapping.city = h;
          if (header.includes('minor') || header.includes('mineur')) newMapping.isMinor = h;
        });
        setMapping(newMapping);
        setStep('mapping');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const finalData = data.map(row => {
        const item: any = {};
        targetFields.forEach(field => {
          const colIndex = columns.indexOf(mapping[field.key]);
          if (colIndex !== -1) {
            let value = row[colIndex];
            
            // Type conversions
            if (field.key === 'amount' || field.key === 'fee' || field.key === 'participants') {
              value = parseFloat(value) || 0;
            }
            if (field.key === 'isMinor') {
              value = value === 'true' || value === 1 || value === 'Yes' || value === 'Oui' || value === true;
            }
            if (field.key === 'gender') {
                const g = String(value).toLowerCase();
                if (g.startsWith('m') || g.includes('homme')) value = 'male';
                else if (g.startsWith('f') || g.includes('femme')) value = 'female';
                else value = 'male';
            }
            if (field.key === 'status') {
               const s = String(value).toLowerCase();
               if (s.includes('todo') || s.includes('faire')) value = 'todo';
               else if (s.includes('prog') || s.includes('cours')) value = 'in-progress';
               else if (s.includes('comp') || s.includes('fini') || s.includes('term')) value = 'completed';
               else value = 'todo';
            }
            
            item[field.key] = value;
          } else {
            // Default values for missing columns
            if (field.key === 'amount' || field.key === 'fee') item[field.key] = 0;
            else if (field.key === 'date') item[field.key] = new Date().toISOString().split('T')[0];
            else if (field.key === 'status') item[field.key] = 'todo';
          }
        });
        return item;
      });

      await onImport(finalData);
      onClose();
      // Reset state
      setFile(null);
      setData([]);
      setStep('upload');
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'member': return t('importMembers') || 'Import Members';
      case 'expense': return t('importExpenses') || 'Import Expenses';
      case 'event': return t('importEvents') || 'Import Events';
      case 'bill': return t('importBills') || 'Import Bills';
      case 'task': return t('importTasks') || 'Import Tasks';
      default: return 'Import Data';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={getModalTitle()}
    >
      <div className="space-y-8">
        {step === 'upload' && (
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all duration-300
              ${isDragActive ? 'border-brand-500 bg-brand-50/50 scale-[0.99]' : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50/50'}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <div className={`p-6 rounded-3xl mb-6 shadow-xl transition-transform duration-500 ${isDragActive ? 'bg-brand-600 text-white rotate-12 scale-110' : 'bg-brand-50 text-brand-600'}`}>
                <Upload className="w-12 h-12" />
              </div>
              <h4 className="text-xl font-serif font-bold text-slate-900 mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
              </h4>
              <p className="text-slate-400 text-sm font-medium mb-8">
                Supported formats: .xlsx, .xls, .csv
              </p>
              <button className="bg-brand-600 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100">
                Select File
              </button>
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-6">
            <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100 flex items-start gap-4">
              <Database className="w-6 h-6 text-brand-600 mt-1 shrink-0" />
              <div>
                <h5 className="font-bold text-brand-900 text-sm mb-1">Map your columns</h5>
                <p className="text-brand-600/70 text-xs font-medium">Match the columns from your file to the member fields.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {targetFields.map(field => (
                <div key={field.key} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      <select 
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none"
                        value={mapping[field.key] || ''}
                        onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      >
                        <option value="">Select column...</option>
                        {columns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200 shrink-0" />
                  <div className="flex-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Preview</p>
                    <p className="text-xs font-bold text-slate-500 truncate">
                      {mapping[field.key] ? data[0][columns.indexOf(mapping[field.key])] : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setStep('upload')}
                className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                Back
              </button>
              <button 
                onClick={() => setStep('preview')}
                disabled={!mapping.firstName || !mapping.lastName || !mapping.tel}
                className="flex-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-12 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-brand-100 transition-all"
              >
                Preview Data
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-1 shrink-0" />
              <div>
                <h5 className="font-bold text-emerald-900 text-sm mb-1">Ready to import</h5>
                <p className="text-emerald-600/70 text-xs font-medium">We found {data.length} members in your file.</p>
              </div>
            </div>

            <div className="max-h-[300px] overflow-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    {targetFields.map(f => (
                      <th key={f.key} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      {targetFields.map(field => {
                        const colIndex = columns.indexOf(mapping[field.key]);
                        return (
                          <td key={field.key} className="px-4 py-3 text-xs font-bold text-slate-600">
                            {colIndex !== -1 ? String(row[colIndex]) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 5 && (
                <div className="p-4 text-center bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  And {data.length - 5} more members...
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setStep('mapping')}
                className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleImport}
                disabled={loading}
                className="flex-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-12 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-brand-100 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Importing...
                  </>
                ) : (
                  <>Complete Import</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
