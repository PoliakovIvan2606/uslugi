// API configuration
const API_BASE_URL = 'http://localhost:8080';

// Token management
let authToken: string | null = null;

export const tokenManager = {
  setToken(token: string) {
    authToken = token;
    localStorage.setItem('authToken', token);
  },
  
  getToken(): string | null {
    if (!authToken) {
      authToken = localStorage.getItem('authToken');
    }
    return authToken;
  },
  
  clearToken() {
    authToken = null;
    localStorage.removeItem('authToken');
  }
};

// Helper function to add auth header
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = tokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper function to handle 401 errors
const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // Token is invalid or expired, clear it
    tokenManager.clearToken();
    // Redirect to login - we'll dispatch a custom event
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    throw new Error('Unauthorized - please login again');
  }
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
};

// API functions
export const api = {
  // Auth functions
  async register(email: string, password: string): Promise<{ UserId: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(false), // No auth for register
        body: JSON.stringify({ email, password }),
      });

      await handleResponse(response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<{ Token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(false), // No auth for login
        body: JSON.stringify({ email, password }),
      });

      await handleResponse(response);
      const data = await response.json();
      
      // Save token
      if (data.Token) {
        tokenManager.setToken(data.Token);
      }
      
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Fetch all services
  async fetchServices(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/service/getListService`, {
        headers: getHeaders(),
      });
      await handleResponse(response);
      const data = await response.json();
      
      // Transform data to match Service interface and add photo URLs
      return data.map((service: any) => ({
        ...service,
        price: service.price || 'Договорная',
        photos: service.id ? [`${API_BASE_URL}/service/getImage/${service.id}`] : []
      }));
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  },

  // Fetch all tasks
  async fetchTasks(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/task/getListTask`, {
        headers: getHeaders(),
      });
      await handleResponse(response);
      const data = await response.json();
      
      // Transform data to match Task interface and add photo URLs
      return data.map((task: any) => ({
        ...task,
        budget: task.budget || 'Не указан',
        photos: task.id ? [`${API_BASE_URL}/task/getImage/${task.id}`] : []
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  // Add new service
  async addService(serviceData: {
    name: string;
    shortDescription: string;
    allDescription: string;
    category: string;
    price: number;
    nameSpecialist: string;
    experience: number;
    phone: string;
    email: string;
    location: string;
    generateImage: boolean;
  }): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/service/addService`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        throw new Error('Failed to add service');
      }

      const data = await response.json();
      return data.id || data; // Return the ID from response
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  },

  // Upload image for service
  async uploadServiceImage(serviceId: string, imageFile: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const token = tokenManager.getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/service/addImage/${serviceId}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Add new task
  async addTask(taskData: {
    name: string;
    shortDescription: string;
    allDescription: string;
    category: string;
    budget: number;
    nameCustomer: string;
    deadline: string;
    phone: string;
    email: string;
    location: string;
    requirements: string;
    generateImage: boolean;
  }): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/task/addTask`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const data = await response.json();
      return data.id || data; // Return the ID from response
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  // Upload image for task
  async uploadTaskImage(taskId: string, imageFile: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const token = tokenManager.getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/task/addImage/${taskId}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Get image URL for service
  getServiceImageUrl(id: string): string {
    return `${API_BASE_URL}/service/getImage/${id}`;
  },

  // Get image URL for task
  getTaskImageUrl(id: string): string {
    return `${API_BASE_URL}/task/getImage/${id}`;
  },

  // Chat functions
  // Create a new chat with a user
  async createChat(userId: string): Promise<{ chat_id: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/addChat?userId=${userId}`, {
        method: 'POST',
        headers: getHeaders(),
      });

      await handleResponse(response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  // Send a message in a chat
  async sendMessage(messageData: {
    userId: number;
    chatId: number;
    message: string;
    sentAt: string;
  }): Promise<{ messageId: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/addMessage`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(messageData),
      });

      await handleResponse(response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get messages from a chat
  async getMessages(chatId: number, limit: number = 50): Promise<{
    Messages: Array<{
      userId: number;
      chatId: number;
      message: string;
      sentAt: string;
    }>
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/getMessages?chatId=${chatId}&limit=${limit}`, {
        headers: getHeaders(),
      });

      await handleResponse(response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  // Get all chats for current user
  async getChats(): Promise<Array<{
    chatId: number;
    email: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/getChats`, {
        headers: getHeaders(),
      });

      await handleResponse(response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting chats:', error);
      throw error;
    }
  },

  // Get task recommendations for a service by service ID
  async getServiceRecommendations(serviceId: string): Promise<any[]> {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/recommendations/service/${serviceId}`, {
        headers: getHeaders(),
      });

      await handleResponse(response);
      const data = await response.json();

      return data.map((item: any) => ({
        ...item,
        budget: item.budget != null ? String(item.budget) : 'Не указан',
        photos: item.id ? [`${API_BASE_URL}/task/getImage/${item.id}`] : []
      }));
    } catch (error) {
      console.error('Error fetching service recommendations:', error);
      return [];
    }
  },

  // Get service recommendations for a task by task ID
  async getTaskRecommendations(taskId: string): Promise<any[]> {
    try {
      // Запрос идет на ML-сервер (порт 8000) к эндпоинту задач
      const response = await fetch(`http://127.0.0.1:8000/api/v1/recommendations/task/${taskId}`, {
        headers: getHeaders(),
      });

      await handleResponse(response);
      const data = await response.json();

      if (!data) return [];

      // Приводим поля к интерфейсу Service, который используется на фронтенде
      return data.map((item: any) => ({
        id: String(item.id),
        userId: item.userId,
        title: item.title,          // Мапится из схемы бэкенда (title)
        description: item.description,
        fullDescription: item.fullDescription,
        category: item.category,
        price: item.budget != null ? String(item.budget) : 'Договорная', // Схема отдает budget, переводим в price
        author: item.author,        // Имя специалиста
        date: item.date,
        location: item.location,
        phone: item.phone,
        email: item.email,
        photos: item.id ? [`${API_BASE_URL}/service/getImage/${item.id}`] : [] // Картинки забираем с основного бэкенда
      }));
    } catch (error) {
      console.error('Error fetching task recommendations:', error);
      return [];
    }
  },

  // Search recommendations (services or tasks)
  async searchRecommendations(query: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/recommendations?query=${encodeURIComponent(query)}`, {
        headers: getHeaders(),
      });

      await handleResponse(response);
      const data = await response.json();
      
      // Transform data similar to services/tasks
      return data.map((item: any) => ({
        ...item,
        price: item.price || item.budget || 'Договорная',
        budget: item.budget || 'Не указан',
        photos: item.id ? [`${API_BASE_URL}/service/getImage/${item.id}`] : []
      }));
    } catch (error) {
      console.error('Error searching recommendations:', error);
      return [];
    }
  },

  async fetchUserServices(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/service/getServiceByUserId`, {
        headers: getHeaders(), // Метод защищен, токен передается автоматически
      });
      await handleResponse(response);
      const data = await response.json();
      
      // Если бэкенд возвращает null вместо пустого массива
      if (!data) return [];

      // Трансформация полей под интерфейс React-компонента (Service)
      return data.map((service: any) => ({
        id: String(service.id),
        userId: service.userId,
        title: service.title || service.name, // Защита на случай расхождения name/title
        description: service.description || service.shortDescription,
        fullDescription: service.fullDescription,
        category: service.category,
        price: service.price != null ? String(service.price) : 'Договорная',
        author: service.author,
        date: service.date || new Date().toISOString(), // Дефолтная дата, если нет в ответе
        location: service.location,
        photos: service.id ? [`${API_BASE_URL}/service/getImage/${service.id}`] : []
      }));
    } catch (error) {
      console.error('Error fetching user services:', error);
      return [];
    }
  },

  // Fetch tasks for specific user (My Listings)
  async fetchUserTasks(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/task/getTasksByUserId`, {
        headers: getHeaders(), // Токен авторизации подкладывается автоматически
      });
      await handleResponse(response);
      const data = await response.json();
      
      if (!data) return [];

      // Маппинг данных под фронтенд-интерфейс Task
      return data.map((task: any) => ({
        id: String(task.id),
        userId: task.userId,
        title: task.title,
        description: task.description || task.shortDescription,
        fullDescription: task.fullDescription,
        category: task.category,
        budget: task.budget != null ? String(task.budget) : 'Не указан',
        author: task.author,
        date: task.date,
        deadline: task.deadline,
        phone: task.phone,
        email: task.email,
        location: task.location,
        requirements: task.requirements || null
      }));
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      return [];
    }
  },
};