import React, { useState } from 'react';
import { 
  Plus, 
  GripVertical, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2, 
  Edit2,
  AlertCircle,
  FileUp
} from 'lucide-react';
import { Reorder, AnimatePresence, motion } from 'motion/react';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
interface TasksProps {
  tasks: Task[];
  onAddTask: () => void;
  onImportTask: () => void;
  onUpdateTask: (id: string, task: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const Tasks: React.FC<TasksProps> = ({
  tasks,
  onAddTask,
  onImportTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  canAdd,
  canEdit,
  canDelete
}) => {
  const { t } = useLanguage();

  const toggleStatus = (task: Task) => {
    if (!canEdit) return;
    const statusOrder: Task['status'][] = ['todo', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onUpdateTask(task.id, { status: nextStatus });
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityMap = { high: 3, medium: 2, low: 1 };
    return priorityMap[b.priorityLevel || 'low'] - priorityMap[a.priorityLevel || 'low'];
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-50 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">{t('tasks')}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('dragToReorder')}</p>
          </div>
        </div>
        
        {canAdd && (
          <div className="flex gap-2">
            <button
              onClick={onImportTask}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border border-slate-100 transition-all"
            >
              <FileUp className="w-4 h-4" />
              {t('import') || 'Import'}
            </button>
            <button
              onClick={onAddTask}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              {t('newTask')}
            </button>
          </div>
        )}
      </div>

      {tasks.length > 0 ? (
        <Reorder.Group 
          axis="y" 
          values={sortedTasks} 
          onReorder={onReorderTasks}
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task) => (
              <Reorder.Item
                key={task.id}
                value={task}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                className={cn(
                  "bg-white p-6 rounded-2xl border border-slate-100 card-shadow flex items-center gap-4 group cursor-default",
                  task.status === 'completed' && "bg-slate-50/50 border-slate-50"
                )}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="cursor-grab active:cursor-grabbing p-1.5 text-slate-200 hover:text-slate-400 transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <button
                    onClick={() => toggleStatus(task)}
                    className={cn(
                      "p-1 rounded-full transition-all",
                      task.status === 'completed' ? "text-emerald-500" : 
                      task.status === 'in-progress' ? "text-amber-500" : "text-slate-200 hover:text-brand-500"
                    )}
                  >
                    {task.status === 'completed' ? <CheckCircle2 className="w-7 h-7" /> : 
                     task.status === 'in-progress' ? <Clock className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "text-xl font-serif font-bold text-slate-900 truncate transition-all",
                        task.status === 'completed' && "text-slate-300 line-through decoration-2"
                      )}>
                        {task.title}
                      </h4>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        task.priorityLevel === 'high' ? "bg-red-500" :
                        task.priorityLevel === 'medium' ? "bg-amber-500" : "bg-emerald-500"
                      )} title={task.priorityLevel} />
                    </div>
                    {task.description && (
                      <p className={cn(
                        "text-sm font-medium text-slate-400 line-clamp-1 mt-0.5",
                        task.status === 'completed' && "text-slate-200"
                      )}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={task.status}
                    onChange={(e) => {
                      if (canEdit) {
                        onUpdateTask(task.id, { status: e.target.value as Task['status'] });
                      }
                    }}
                    disabled={!canEdit}
                    className={cn(
                      "hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer outline-none transition-colors border-none",
                      task.status === 'todo' ? "bg-slate-50 text-slate-500 hover:bg-slate-100" :
                      task.status === 'in-progress' ? "bg-amber-50 text-amber-700 hover:bg-amber-100" :
                      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    )}
                  >
                    <option value="todo" className="font-sans normal-case text-sm text-slate-900">{t('todo')}</option>
                    <option value="in-progress" className="font-sans normal-case text-sm text-slate-900">{t('inProgress')}</option>
                    <option value="completed" className="font-sans normal-case text-sm text-slate-900">{t('completed')}</option>
                  </select>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && (
                      <button
                        onClick={() => onUpdateTask(task.id, {})} // This will trigger the edit modal in App.tsx
                        className="p-2.5 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      ) : (
        <div className="bg-white p-20 rounded-[2rem] border border-slate-100 card-shadow text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-slate-100" />
          </div>
          <p className="text-slate-400 font-medium italic">{t('noTasksFound')}</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
