import { Service } from '../App';
import { User, Calendar, Tag, TrendingUp } from 'lucide-react';
import { ApiImage } from './ApiImage';

interface ServiceCardProps {
  service: Service;
  matchingTasksCount: number;
  onStartChat: (participantName: string, itemTitle: string, itemType: 'service' | 'task') => void;
  onViewService: (service: Service) => void;
}

export function ServiceCard({ service, matchingTasksCount, onStartChat, onViewService }: ServiceCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 cursor-pointer"
      onClick={() => onViewService(service)}
    >
      {/* Image */}
      {service.photos && service.photos.length > 0 && (
        <div className="relative w-full h-48 rounded-lg mb-4 overflow-hidden">
          <ApiImage
            src={service.photos[0]}
            alt={service.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-gray-900 mb-2">{service.title}</h3>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {service.category}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <User className="w-4 h-4" />
          <span>{service.author}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{new Date(service.date).toLocaleDateString('ru-RU')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Tag className="w-4 h-4" />
          <span className="text-blue-600">{service.price}</span>
        </div>
      </div>

      {matchingTasksCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700">
            {matchingTasksCount} {matchingTasksCount === 1 ? 'подходящая задача' : 'подходящих задач'}
          </span>
        </div>
      )}

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onStartChat(service.author, service.title, 'service');
        }}
        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Связаться
      </button>
    </div>
  );
}