import { useState, useRef, useEffect } from 'react';
import { Chat } from '../App';
import { Send, Briefcase, ListTodo } from 'lucide-react';

interface ChatWindowProps {
  chat: Chat;
  currentUser: string;
  onSendMessage: (chatId: string, text: string) => void;
}

export function ChatWindow({ chat, currentUser, onSendMessage }: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(chat.id, messageText);
      setMessageText('');
    }
  };

  const otherParticipant = chat.participants.find(p => p !== currentUser) || 'Пользователь';

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600">
              {otherParticipant.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900">{otherParticipant}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {chat.itemType === 'service' ? (
                <Briefcase className="w-4 h-4" />
              ) : (
                <ListTodo className="w-4 h-4" />
              )}
              <span className="truncate">{chat.itemTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chat.messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>Начните общение с {otherParticipant}</p>
          </div>
        ) : (
          chat.messages.map(message => {
            const isCurrentUser = message.senderId === currentUser;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      isCurrentUser ? 'text-purple-200' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Отправить
          </button>
        </div>
      </form>
    </div>
  );
}
