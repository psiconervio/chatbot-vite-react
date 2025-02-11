import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Menu, AlertCircle, Moon, Sun, Trash2, Download, Share2 } from 'lucide-react';

interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
  isError?: boolean;
  id?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearChat = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todo el historial del chat?')) {
      setMessages([]);
    }
  };

  const handleExportChat = () => {
    const chatHistory = messages.map(msg => ({
      role: msg.isBot ? 'assistant' : 'user',
      content: msg.content,
      timestamp: msg.timestamp
    }));

    const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      // Check if Web Share API is available and the content is shareable
      if (navigator.share && messages.length > 0) {
        const shareText = messages
          .map(m => `${m.isBot ? 'Asistente' : 'Usuario'}: ${m.content}`)
          .join('\n\n');

        await navigator.share({
          title: 'Chat con Asistente IA - Nodo Tecnológico Catamarca',
          text: shareText,
        });
      } else {
        // Fallback: Copy to clipboard
        const shareText = messages
          .map(m => `${m.isBot ? 'Asistente' : 'Usuario'}: ${m.content}`)
          .join('\n\n');

        await navigator.clipboard.writeText(shareText);
        
        // Show success message
        const successMessage: Message = {
          content: 'El contenido del chat ha sido copiado al portapapeles.',
          isBot: true,
          timestamp: new Date(),
          id: Math.random().toString(36).substr(2, 9)
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      
      // Show error message to user
      const errorMessage: Message = {
        content: 'No se pudo compartir el chat. El contenido ha sido copiado al portapapeles como alternativa.',
        isBot: true,
        timestamp: new Date(),
        isError: true,
        id: Math.random().toString(36).substr(2, 9)
      };
      
      // Try to copy to clipboard as a fallback
      try {
        const shareText = messages
          .map(m => `${m.isBot ? 'Asistente' : 'Usuario'}: ${m.content}`)
          .join('\n\n');
        await navigator.clipboard.writeText(shareText);
      } catch (clipboardError) {
        errorMessage.content = 'No se pudo compartir el chat ni copiar al portapapeles. Por favor, intenta nuevamente.';
      }
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      content: input,
      isBot: false,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9)
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://python-chatbot-backend-55o8.onrender.com/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: Message = {
        content: data.response,
        isBot: true,
        timestamp: new Date(),
        id: Math.random().toString(36).substr(2, 9)
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        content: 'Lo siento, no puedo conectarme al servidor en este momento. Por favor, verifica que el servidor esté funcionando e inténtalo de nuevo.',
        isBot: true,
        timestamp: new Date(),
        isError: true,
        id: Math.random().toString(36).substr(2, 9)
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-gray-100'
    }`}>
      {/* Header */}
      <header className={`${
        isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white'
      } shadow-lg sticky top-0 z-50 transition-colors duration-200`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Bot className={`w-8 h-8 md:w-10 md:h-10 ${
                  isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                }`} />
              </div>
              <div>
                <h1 className={`text-xl md:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } leading-tight`}>
                  Asistente IA
                </h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                } hidden md:block`}>
                  Nodo Tecnológico Catamarca
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors duration-200`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <div className="hidden md:flex space-x-2">
                <button
                  onClick={handleClearChat}
                  className={`p-2 rounded-full ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors duration-200`}
                  title="Limpiar chat"
                >
                  <Trash2 className={`w-5 h-5 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                </button>
                <button
                  onClick={handleExportChat}
                  className={`p-2 rounded-full ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors duration-200`}
                  title="Exportar chat"
                >
                  <Download className={`w-5 h-5 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                </button>
                <button
                  onClick={handleShare}
                  className={`p-2 rounded-full ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors duration-200`}
                  title="Compartir chat"
                >
                  <Share2 className={`w-5 h-5 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                </button>
              </div>
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`p-2 rounded-md ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-400 hover:text-gray-500'
                  } hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500`}
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-lg border-t`}>
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={handleClearChat}
              className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span>Limpiar chat</span>
            </button>
            <button
              onClick={handleExportChat}
              className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Download className="w-5 h-5" />
              <span>Exportar chat</span>
            </button>
            <button
              onClick={handleShare}
              className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Share2 className="w-5 h-5" />
              <span>Compartir chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-2xl shadow-xl min-h-[calc(100vh-12rem)] flex flex-col overflow-hidden border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        } transition-colors duration-200`}>
          {/* Messages Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <Bot className={`w-16 h-16 ${
                  isDarkMode ? 'text-gray-700' : 'text-indigo-200'
                }`} />
                <p className={`text-lg font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>¡Bienvenido al Asistente IA!</p>
                <p className={`text-sm text-center max-w-md ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Estoy aquí para ayudarte con cualquier pregunta sobre el Nodo Tecnológico Catamarca.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.isBot ? '' : 'flex-row-reverse space-x-reverse'
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-2 ${
                        message.isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        message.isBot 
                          ? message.isError 
                            ? 'bg-red-100 dark:bg-red-900' 
                            : isDarkMode
                              ? 'bg-gray-700'
                              : 'bg-indigo-100'
                          : isDarkMode
                            ? 'bg-blue-900'
                            : 'bg-blue-100'
                      }`}>
                        {message.isBot ? (
                          message.isError ? (
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          ) : (
                            <Bot className={`w-5 h-5 ${
                              isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                            }`} />
                          )
                        ) : (
                          <User className={`w-5 h-5 ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                        )}
                      </div>
                      <div
                        className={`p-4 rounded-2xl max-w-[80%] sm:max-w-[70%] shadow-sm ${
                          message.isBot
                            ? message.isError
                              ? isDarkMode
                                ? 'bg-red-900/50 border-red-800'
                                : 'bg-red-50 border-red-100'
                              : isDarkMode
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-white border-gray-100'
                            : isDarkMode
                              ? 'bg-blue-900'
                              : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        } ${message.isBot ? 'border' : ''}`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm font-medium ${
                            message.isBot
                              ? message.isError
                                ? isDarkMode
                                  ? 'text-red-400'
                                  : 'text-red-600'
                                : isDarkMode
                                  ? 'text-gray-200'
                                  : 'text-gray-900'
                              : 'text-white'
                          }`}>
                            {message.isBot ? 'Asistente IA' : 'Tú'}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${
                          message.isBot
                            ? message.isError
                              ? isDarkMode
                                ? 'text-red-300'
                                : 'text-red-600'
                              : isDarkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            : 'text-white'
                        }`}>{message.content}</p>
                        <span className={`text-xs mt-2 block ${
                          message.isBot 
                            ? message.isError
                              ? isDarkMode
                                ? 'text-red-400'
                                : 'text-red-400'
                              : isDarkMode
                                ? 'text-gray-400'
                                : 'text-gray-400'
                            : 'text-blue-100'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      isDarkMode ? 'bg-gray-700' : 'bg-indigo-100'
                    }`}>
                      <Bot className={`w-5 h-5 ${
                        isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                      }`} />
                    </div>
                    <div className={`p-4 rounded-2xl ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'
                    } border shadow-sm`}>
                      <div className="flex items-center space-x-3">
                        <Loader2 className={`w-5 h-5 ${
                          isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                        } animate-spin`} />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>Procesando tu consulta...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className={`border-t ${
            isDarkMode 
              ? 'border-gray-700 bg-gray-800' 
              : 'border-gray-100 bg-gray-50'
          } p-4 sm:p-6`}>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta aquí..."
                  className={`flex-1 px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`px-6 py-3 ${
                    isDarkMode
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
                  } text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm transition-all duration-200 text-sm font-medium`}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;