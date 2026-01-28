import { Task } from '../App';
import { User, Calendar, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { ApiImage } from './ApiImage';

interface TaskCardProps {
  task: Task;
  matchingServicesCount: number;
  onStartChat: (participantName: string, itemTitle: string, itemType: 'service' | 'task') => void;
  onViewTask: (task: Task) => void;
}

export function TaskCard({ task, matchingServicesCount, onStartChat, onViewTask }: TaskCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 cursor-pointer"
      onClick={() => onViewTask(task)}
    >
      {/* Image */}
      {task.photos && task.photos.length > 0 && (
        <div className="relative w-full h-48 rounded-lg mb-4 overflow-hidden">
          <ApiImage
            src={task.photos[0]}
            alt={task.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-gray-900 mb-2">{task.title}</h3>
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {task.category}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{task.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <User className="w-4 h-4" />
          <span>{task.author}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{new Date(task.date).toLocaleDateString('ru-RU')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <DollarSign className="w-4 h-4" />
          <span className="text-green-600">{task.budget}</span>
        </div>
        {task.deadline && (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Clock className="w-4 h-4" />
            <span>до {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
          </div>
        )}
      </div>

      {matchingServicesCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            {matchingServicesCount} {matchingServicesCount === 1 ? 'подходящая услуга' : 'подходящих услуг'}
          </span>
        </div>
      )}

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onStartChat(task.author, task.title, 'task');
        }}
        className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Откликнуться
      </button>
    </div>
  );
}