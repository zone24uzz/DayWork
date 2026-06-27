import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Backend server manzili
const SOCKET_SERVER = "http://localhost:5000";

// Vaqtni hh:mm formatiga o'girish
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// =================== LOGIN EKRANI ===================
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
      {/* Orqa fon animatsiyasi */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Sarlavha */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4 transform transition-transform hover:scale-110">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Real-Time Chat</h1>
          <p className="text-gray-400">
            Suhbatga qo'shilish uchun ismingizni kiriting
          </p>
        </div>

        {/* Login Formasi */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Foydalanuvchi nomi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ismingizni kiriting..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                autoFocus
                maxLength={20}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
              username.trim()
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                : "bg-gray-700 cursor-not-allowed opacity-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              Suhbatga kirish
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${
                  isHovered && username.trim() ? "translate-x-1" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </button>
        </form>

        {/* Pastki ma'lumot */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Socket.io orqali real-time aloqa 🔌
        </p>
      </div>
    </div>
  );
}

// =================== CHAT EKRANI ===================
function ChatScreen({ username }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Socket.io ga ulanish
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Serverga ulandik!");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Serverdan uzildik!");
      setIsConnected(false);
    });

    // Xabar qabul qilish
    newSocket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    // Tozalash
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Yangi xabar kelganda avtomatik skroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Xabar yuborish
  const sendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() && socket) {
      socket.emit("send_message", {
        text: inputText.trim(),
        username: username,
      });
      setInputText("");
      inputRef.current?.focus();
    }
  };

  // Enter tugmasi bosilganda yuborish
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex flex-col">
      {/* Yuqori panel (Header) */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Chat ikonkasi */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold">Real-Time Chat</h2>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span className="text-xs text-gray-400">
                  {isConnected ? "Ulangan" : "Ulanmoqda..."}
                </span>
              </div>
            </div>
          </div>

          {/* Foydalanuvchi ma'lumotlari */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white font-medium">{username}</p>
              <p className="text-xs text-gray-400">Suhbatdosh</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-green-500/20">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Xabarlar maydoni */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            // Bo'sh holat
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Xabarlar hali yo'q
              </h3>
              <p className="text-gray-500">
                Birinchi xabarni yozib, suhbatni boshlang! 💬
              </p>
            </div>
          ) : (
            // Xabarlar ro'yxati
            messages.map((msg) => {
              const isMyMessage = msg.username === username;

              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    isMyMessage ? "justify-end" : "justify-start"
                  } animate-fade-in-up`}
                >
                  <div
                    className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${
                      isMyMessage ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Xabar balonchasi */}
                    <div
                      className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                        isMyMessage
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md shadow-blue-500/20"
                          : "bg-white/10 backdrop-blur-sm text-white border border-white/10 rounded-bl-md"
                      } ${isMyMessage ? "animate-slide-right" : "animate-slide-left"}`}
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {msg.text}
                      </p>
                    </div>

                    {/* Xabar osti - ism va vaqt */}
                    <div
                      className={`flex items-center gap-2 mt-1 px-1 ${
                        isMyMessage ? "flex-row-reverse" : ""
                      }`}
                    >
                      <span className="text-xs text-gray-500 font-medium">
                        {isMyMessage ? "Siz" : msg.username}
                      </span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Skroll nuqtasi */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Kiritish maydoni */}
      <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 px-4 py-4 sticky bottom-0">
        <form
          onSubmit={sendMessage}
          className="max-w-4xl mx-auto flex items-center gap-3"
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Xabar yozing..."
              className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
              autoFocus
            />
            {/* Emoji tugmasi (dekorativ) */}
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>

          {/* Yuborish tugmasi */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-3.5 rounded-2xl transition-all duration-300 transform ${
              inputText.trim()
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                : "bg-white/5 text-gray-500 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>

        {/* Pastki ma'lumot */}
        <div className="max-w-4xl mx-auto mt-2 flex items-center justify-center gap-1.5">
          <span className="text-xs text-gray-600">
            Enter bosib xabar yuboring
          </span>
          <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-500 font-mono">
            ↵
          </kbd>
        </div>
      </footer>
    </div>
  );
}

// =================== ASOSIY APP ===================
export default function App() {
  const [username, setUsername] = useState("");

  // Login qilish
  const handleLogin = (name) => {
    setUsername(name);
  };

  return (
    <div className="min-h-screen">
      {username ? (
        <ChatScreen username={username} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </div>
  );
}
