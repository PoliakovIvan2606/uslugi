import { useState } from 'react';
import { Service, Task } from '../App';
import { ServiceCard } from './ServiceCard';
import { Search, Filter } from 'lucide-react';

interface ServiceListProps {
  services: Service[];
  tasks: Task[];
  onStartChat: (participantName: string, itemTitle: string, itemType: 'service' | 'task') => void;
  onViewService: (service: Service) => void;
  searchQuery?: string;
  searchResults?: Service[];
  isSearching?: boolean;
  onSearch?: (query: string) => void;
  onClearSearch?: () => void;
}

const categories = ['Все категории', 'Ремонт', 'Образование', 'Транспорт', 'IT и Digital', 'Красота', 'Доставка', 'Уборка', 'Другое'];

export function ServiceList({ services, tasks, onStartChat, onViewService, searchQuery, searchResults, isSearching, onSearch, onClearSearch }: ServiceListProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');

  // Use search results if available, otherwise use filtered services
  const displayServices = searchResults && searchResults.length > 0 
    ? searchResults.filter(service => {
        const matchesCategory = selectedCategory === 'Все категории' || service.category === selectedCategory;
        return matchesCategory;
      })
    : services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                             service.description.toLowerCase().includes(localSearchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Все категории' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

  // Find matching tasks for each service category
  const getMatchingTasksCount = (category: string) => {
    return tasks.filter(task => task.category === category).length;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(localSearchQuery);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    if (onClearSearch) {
      onClearSearch();
    }
  };

  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск услуг (нажмите Enter)..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {(isSearching || searchResults) && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleClearSearch}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
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
        {displayServices.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            matchingTasksCount={getMatchingTasksCount(service.category)}
            onStartChat={onStartChat}
            onViewService={onViewService}
          />
        ))}
      </div>

      {displayServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Услуги не найдены</p>
        </div>
      )}
    </div>
  );
}