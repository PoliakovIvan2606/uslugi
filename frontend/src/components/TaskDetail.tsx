import { Task } from '../App';
import { X, User, Calendar, DollarSign, Clock, MapPin, Phone, Mail, CheckCircle, MessageCircle } from 'lucide-react';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onStartChat: (participantName: string, itemTitle: string, itemType: 'service' | 'task') => void;
}

export function TaskDetail({ task, onClose, onStartChat }: TaskDetailProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-6 h-6" />
              <span>Назад к списку</span>
            </button>
            <button
              onClick={() => onStartChat(task.author, task.title, 'task')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Откликнуться
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Photos */}
        {task.photos && task.photos.length > 0 && (
          <div className="mb-8">
            <img
              src={task.photos[0]}
              alt={task.title}
              className="w-full h-[400px] object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Main Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl text-gray-900 mb-3">{task.title}</h1>
              <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full">
                {task.category}
              </span>
            </div>
            <div className="text-right">
              <div className="text-3xl text-green-600 mb-1">{task.budget}</div>
              <div className="text-sm text-gray-500">бюджет</div>
            </div>
          </div>

          {/* Author Info */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Заказчик</div>
                  <div className="text-gray-900">{task.author}</div>
                </div>
              </div>

              {task.deadline && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Срок выполнения</div>
                    <div className="text-gray-900">
                      до {new Date(task.deadline).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              )}

              {task.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Локация</div>
                    <div className="text-gray-900">{task.location}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Дата размещения</div>
                  <div className="text-gray-900">
                    {new Date(task.date).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl text-gray-900 mb-4">Подробное описание</h2>
          <div className="text-gray-600 whitespace-pre-line leading-relaxed">
            {task.fullDescription || task.description}
          </div>
        </div>

        {/* Requirements */}
        {task.requirements && task.requirements.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-xl text-gray-900 mb-4">Требования</h2>
            <ul className="space-y-2">
              {task.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact Info */}
        {(task.phone || task.email) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl text-gray-900 mb-4">Контактная информация</h2>
            <div className="space-y-3">
              {task.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a
                    href={`tel:${task.phone}`}
                    className="text-green-600 hover:underline"
                  >
                    {task.phone}
                  </a>
                </div>
              )}
              {task.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a
                    href={`mailto:${task.email}`}
                    className="text-green-600 hover:underline"
                  >
                    {task.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Button (mobile) */}
        <div className="mt-8 md:hidden">
          <button
            onClick={() => onStartChat(task.author, task.title, 'task')}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Откликнуться на задачу
          </button>
        </div>
      </main>
    </div>
  );
}
