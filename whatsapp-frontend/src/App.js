import React, { useState, useEffect, useRef } from 'react';
import dots from './images/dots.png';
import message from './images/message.png';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp.toString().length === 10 ? timestamp * 1000 : timestamp);
  const options = { hour: '2-digit', minute: '2-digit', hour12: true };
  return date.toLocaleTimeString('en-US', options);
};

const chatBackgroundStyle = {
  backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#E5DDD5',
};

const MessageStatusIcon = ({ status }) => {
  let icon;
  switch (status) {
    case 'sent':
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
      break;
    case 'delivered':
    case 'read':
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" transform="translate(-8, 0)" />
        </svg>
      );
      break;
    default:
      icon = null;
  }
  return icon;
};

const App = () => {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentChat) {
      setMessages([]);
      fetchMessages(currentChat._id);
    }
  }, [currentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:3001/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (wa_id) => {
    try {
      const response = await fetch(`http://localhost:3001/messages/${wa_id}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentChat) return;

    const messageToSend = {
      wa_id: currentChat._id,
      text: { body: newMessage },
      name: currentChat.name,
    };

    try {
      const response = await fetch('http://localhost:3001/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageToSend),
      });
      const sentMessage = await response.json();
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const filteredConversations = conversations.filter((convo) =>
    convo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    convo._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-row overflow-y-hidden">
          {/* Sidebar */}
          <div className="w-2/5 min-w-[400px] max-w-[500px] flex flex-col border-r-2 border-gray-200 bg-white">
            <div className="flex flex-col p-3 overflow-y-auto">
              <header className="flex items-center justify-between bg-white mb-4 border-b-2 border-gray-200">
                <h1 className="text-2xl font-semibold text-green-600 p-2 pl-2">WhatsApp</h1>
                <div className="flex items-center h-10 justify-center space-x-2">
                  <img src={message} alt="Message icon" className="w-10 h-10 cursor-pointer" />
                  <img src={dots} alt="Dots icon" className="w-10 h-10 cursor-pointer" />
                </div>
              </header>

              {/* 🔍 Search Bar */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or number..."
                className="mb-3 p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              />

              <h2 className="text-xl font-semibold mb-3">Chats</h2>
              {filteredConversations.map((convo) => (
                <div
                  key={convo._id}
                  onClick={() => setCurrentChat(convo)}
                  className={`flex flex-row items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${currentChat?._id === convo._id ? 'bg-green-100' : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium">{convo.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{convo.lastMessage?.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="w-2/3 flex flex-col">
            {currentChat ? (
              <>
                <div className="p-4 bg-white border-b-2 border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium">{currentChat.name}</h3>
                  <p className="text-sm text-gray-500">{currentChat._id}</p>
                </div>

                {/* Chat Messages with Background */}
                <div className="flex-1 overflow-y-auto" style={chatBackgroundStyle}>
                  <div className="p-4 h-full flex flex-col">
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${msg.from === currentChat._id ? 'items-start' : 'items-end'} mb-4`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg shadow-md ${msg.from === currentChat._id ? 'bg-white/80 text-gray-800' : 'bg-green-300/90 text-white'
                            }`}
                        >
                          <p className="text-sm">{msg.text?.body || msg.text}</p>
                          <div className="flex justify-end items-center text-xs mt-1">
                            <span className={`mr-2 ${msg.from === currentChat._id ? 'text-gray-500' : 'text-gray-700'}`}>
                              {formatDate(msg.timestamp)}
                            </span>
                            {msg.from !== currentChat._id && <MessageStatusIcon status={msg.status} />}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t-2 border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-400"
                    />
                    <button
                      type="submit"
                      className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a chat to start a conversation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
