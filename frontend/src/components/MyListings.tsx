import { useState } from 'react';
import { Service, Task } from '../App';
import { Briefcase, ListTodo, Lightbulb, X, Calendar, DollarSign, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

interface MyListingsProps {
  userServices: Service[];
  userTasks: Task[];
  allServices: Service[];
  allTasks: Task[];
  onStartChat: (participantName: string, itemTitle: string, itemType: 'service' | 'task') => void;
}

interface Recommendation {
  type: 'service' | 'task';
  item: Service | Task;
  score: number;
}

export function MyListings({ userServices, userTasks, allServices, allTasks, onStartChat }: MyListingsProps) {
  const [selectedItem, setSelectedItem] = useState<{ type: 'service' | 'task'; item: Service | Task } | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const getRecommendations = (item: Service | Task, type: 'service' | 'task') => {
    const recs: Recommendation[] = [];

    if (type === 'service') {
      // Для услуги ищем подходящие задачи
      allTasks.forEach((task) => {
        let score = 0;

        // Совпадение по категории - высокий вес
        if (task.category === item.category) {
          score += 50;
        }

        // Ключевые слова в названии и описании
        const serviceWords = (item.title + ' ' + item.description).toLowerCase().split(' ');
        const taskWords = (task.title + ' ' + task.description).toLowerCase().split(' ');
        
        serviceWords.forEach(word => {
          if (word.length > 3 && taskWords.some(tw => tw.includes(word) || word.includes(tw))) {
            score += 10;
          }
        });

        if (score > 30) {
          recs.push({ type: 'task', item: task, score });
        }
      });
    } else {
      // Для задачи ищем подходящие услуги
      allServices.forEach((service) => {
        let score = 0;

        // Совпадение по категории
        if (service.category === item.category) {
          score += 50;
        }

        // Ключевые слова
        const taskWords = (item.title + ' ' + item.description).toLowerCase().split(' ');
        const serviceWords = (service.title + ' ' + service.description).toLowerCase().split(' ');
        
        taskWords.forEach(word => {
          if (word.length > 3 && serviceWords.some(sw => sw.includes(word) || word.includes(sw))) {
            score += 10;
          }
        });

        if (score > 30) {
          recs.push({ type: 'service', item: service, score });
        }
      });
    }

    // Сортируем по релевантности
    return recs.sort((a, b) => b.score - a.score).slice(0, 5);
  };

  const handleShowRecommendations = (item: Service | Task, type: 'service' | 'task') => {
    const recs = getRecommendations(item, type);
    setRecommendations(recs);
    setSelectedItem({ type, item });
  };

  const handleCloseRecommendations = () => {
    setSelectedItem(null);
    setRecommendations([]);
  };

  const renderCard = (item: Service | Task, type: 'service' | 'task') => {
    const isService = type === 'service';
    const service = isService ? item as Service : null;
    const task = !isService ? item as Task : null;

    return (
      <div
        key={item.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        {/* Image */}
        {item.photos && item.photos.length > 0 && (
          <img
            src={item.photos[0]}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className={`p-2 rounded-lg ${isService ? 'bg-blue-100' : 'bg-green-100'}`}>
              {isService ? (
                <Briefcase className="w-5 h-5 text-blue-600" />
              ) : (
                <ListTodo className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg text-gray-900 mb-1">{item.title}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                isService ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {item.category}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>{isService ? service?.price : task?.budget}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(item.date).toLocaleDateString('ru-RU')}</span>
            </div>
            {item.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{item.location}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleShowRecommendations(item, type)}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isService
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Показать рекомендации
          </button>
        </div>
      </div>
    );
  };

  const renderRecommendationCard = (rec: Recommendation) => {
    const item = rec.item;
    const isService = rec.type === 'service';
    const service = isService ? item as Service : null;
    const task = !isService ? item as Task : null;

    return (
      <div
        key={item.id}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-lg ${isService ? 'bg-blue-100' : 'bg-green-100'}`}>
            {isService ? (
              <Briefcase className="w-4 h-4 text-blue-600" />
            ) : (
              <ListTodo className="w-4 h-4 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-gray-900 font-medium">{item.title}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isService ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {rec.score}% совпадение
              </span>
            </div>
            <span className="text-xs text-gray-500">{item.category}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {isService ? service?.price : task?.budget}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">от {item.author}</span>
            {item.author !== selectedItem?.item.author && (
              <button
                onClick={() => onStartChat(item.author, item.title, rec.type)}
                className={`p-2 rounded-lg transition-colors ${
                  isService
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                    : 'bg-green-50 hover:bg-green-100 text-green-600'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Services Section */}
      {userServices.length > 0 && (
        <div>
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Мои услуги ({userServices.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userServices.map((service) => renderCard(service, 'service'))}
          </div>
        </div>
      )}

      {/* Tasks Section */}
      {userTasks.length > 0 && (
        <div>
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-green-600" />
            Мои задачи ({userTasks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTasks.map((task) => renderCard(task, 'task'))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {userServices.length === 0 && userTasks.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">У вас пока нет объявлений</p>
          <p className="text-sm text-gray-400">Создайте услугу или задачу, чтобы получить рекомендации</p>
        </div>
      )}

      {/* Recommendations Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl text-gray-900 mb-1">Рекомендации</h2>
                <p className="text-sm text-gray-600">
                  {selectedItem.type === 'service' 
                    ? 'Подходящие задачи для вашей услуги' 
                    : 'Подходящие услуги для вашей задачи'}
                </p>
              </div>
              <button
                onClick={handleCloseRecommendations}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Selected Item */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedItem.type === 'service' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {selectedItem.type === 'service' ? (
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ListTodo className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium">{selectedItem.item.title}</h3>
                  <p className="text-sm text-gray-500">{selectedItem.item.category}</p>
                </div>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="flex-1 overflow-y-auto p-6">
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec) => renderRecommendationCard(rec))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Подходящих объявлений пока не найдено</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Попробуйте позже, когда появятся новые {selectedItem.type === 'service' ? 'задачи' : 'услуги'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
