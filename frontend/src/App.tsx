import { useState, useEffect } from 'react';
import { ServiceList } from './components/ServiceList';
import { TaskList } from './components/TaskList';
import { AddServiceModal } from './components/AddServiceModal';
import { AddTaskModal } from './components/AddTaskModal';
import { ChatWindow } from './components/ChatWindow';
import { ChatList } from './components/ChatList';
import { ServiceDetail } from './components/ServiceDetail';
import { TaskDetail } from './components/TaskDetail';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { MyListingsTab } from './components/MyListingsTab';
import { Plus, Briefcase, ListTodo, MessageCircle, User as UserIcon, Lightbulb } from 'lucide-react';
import { api } from './utils/api';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  author: string;
  date: string;
  image?: string;
  photos?: string[];
  fullDescription?: string;
  phone?: string;
  email?: string;
  experience?: string;
  location?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  author: string;
  date: string;
  deadline?: string;
  photos?: string[];
  fullDescription?: string;
  phone?: string;
  email?: string;
  location?: string;
  requirements?: string[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  participants: string[];
  itemTitle: string;
  itemType: 'service' | 'task';
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: string;
}

interface User {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'services' | 'tasks' | 'myListings' | 'chats'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [servicesData, tasksData] = await Promise.all([
          api.fetchServices(),
          api.fetchTasks()
        ]);
        
        setServices(servicesData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error loading data:', error);
        setServices([]);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load users from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    const savedCurrentUser = localStorage.getItem('currentUser');
    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser));
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setAuthView(null);
    } else {
      alert('Неверный email или пароль');
    }
  };

  const handleRegister = (name: string, email: string, password: string, phone?: string) => {
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      alert('Пользователь с таким email уже существует');
      return;
    }

    const newUser: User = { name, email, password, phone };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setAuthView(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowProfile(false);
  };

  const handleUpdateUser = (updatedUser: Omit<User, 'password'>) => {
    if (!currentUser) return;
    
    const newUser = { ...currentUser, ...updatedUser };
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    const updatedUsers = users.map(u => u.email === currentUser.email ? newUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleAddService = (service: Omit<Service, 'id' | 'date'>) => {
    if (!currentUser) {
      alert('Войдите в аккаунт, чтобы добавить услугу');
      setAuthView('login');
      return;
    }

    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      author: currentUser.name
    };
    setServices([newService, ...services]);
    setShowServiceModal(false);
  };

  const handleAddServiceToServer = async (serviceData: any, imageFile: File | null, generateImage: boolean) => {
    if (!currentUser) {
      alert('Войдите в аккаунт, чтобы добавить услугу');
      setAuthView('login');
      return;
    }

    try {
      // Send service data to server
      const serviceId = await api.addService(serviceData);
      
      if (!serviceId) {
        throw new Error('No service ID returned from server');
      }

      // If user uploaded an image (not generating), upload it
      if (imageFile && !generateImage) {
        await api.uploadServiceImage(serviceId, imageFile);
      }

      // Reload services from server
      const updatedServices = await api.fetchServices();
      setServices(updatedServices);
      
      setShowServiceModal(false);
      alert('Услуга успешно добавлена!');
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'date'>) => {
    if (!currentUser) {
      alert('Войдите в аккаунт, чтобы добавить задачу');
      setAuthView('login');
      return;
    }

    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      author: currentUser.name
    };
    setTasks([newTask, ...tasks]);
    setShowTaskModal(false);
  };

  const handleStartChat = (participantName: string, itemTitle: string, itemType: 'service' | 'task') => {
    if (!currentUser) {
      alert('Войдите в аккаунт, чтобы нача��ь общение');
      setAuthView('login');
      return;
    }

    // Проверяем, есть ли уже чат с этим пользователем по этому объявлению
    const existingChat = chats.find(
      chat => chat.participants.includes(participantName) && chat.itemTitle === itemTitle
    );

    if (existingChat) {
      setActiveChatId(existingChat.id);
      setActiveTab('chats');
      return;
    }

    // Создаем новый чат
    const newChat: Chat = {
      id: Date.now().toString(),
      participants: [currentUser.name, participantName],
      itemTitle,
      itemType,
      messages: []
    };

    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setActiveTab('chats');
  };

  const handleSendMessage = (chatId: string, text: string) => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      senderId: currentUser.name,
      text,
      timestamp: new Date().toISOString()
    };

    setChats(chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: text,
          lastMessageTime: newMessage.timestamp
        };
      }
      return chat;
    }));
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const activeChat = chats.find(chat => chat.id === activeChatId);

  const handleViewService = (service: Service) => {
    setSelectedService(service);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedService(null);
    setSelectedTask(null);
  };

  // Show detail pages if service or task is selected
  if (selectedService) {
    return (
      <ServiceDetail
        service={selectedService}
        onClose={handleCloseDetail}
        onStartChat={handleStartChat}
      />
    );
  }

  if (selectedTask) {
    return (
      <TaskDetail
        task={selectedTask}
        onClose={handleCloseDetail}
        onStartChat={handleStartChat}
      />
    );
  }

  // Show auth views
  if (authView === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthView('register')}
        onCancel={() => setAuthView(null)}
      />
    );
  }

  if (authView === 'register') {
    return (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setAuthView('login')}
        onCancel={() => setAuthView(null)}
      />
    );
  }

  // Show profile
  if (showProfile && currentUser) {
    const userServices = services.filter(s => s.author === currentUser.name);
    const userTasks = tasks.filter(t => t.author === currentUser.name);

    return (
      <Profile
        user={currentUser}
        userServices={userServices}
        userTasks={userTasks}
        allServices={services}
        allTasks={tasks}
        onClose={() => setShowProfile(false)}
        onLogout={handleLogout}
        onDeleteService={handleDeleteService}
        onDeleteTask={handleDeleteTask}
        onUpdateUser={handleUpdateUser}
        onStartChat={handleStartChat}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl text-gray-900">Услуги и Задачи</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowServiceModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Добавить услугу
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Добавить задачу
              </button>
              <button
                onClick={() => setShowProfile(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <UserIcon className="w-5 h-5" />
                Профиль
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'services'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Услуги ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListTodo className="w-5 h-5" />
            Задачи ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('myListings')}
            className={`px-6 py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'myListings'
                ? 'border-lightbulb-600 text-lightbulb-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            Мои объявления
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-6 py-3 flex items-center gap-2 border-b-2 transition-colors relative ${
              activeTab === 'chats'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            Чаты ({chats.length})
            {chats.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                {chats.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка данных...</p>
            </div>
          </div>
        ) : activeTab === 'services' ? (
          <ServiceList 
            services={services} 
            tasks={tasks} 
            onStartChat={handleStartChat}
            onViewService={handleViewService}
          />
        ) : activeTab === 'tasks' ? (
          <TaskList 
            tasks={tasks} 
            services={services} 
            onStartChat={handleStartChat}
            onViewTask={handleViewTask}
          />
        ) : activeTab === 'myListings' ? (
          <MyListingsTab
            userServices={currentUser ? services.filter(s => s.author === currentUser.name) : []}
            userTasks={currentUser ? tasks.filter(t => t.author === currentUser.name) : []}
            allServices={services}
            allTasks={tasks}
            onStartChat={handleStartChat}
            isLoggedIn={!!currentUser}
            onLoginPrompt={() => setAuthView('login')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
            <div className="lg:col-span-1">
              <ChatList
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
                currentUser={currentUser?.name || ''}
              />
            </div>
            <div className="lg:col-span-2">
              {activeChat ? (
                <ChatWindow
                  chat={activeChat}
                  currentUser={currentUser?.name || ''}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Выберите чат или начните новый разговор</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showServiceModal && (
        <AddServiceModal
          onClose={() => setShowServiceModal(false)}
          onAdd={handleAddService}
          onAddToServer={handleAddServiceToServer}
        />
      )}
      {showTaskModal && (
        <AddTaskModal
          onClose={() => setShowTaskModal(false)}
          onAdd={handleAddTask}
        />
      )}
    </div>
  );
}