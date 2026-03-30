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
  userId: number;
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
  userId: number;
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
  id?: string;
  messageId?: number;
  chatId: number;
  userId: number;
  message: string;
  sentAt: string;
}

export interface Chat {
  id: string;
  serverChatId?: number; // ID чата на сервере
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
        setAuthView('login'); // Redirect to login if error
      }
    } else {
      // No token or user - redirect to login
      setAuthView('login');
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

        // Load chats if user is logged in
        if (currentUser) {
          await loadChats();
        }
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

  // Load chats from server
  const loadChats = async () => {
    if (!currentUser) return;

    try {
      const chatsData = await api.getChats();
      
      // Transform server chats to local Chat format
      const loadedChats = await Promise.all(
        chatsData.map(async (chatData) => {
          // Load last few messages for preview
          const messagesResponse = await api.getMessages(chatData.chatId, 5);
          const messages = messagesResponse.Messages || [];

          // Determine item title and type from messages context (for now use placeholder)
          // In production, you might want to store this in the chat metadata
          const lastMessage = messages.length > 0 ? messages[messages.length - 1].message : undefined;
          const lastMessageTime = messages.length > 0 ? messages[messages.length - 1].sentAt : undefined;

          return {
            id: chatData.chatId.toString(),
            serverChatId: chatData.chatId,
            participants: [currentUser.email, chatData.email],
            itemTitle: 'Общий чат', // Placeholder - можно улучшить
            itemType: 'service' as const, // Placeholder
            messages: messages,
            lastMessage,
            lastMessageTime
          };
        })
      );

      setChats(loadedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

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
    if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
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
      author: currentUser.email,
      userId: parseInt(currentUser.userId)
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
      author: currentUser.email,
      userId: parseInt(currentUser.userId)
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

  const handleStartChat = async (participantName: string, itemTitle: string, itemType: 'service' | 'task') => {
    if (!currentUser) {
      alert('Войдите в аккаунт, чтобы начать общение');
      setAuthView('login');
      return;
    }

    // Получаем userId автора объявления
    let authorUserId: number | undefined;
    
    if (itemType === 'service') {
      const service = services.find(s => s.title === itemTitle || s.author === participantName);
      authorUserId = service?.userId;
    } else {
      const task = tasks.find(t => t.title === itemTitle || t.author === participantName);
      authorUserId = task?.userId;
    }

    if (!authorUserId) {
      alert('Не удалось определить получателя сообщения');
      return;
    }

    // Проверяем, не пытается ли пользователь начать чат с самим собой
    if (authorUserId === parseInt(currentUser.userId)) {
      alert('Вы не можете начать чат со своим объявлением');
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

    try {
      // Создаем чат на сервере
      const response = await api.createChat(authorUserId.toString());

      // Создаем новый чат локально
      const newChat: Chat = {
        id: Date.now().toString(),
        serverChatId: response.chat_id,
        participants: [currentUser.email, participantName],
        itemTitle,
        itemType,
        messages: []
      };

      setChats([newChat, ...chats]);
      setActiveChatId(newChat.id);
      setActiveTab('chats');
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Ошибка при создании чата');
    }
  };

  const handleSendMessage = async (chatId: string, text: string) => {
    if (!currentUser) return;

    const chat = chats.find(c => c.id === chatId);
    if (!chat || !chat.serverChatId) {
      console.error('Chat not found or no server chat ID');
      return;
    }

    try {
      const messageData = {
        userId: parseInt(currentUser.userId),
        chatId: chat.serverChatId,
        message: text,
        sentAt: new Date().toISOString()
      };

      // Send message to server
      const response = await api.sendMessage(messageData);

      // Add message to local state
      const newMessage: Message = {
        messageId: response.messageId,
        chatId: chat.serverChatId,
        userId: parseInt(currentUser.userId),
        message: text,
        sentAt: messageData.sentAt
      };

      setChats(chats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
            lastMessage: text,
            lastMessageTime: newMessage.sentAt
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка при отправке сообщения');
    }
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    
    // Load all messages for this chat
    loadChatMessages(chatId);
  };

  // Load all messages for a specific chat
  const loadChatMessages = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || !chat.serverChatId) return;

    try {
      const messagesResponse = await api.getMessages(chat.serverChatId, 100);
      const messages = messagesResponse.Messages || [];

      setChats(prevChats => prevChats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: messages
          };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
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
      />
    );
  }

  if (authView === 'register') {
    return (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setAuthView('login')}
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
                  currentUserId={currentUser?.userId}
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