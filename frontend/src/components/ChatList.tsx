import { Chat } from '../App';
import { Briefcase, ListTodo } from 'lucide-react';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  currentUser: string;
}

export function ChatList({ chats, activeChatId, onSelectChat, currentUser }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">У вас пока нет чатов</p>
        <p className="text-sm text-gray-400 mt-2">
          Нажмите "Связаться" или "Откликнуться" на объявление
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-gray-900">Сообщения</h3>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
        {chats.map(chat => {
          const otherParticipant = chat.participants.find(p => p !== currentUser) || 'Пользователь';
          const isActive = chat.id === activeChatId;

          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full text-left px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600">
                    {otherParticipant.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`${isActive ? 'text-purple-600' : 'text-gray-900'} truncate`}>
                      {otherParticipant}
                    </span>
                    {chat.lastMessageTime && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {new Date(chat.lastMessageTime).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    {chat.itemType === 'service' ? (
                      <Briefcase className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <ListTodo className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span className="truncate text-xs">{chat.itemTitle}</span>
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  )}
                  {!chat.lastMessage && (
                    <p className="text-sm text-gray-400 italic">Новый чат</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
