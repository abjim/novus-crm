import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  Flag, 
  User, 
  X, 
  Trash2,
  ChevronRight
} from 'lucide-react';

// --- Types ---

type Priority = 'Low' | 'Medium' | 'High';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  assignedTo: string;
  completed: boolean;
}

// --- Mock Data ---

const getRelativeDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Finalize Q3 Budget Proposal', description: 'Review the spreadsheet and attach the executive summary.', dueDate: getRelativeDate(-2), priority: 'High', assignedTo: 'Alex Mercer', completed: false },
  { id: 2, title: 'Call with Cyberdyne Systems', description: 'Discuss the new API integration requirements.', dueDate: getRelativeDate(0), priority: 'High', assignedTo: 'Alex Mercer', completed: false },
  { id: 3, title: 'Update Client Database', description: 'Clean up duplicate entries in the CRM.', dueDate: getRelativeDate(0), priority: 'Medium', assignedTo: 'Sarah Khan', completed: false },
  { id: 4, title: 'Prepare Weekly Slide Deck', description: 'Focus on the sales metrics from last week.', dueDate: getRelativeDate(2), priority: 'Medium', assignedTo: 'Alex Mercer', completed: false },
  { id: 5, title: 'Schedule Team Lunch', description: 'Find a venue for Friday.', dueDate: getRelativeDate(4), priority: 'Low', assignedTo: 'John Doe', completed: false },
  { id: 6, title: 'Monthly Performance Review', description: 'Self-evaluation forms due.', dueDate: getRelativeDate(10), priority: 'High', assignedTo: 'Alex Mercer', completed: false },
];

// --- Components ---

// Swipeable Task Card Component
const TaskCard: React.FC<{ 
  task: Task; 
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ task, onToggle, onDelete }) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const threshold = 100; // px to trigger action

  // Touch Handlers for Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    // Only allow swipe right
    if (diff > 0) {
      setOffset(Math.min(diff, 150)); // Cap max visual swipe
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offset > threshold) {
      onToggle(task.id);
    }
    setOffset(0);
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'High': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'Medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
      case 'Low': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl group select-none">
      {/* Background Action (Swipe Reveal) */}
      <div className="absolute inset-y-0 left-0 bg-emerald-500 w-full flex items-center pl-6 text-white rounded-xl">
        <CheckCircle2 size={24} />
      </div>

      {/* Card Content */}
      <div 
        className={`
          relative bg-white dark:bg-slate-900 p-4 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm transition-transform duration-200 ease-out
          ${task.completed ? 'opacity-60' : ''}
        `}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start gap-4">
          <button 
            onClick={() => onToggle(task.id)}
            className={`flex-shrink-0 mt-1 ${task.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 hover:text-brand-500'}`}
          >
            {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className={`text-sm font-semibold truncate pr-2 ${task.completed ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-900 dark:text-white'}`}>
                {task.title}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {task.description}
            </p>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <div className={`flex items-center gap-1.5 ${task.dueDate < getRelativeDate(0) && !task.completed ? 'text-red-500 font-medium' : ''}`}>
                <Calendar size={12} />
                <span>{task.dueDate === getRelativeDate(0) ? 'Today' : task.dueDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={12} />
                <span>{task.assignedTo}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onDelete(task.id)}
            className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: getRelativeDate(1),
    priority: 'Medium',
    assignedTo: 'Alex Mercer'
  });

  // Task Actions
  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const createTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    
    const task: Task = {
      id: Date.now(),
      title: newTask.title || 'New Task',
      description: newTask.description || '',
      dueDate: newTask.dueDate || getRelativeDate(0),
      priority: (newTask.priority as Priority) || 'Medium',
      assignedTo: newTask.assignedTo || 'Me',
      completed: false
    };

    setTasks([task, ...tasks]);
    setIsModalOpen(false);
    // Reset form
    setNewTask({
      title: '',
      description: '',
      dueDate: getRelativeDate(1),
      priority: 'Medium',
      assignedTo: 'Alex Mercer'
    });
  };

  // Categorize Tasks
  const sections = useMemo(() => {
    const today = getRelativeDate(0);
    const nextWeek = getRelativeDate(7);

    const overdue = tasks.filter(t => !t.completed && t.dueDate < today);
    const dueToday = tasks.filter(t => !t.completed && t.dueDate === today);
    const dueWeek = tasks.filter(t => !t.completed && t.dueDate > today && t.dueDate <= nextWeek);
    const upcoming = tasks.filter(t => !t.completed && t.dueDate > nextWeek);
    const completed = tasks.filter(t => t.completed);

    return { overdue, dueToday, dueWeek, upcoming, completed };
  }, [tasks]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      
      {/* --- Header --- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
             You have <span className="font-bold text-brand-600">{sections.dueToday.length + sections.overdue.length}</span> tasks due soon.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* --- Task Sections --- */}
      <div className="space-y-8">
        
        {/* Overdue Section (Red) */}
        {sections.overdue.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-red-600 uppercase tracking-wider">
              <AlertTriangle size={16} />
              Overdue ({sections.overdue.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.overdue.map(task => (
                <div key={task.id} className="border-l-4 border-red-500 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                   <TaskCard task={task} onToggle={toggleTask} onDelete={deleteTask} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due Today Section (Orange) */}
        {sections.dueToday.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-orange-500 uppercase tracking-wider">
              <Clock size={16} />
              Due Today ({sections.dueToday.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.dueToday.map(task => (
                <div key={task.id} className="border-l-4 border-orange-500 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                   <TaskCard task={task} onToggle={toggleTask} onDelete={deleteTask} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due This Week */}
        {sections.dueWeek.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-brand-600 uppercase tracking-wider">
              <Calendar size={16} />
              Due This Week
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.dueWeek.map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </div>
          </div>
        )}

         {/* Upcoming / All */}
         {(sections.upcoming.length > 0 || sections.completed.length > 0) && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
              <ChevronRight size={16} />
              All Tasks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.upcoming.map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
               {sections.completed.map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </div>
          </div>
        )}
        
        {tasks.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-800">
             <div className="bg-gray-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <CheckCircle2 size={32} />
             </div>
             <h3 className="text-lg font-medium text-slate-900 dark:text-white">All caught up!</h3>
             <p className="text-slate-500 dark:text-slate-400">You have no pending tasks.</p>
          </div>
        )}

      </div>

      {/* --- Mobile FAB --- */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg shadow-brand-500/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-transform z-40"
      >
        <Plus size={28} />
      </button>

      {/* --- Create Task Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-800">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={createTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Call client regarding proposal"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Add details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                    <input 
                      type="date"
                      required
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <div className="relative">
                        <select 
                          value={newTask.priority}
                          onChange={(e) => setNewTask({...newTask, priority: e.target.value as Priority})}
                          className="w-full px-3 py-2 pl-9 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                        <Flag size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    </div>
                 </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
                  <div className="relative">
                      <select 
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                        className="w-full px-3 py-2 pl-9 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                      >
                        <option>Alex Mercer</option>
                        <option>Sarah Khan</option>
                        <option>John Doe</option>
                        <option>Emily Blunt</option>
                      </select>
                      <User size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-700 shadow-lg shadow-brand-500/25"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;