import { useState } from 'react';
import { Task } from '../App';
import { X, Upload, Sparkles } from 'lucide-react';

interface AddTaskModalProps {
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'date'>) => void;
}

const categories = ['Ремонт', 'Образование', 'Транспорт', 'IT и Digital', 'Красота', 'Доставка', 'Уборка', 'Другое'];

export function AddTaskModal({ onClose, onAdd }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categories[0],
    budget: '',
    author: '',
    deadline: '',
    fullDescription: '',
    phone: '',
    email: '',
    location: '',
    requirements: ''
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatePhoto, setGeneratePhoto] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotos([result]);
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPhotos([]);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.budget && formData.author) {
      let finalPhotos = photos;

      // Generate photo if checkbox is checked and no manual photo is uploaded
      if (generatePhoto && photos.length === 0 && formData.description) {
        setIsGenerating(true);
        try {
          // Use the description to search for a relevant image
          const searchQuery = formData.title + ' ' + formData.category;
          const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&client_id=cf5CACzmUQ22RT5oidDMlEndemic_dcyTE0-TwhlPC2KY4`);
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const imageUrl = data.results[0].urls.regular;
            finalPhotos = [imageUrl];
          }
        } catch (error) {
          console.error('Error generating photo:', error);
        } finally {
          setIsGenerating(false);
        }
      }

      const requirementsArray = formData.requirements
        ? formData.requirements.split('\n').filter(req => req.trim())
        : undefined;

      onAdd({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: formData.budget,
        author: formData.author,
        deadline: formData.deadline || undefined,
        fullDescription: formData.fullDescription || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        location: formData.location || undefined,
        photos: finalPhotos.length > 0 ? finalPhotos : undefined,
        requirements: requirementsArray
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900">Добавить задачу</h2>
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
              Фотография задачи
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
                <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generatePhoto}
                      onChange={(e) => setGeneratePhoto(e.target.checked)}
                      className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-gray-900">Сгенерировать фотографию автоматически</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Если вы поставите эту галочку, система автоматически подберет подходящее изображение на основе названия и категории вашей задачи. Это удобно, если у вас нет своей фотографии.
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Название задачи *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Например: Нужен ремонт ванной комнаты"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px]"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
              placeholder="Подробное описание задачи..."
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Бюджет *
              </label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="до 50000 ₽"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Как к вам обращаться?"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Срок выполнения
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Москва и МО"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Требования (каждое с новой строки)
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
              placeholder="Опыт работы от 3 лет&#10;Наличие инструмента&#10;Рекомендации от предыдущих заказчиков"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isGenerating}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Генерация...
                </>
              ) : (
                'Добавить задачу'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}