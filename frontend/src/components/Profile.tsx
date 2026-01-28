import { useState } from 'react';
import { Service, Task } from '../App';
import { X, User, Mail, Phone, Briefcase, ListTodo, Edit2, Trash2, Lightbulb } from 'lucide-react';
import { MyListings } from './MyListings';

interface User {
  name: string;
  email: string;
  phone?: string;
}

interface ProfileProps {
  user: User;
  userServices: Service[];
  userTasks: Task[];
  allServices: Service[];
  allTasks: Task[];
  onClose: () => void;
  onLogout: () => void;
  onDeleteService: (serviceId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateUser: (user: User) => void;
  onStartChat: (participantName: string, itemTitle: string, itemType: 'service' | 'task') => void;
}

export function Profile({
  user,
  userServices,
  userTasks,
  allServices,
  allTasks,
  onClose,
  onLogout,
  onDeleteService,
  onDeleteTask,
  onUpdateUser,
  onStartChat
}: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'tasks' | 'listings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleSave = () => {
    onUpdateUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl text-gray-900">Личный кабинет</h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Профиль
            </div>
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'listings'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Мои объявления и рекомендации
            </div>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'services'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Мои услуги ({userServices.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5" />
              Мои задачи ({userTasks.length})
            </div>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900">Информация о профиле</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Редактировать
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Имя</label>
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={editedUser.phone || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Имя</div>
                    <div className="text-gray-900">{user.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="text-gray-900">{user.email}</div>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Телефон</div>
                      <div className="text-gray-900">{user.phone}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        )}

        {/* My Listings with Recommendations Tab */}
        {activeTab === 'listings' && (
          <MyListings
            userServices={userServices}
            userTasks={userTasks}
            allServices={allServices}
            allTasks={allTasks}
            onStartChat={onStartChat}
          />
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {userServices.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">У вас пока нет размещенных услуг</p>
              </div>
            ) : (
              userServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {service.category}
                        </span>
                        <span>{service.price}</span>
                        <span>{new Date(service.date).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteService(service.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {userTasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <ListTodo className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">У вас пока нет размещенных задач</p>
              </div>
            ) : (
              userTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-900 mb-2">{task.title}</h3>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                          {task.category}
                        </span>
                        <span>{task.budget}</span>
                        <span>{new Date(task.date).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}