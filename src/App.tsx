import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Menu, AlertCircle } from 'lucide-react';

interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
  isError?: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      content: input,
      isBot: false,
      timestamp: new Date(),
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
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        content: 'Lo siento, no puedo conectarme al servidor en este momento. Por favor, verifica que el servidor esté funcionando e inténtalo de nuevo.',
        isBot: true,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Bot className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                  Asistente IA
                </h1>
                <p className="text-sm text-gray-500 hidden md:block">
                  Nodo Tecnológico Catamarca
                </p>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-200">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-500">
              Nodo Tecnológico Catamarca
            </p>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-xl min-h-[calc(100vh-12rem)] flex flex-col overflow-hidden border border-gray-100">
          {/* Messages Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <Bot className="w-16 h-16 text-indigo-200" />
                <p className="text-lg font-medium">¡Bienvenido al Asistente IA!</p>
                <p className="text-sm text-center max-w-md">
                  Estoy aquí para ayudarte con cualquier pregunta sobre el Nodo Tecnológico Catamarca.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
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
                            ? 'bg-red-100' 
                            : 'bg-indigo-100'
                          : 'bg-blue-100'
                      }`}>
                        {message.isBot ? (
                          message.isError ? (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Bot className="w-5 h-5 text-indigo-600" />
                          )
                        ) : (
                          <User className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div
                        className={`p-4 rounded-2xl max-w-[80%] sm:max-w-[70%] shadow-sm ${
                          message.isBot
                            ? message.isError
                              ? 'bg-red-50 border border-red-100'
                              : 'bg-white border border-gray-100'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm font-medium ${
                            message.isError ? 'text-red-600' : ''
                          }`}>
                            {message.isBot ? 'Asistente IA' : 'Tú'}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${
                          message.isError ? 'text-red-600' : ''
                        }`}>{message.content}</p>
                        <span className={`text-xs mt-2 block ${
                          message.isBot 
                            ? message.isError 
                              ? 'text-red-400' 
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
                    <div className="p-2 rounded-full bg-indigo-100">
                      <Bot className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        <span className="text-sm text-gray-500">Procesando tu consulta...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta aquí..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm transition-all duration-200 text-sm font-medium"
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