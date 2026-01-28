import { Service } from '../App';
import { X, User, Calendar, Tag, MapPin, Phone, Mail, Award, MessageCircle } from 'lucide-react';

interface ServiceDetailProps {
  service: Service;
  onClose: () => void;
  onStartChat: (participantName: string, itemTitle: string, itemType: 'service' | 'task') => void;
}

export function ServiceDetail({ service, onClose, onStartChat }: ServiceDetailProps) {
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
              onClick={() => onStartChat(service.author, service.title, 'service')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Связаться
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Photos */}
        {service.photos && service.photos.length > 0 && (
          <div className="mb-8">
            <img
              src={service.photos[0]}
              alt={service.title}
              className="w-full h-[400px] object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Main Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl text-gray-900 mb-3">{service.title}</h1>
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full">
                {service.category}
              </span>
            </div>
            <div className="text-right">
              <div className="text-3xl text-blue-600 mb-1">{service.price}</div>
              <div className="text-sm text-gray-500">за услугу</div>
            </div>
          </div>

          {/* Author Info */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Исполнитель</div>
                  <div className="text-gray-900">{service.author}</div>
                </div>
              </div>

              {service.experience && (
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Опыт работы</div>
                    <div className="text-gray-900">{service.experience}</div>
                  </div>
                </div>
              )}

              {service.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Локация</div>
                    <div className="text-gray-900">{service.location}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Дата размещения</div>
                  <div className="text-gray-900">
                    {new Date(service.date).toLocaleDateString('ru-RU')}
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
            {service.fullDescription || service.description}
          </div>
        </div>

        {/* Contact Info */}
        {(service.phone || service.email) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl text-gray-900 mb-4">Контактная информация</h2>
            <div className="space-y-3">
              {service.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a
                    href={`tel:${service.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {service.phone}
                  </a>
                </div>
              )}
              {service.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a
                    href={`mailto:${service.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {service.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Button (mobile) */}
        <div className="mt-8 md:hidden">
          <button
            onClick={() => onStartChat(service.author, service.title, 'service')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Связаться с исполнителем
          </button>
        </div>
      </main>
    </div>
  );
}
