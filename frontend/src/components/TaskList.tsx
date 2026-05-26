import { useState } from 'react';
import { Task, Service } from '../App';
import { TaskCard } from './TaskCard';
import { Search, Filter } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  services: Service[];
  onStartChat: (participantName: string, itemTitle: string, itemType: 'service' | 'task') => void;
  onViewTask: (task: Task) => void;
  searchQuery?: string;
  searchResults?: Task[];
  isSearching?: boolean;
  onSearch?: (query: string) => void;
  onClearSearch?: () => void;
}

const categories = ['Все категории', 'Ремонт', 'Образование', 'Транспорт', 'IT и Digital', 'Красота', 'Доставка', 'Уборка', 'Другое'];

export function TaskList({ tasks, services, onStartChat, onViewTask, searchQuery, searchResults, isSearching, onSearch, onClearSearch }: TaskListProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');

  // Use search results if available, otherwise use filtered tasks
  const displayTasks = searchResults && searchResults.length > 0 
    ? searchResults.filter(task => {
        const matchesCategory = selectedCategory === 'Все категории' || task.category === selectedCategory;
        return matchesCategory;
      })
    : tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                             task.description.toLowerCase().includes(localSearchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Все категории' || task.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

  // Find matching services for each task category
  const getMatchingServicesCount = (category: string) => {
    return services.filter(service => service.category === category).length;
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
            placeholder="Поиск задач (нажмите Enter)..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white min-w-[200px]"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            matchingServicesCount={getMatchingServicesCount(task.category)}
            onStartChat={onStartChat}
            onViewTask={onViewTask}
          />
        ))}
      </div>

      {displayTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Задачи не найдены</p>
        </div>
      )}
    </div>
  );
}