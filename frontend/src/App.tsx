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
import { api, tokenManager } from './utils/api';

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
  email: string;
  userId: string;
  name: string;
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

  // Check for existing token on mount
  useEffect(() => {
    const token = tokenManager.getToken();
    const savedUser = localStorage.getItem('currentUser');
    
    if (token && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        tokenManager.clearToken();
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setAuthView('login');
      alert('Сессия истекла. Пожалуйста, войдите снова.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      // Check if we need auth for viewing services and tasks
      // If no token exists, we might get 401 error
      const token = tokenManager.getToken();
      
      if (!token) {
        // No token, but we can still try to load data
        // If backend requires auth, user will need to login first
        setIsLoading(false);
        return;
      }
      
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
  }, [currentUser]); // Re-load when user changes

  const handleLogin = (email: string, userId: string) => {
    const newUser: User = { 
      email, 
      userId, 
      name: email.split('@')[0] // Временное имя из email
    };
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setAuthView(null);
  };

  const handleRegister = (email: string, userId: string) => {
    const newUser: User = { 
      email, 
      userId, 
      name: email.split('@')[0] 
    };
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setAuthView(null);
  };
  const handleLogout = () => {
    setCurrentUser(null);
    tokenManager.clearToken();
    localStorage.removeItem('currentUser');
    setShowProfile(false);
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    
    const newUser = { ...currentUser, ...updatedData };
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const handleDeleteService = (serviceId: string) => {
    // Добавляем window. перед confirm
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    // Добавляем window. перед confirm
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
      author: currentUser.email
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
      author: currentUser.email
    };
    setTasks([newTask, ...tasks]);
    setShowTaskModal(false);
  };

  const handleAddTaskToServer = async (taskData: any, imageFile: File | null, generateImage: boolean) => {
    if (!currentUser) {
      alert('Войдите в аккаунт, чтобы добавить задачу');
      setAuthView('login');
      return;
    }

    try {
      // Send task data to server
      const taskId = await api.addTask(taskData);
      
      if (!taskId) {
        throw new Error('No task ID returned from server');
      }

      // If user uploaded an image (not generating), upload it
      if (imageFile && !generateImage) {
        await api.uploadTaskImage(taskId, imageFile);
      }

      // Reload tasks from server
      const updatedTasks = await api.fetchTasks();
      setTasks(updatedTasks);
      
      setShowTaskModal(false);
      alert('Задача успешно добавлена!');
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const handleStartChat = (participantName: string, itemTitle: string, itemType: 'service' | 'task') => {
    if (!currentUser) {
      alert('Войдите в аккаунт, чтобы начать общение');
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
      participants: [currentUser.email, participantName],
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
      senderId: currentUser.email,
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
  if (showProfile) {
    if (!currentUser) {
      // Redirect to login if not logged in
      setShowProfile(false);
      setAuthView('login');
      return null;
    }
    
    const userServices = services.filter(s => s.author === currentUser.email);
    const userTasks = tasks.filter(t => t.author === currentUser.email);

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
              {currentUser ? (
                <button
                  onClick={() => setShowProfile(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <UserIcon className="w-5 h-5" />
                  {currentUser.email}
                </button>
              ) : (
                <button
                  onClick={() => setAuthView('login')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <UserIcon className="w-5 h-5" />
                  Войти
                </button>
              )}
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
            userServices={currentUser ? services.filter(s => s.author === currentUser.email) : []}
            userTasks={currentUser ? tasks.filter(t => t.author === currentUser.email) : []}
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
                currentUser={currentUser?.email || ''}
              />
            </div>
            <div className="lg:col-span-2">
              {activeChat ? (
                <ChatWindow
                  chat={activeChat}
                  currentUser={currentUser?.email || ''}
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
          onAddToServer={handleAddTaskToServer}
        />
      )}
    </div>
  );
}