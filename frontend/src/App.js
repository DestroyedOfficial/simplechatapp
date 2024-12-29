import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on('previous-messages', (msgs) => {
      setMessages(msgs);
    });

    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('previous-messages');
      socket.off('new-message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        text: newMessage,
        username: username,
        timestamp: new Date().toISOString()
      };
      socket.emit('send-message', messageData);
      setNewMessage('');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Belépés a chatre</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Add meg a nevedet"
            required
          />
          <button type="submit">Belépés</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.username === username ? 'own-message' : ''}`}
          >
            <div className="message-header">
              <span className="username">{message.username}</span>
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-text">{message.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Írj egy üzenetet..."
        />
        <button type="submit">Küldés</button>
      </form>
    </div>
  );
}

export default App;