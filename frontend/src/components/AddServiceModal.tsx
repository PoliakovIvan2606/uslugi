import { useState } from 'react';
import { Service } from '../App';
import { X, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface AddServiceModalProps {
  onClose: () => void;
  onAdd: (service: Omit<Service, 'id' | 'date'>) => void;
  onAddToServer: (serviceData: any, imageFile: File | null, generateImage: boolean) => Promise<void>;
}

const categories = ['Ремонт', 'Образование', 'Транспорт', 'IT и Digital', 'Красота', 'Доставка', 'Уборка', 'Другое'];

export function AddServiceModal({ onClose, onAdd, onAddToServer }: AddServiceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categories[0],
    price: '',
    author: '',
    fullDescription: '',
    phone: '',
    email: '',
    experience: '',
    location: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatePhoto, setGeneratePhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.price && formData.author) {
      setIsSubmitting(true);
      
      try {
        // Parse price to number (extract digits)
        const priceMatch = formData.price.match(/\d+/);
        const priceNumber = priceMatch ? parseInt(priceMatch[0]) : 0;
        
        // Parse experience to number
        const experienceMatch = formData.experience.match(/\d+/);
        const experienceNumber = experienceMatch ? parseInt(experienceMatch[0]) : 0;

        const serviceData = {
          name: formData.title,
          shortDescription: formData.description,
          allDescription: formData.fullDescription || formData.description,
          category: formData.category,
          price: priceNumber,
          nameSpecialist: formData.author,
          experience: experienceNumber,
          phone: formData.phone || '',
          email: formData.email || '',
          location: formData.location || '',
          generateImage: generatePhoto && !imageFile
        };

        await onAddToServer(serviceData, imageFile, generatePhoto && !imageFile);
        onClose();
      } catch (error) {
        console.error('Error submitting service:', error);
        alert('Ошибка при добавлении услуги. Пожалуйста, попробуйте еще раз.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900">Добавить услугу</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 mb-2">
              Фотография услуги
            </label>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Нажмите для загрузки</span> или перетащите файл
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP до 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                
                {/* Auto-generate photo option */}
                <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generatePhoto}
                      onChange={(e) => setGeneratePhoto(e.target.checked)}
                      className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-900">Сгенерировать фотографию автоматически</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Если вы поставите эту галочку, система автоматически подберет подходящее изображение на основе названия и категории вашей услуги. Это удобно, если у вас нет своей фотографии.
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Название услуги *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: Ремонт квартир под ключ"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Краткое описание *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              placeholder="Краткое описание для карточки..."
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Полное описание
            </label>
            <textarea
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              placeholder="Подробное описание вашей услуги..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Категория *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Цена *
              </label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="от 500 ₽/час"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Ваше имя *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Как к вам обращаться?"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Опыт работы
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5 лет опыта"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Локация
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Москва и МО"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Генерация...
                </>
              ) : (
                'Добавить услугу'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}