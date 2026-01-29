// API configuration
const API_BASE_URL = 'http://localhost:8080';

// API functions
export const api = {
  // Fetch all services
  async fetchServices(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/service/getListService`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      
      // Transform data to match Service interface and add photo URLs
      return data.map((service: any) => ({
        ...service,
        price: service.price || 'Договорная',
        photos: service.id ? [`${API_BASE_URL}/image/service/${service.id}`] : []
      }));
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  },

  // Fetch all tasks
  async fetchTasks(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/task/getListTask`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        throw new Error('Failed to add service');
      }

      const data = await response.json();
      return data.serviceId || data; // Return the ID from response
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  },

  // Upload image for service
  async uploadServiceImage(serviceId: string, imageFile: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('photo', imageFile);

      const response = await fetch(`${API_BASE_URL}/iamge/service/${serviceId}`, {
        method: 'POST',
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

  async uploadTaskImage(serviceId: string, imageFile: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('photo', imageFile);

      const response = await fetch(`${API_BASE_URL}/iamge/task/${serviceId}`, {
        method: 'POST',
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
    return `${API_BASE_URL}/iamge/service/${id}`;
  },

  // Get image URL for task
  getTaskImageUrl(id: string): string {
    return `${API_BASE_URL}/image/task/${id}`;
  }
};