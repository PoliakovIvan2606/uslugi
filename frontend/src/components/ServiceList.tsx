import { useState } from 'react';
import { Service, Task } from '../App';
import { ServiceCard } from './ServiceCard';
import { Search, Filter } from 'lucide-react';

interface ServiceListProps {
  services: Service[];
  tasks: Task[];
  onStartChat: (participantName: string, itemTitle: string, itemType: 'service' | 'task') => void;
  onViewService: (service: Service) => void;
}

const categories = ['Все категории', 'Ремонт', 'Образование', 'Транспорт', 'IT и Digital', 'Красота', 'Доставка', 'Уборка', 'Другое'];

export function ServiceList({ services, tasks, onStartChat, onViewService }: ServiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');

  const filteredServices = services.filter(service => {
    const title = service.title ?? '';        // если undefined, ставим пустую строку
    const description = service.description ?? '';

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Все категории' || service.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Find matching tasks for each service category
  const getMatchingTasksCount = (category: string) => {
    return tasks.filter(task => task.category === category).length;
  };
  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск услуг..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[200px]"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            matchingTasksCount={getMatchingTasksCount(service.category)}
            onStartChat={onStartChat}
            onViewService={onViewService}
          />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Услуги не найдены</p>
        </div>
      )}
    </div>
  );
}