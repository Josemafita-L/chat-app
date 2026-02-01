import React, { useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider } from './firebase/config';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import {
  Send,
  Users,
  Hash,
  LogOut,
  MessageSquare,
  Plus,
  Home,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [rooms, setRooms] = useState([
    { id: 'general', name: 'General Chat', description: 'General discussions', users: 12 },
    { id: 'random', name: 'Random', description: 'Anything goes', users: 8 },
    { id: 'help', name: 'Help Desk', description: 'Get help here', users: 5 }
  ]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const messagesEndRef = useRef(null);

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Anonymous',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'User'}&background=4f46e5&color=fff`
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Load messages
  useEffect(() => {
    if (!currentRoom || !user) return;

    const q = query(
      collection(db, 'rooms', currentRoom, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    }, (error) => {
      console.error("Error loading messages:", error);
      // If error, use mock data
      setMessages([
        {
          id: '1',
          text: 'Welcome to the chat! 👋',
          userName: 'System',
          timestamp: Timestamp.now(),
          userPhoto: 'https://ui-avatars.com/api/?name=System&background=4f46e5&color=fff'
        },
        {
          id: '2',
          text: 'This is a real-time chat application',
          userName: 'System',
          timestamp: Timestamp.now(),
          userPhoto: 'https://ui-avatars.com/api/?name=System&background=4f46e5&color=fff'
        }
      ]);
    });

    return unsubscribe;
  }, [currentRoom, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auth functions
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check console for details.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Message functions
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !currentRoom) return;

    try {
      await addDoc(collection(db, 'rooms', currentRoom, 'messages'), {
        text: newMessage,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        timestamp: serverTimestamp(),
        roomId: currentRoom
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback: add to local state
      const mockMessage = {
        id: Date.now().toString(),
        text: newMessage,
        userName: user.displayName,
        userPhoto: user.photoURL,
        timestamp: Timestamp.now(),
        userId: user.uid
      };
      setMessages([...messages, mockMessage]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // Create room
  const createRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim() || !user) return;

    const roomId = newRoomName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newRoom = {
      id: roomId,
      name: newRoomName,
      description: 'New chat room',
      users: 1,
      createdBy: user.uid
    };

    setRooms([...rooms, newRoom]);
    setCurrentRoom(roomId);
    setNewRoomName('');

    // Create welcome message
    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: `Welcome to #${newRoomName}! 👋`,
        userName: 'System',
        userPhoto: 'https://ui-avatars.com/api/?name=System&background=4f46e5&color=fff',
        timestamp: serverTimestamp(),
        roomId: roomId
      });
    } catch (error) {
      console.error("Error creating welcome message:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat application...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
              <MessageSquare className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-indigo-600 mb-2">⚡ ChatApp</h1>
            <p className="text-gray-600">Real-time messaging with friends</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200 shadow-sm mb-6"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium text-blue-700">Real-time Chat</p>
                <p className="text-sm text-blue-600">Messages update instantly</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-700">Multiple Rooms</p>
                <p className="text-sm text-green-600">Create and join chat rooms</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-8">
            No credit card required • Free to use
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-indigo-600">⚡ ChatApp</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{user.displayName}</p>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)]">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 lg:w-72 bg-white border-r`}>
            <div className="p-4">
              <div className="mb-6">
                <form onSubmit={createRoom} className="flex gap-2">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Create room..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Plus size={20} />
                  </button>
                </form>
              </div>

              <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Users size={18} />
                Chat Rooms
                <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {rooms.length}
                </span>
              </h2>

              <div className="space-y-1">
                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setCurrentRoom(room.id);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-3 rounded-lg transition ${currentRoom === room.id
                        ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                        : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash size={16} className="flex-shrink-0" />
                        <span className="truncate font-medium">{room.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {room.users}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{room.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Room Header */}
            <div className="border-b px-6 py-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Hash size={20} className="text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-800">
                      #{rooms.find(r => r.id === currentRoom)?.name || 'Chat'}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {messages.length} messages • Real-time chat
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <MessageSquare size={48} className="mb-4 text-gray-300" />
                  <p className="text-lg">No messages yet</p>
                  <p className="text-sm">Be the first to send a message!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.userId === user.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${message.userId === user.uid ? 'ml-auto' : ''}`}>
                        {message.userId !== user.uid && (
                          <div className="flex items-center gap-2 mb-1">
                            {message.userPhoto ? (
                              <img
                                src={message.userPhoto}
                                alt={message.userName}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {message.userName?.charAt(0) || 'U'}
                                </span>
                              </div>
                            )}
                            <span className="font-medium text-sm text-gray-700">
                              {message.userName}
                            </span>
                          </div>
                        )}

                        <div className={`rounded-2xl px-4 py-2 ${message.userId === user.uid
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                          }`}>
                          <p className="whitespace-pre-wrap break-words">{message.text}</p>
                          <div className={`text-xs mt-1 ${message.userId === user.uid ? 'text-indigo-200' : 'text-gray-500'
                            }`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t bg-white p-4">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!currentRoom}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !currentRoom}
                  className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send size={20} />
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;