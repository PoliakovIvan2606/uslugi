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
  }
};