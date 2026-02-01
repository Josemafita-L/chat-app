import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">⚡ ChatApp</h1>
          <p className="text-gray-600">Real-time messaging with friends</p>
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium py-3 px-4 rounded-lg transition duration-200 shadow-sm mb-6"
        >
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
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div>
              <p className="font-medium text-purple-700">File Sharing</p>
              <p className="text-sm text-purple-600">Share images and files</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="font-medium text-yellow-700">Emoji Support</p>
              <p className="text-sm text-yellow-600">Express with emojis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;