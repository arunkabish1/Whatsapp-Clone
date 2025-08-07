import React, { useState, useEffect, useRef } from 'react';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp.toString().length === 10 ? timestamp * 1000 : timestamp);
  const options = { hour: '2-digit', minute: '2-digit', hour12: true };
  return date.toLocaleTimeString('en-US', options);
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
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" transform="translate(-8, 0)" />
        </svg>
      );
      break;
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

// Main App component
const App = () => {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Fetch conversations when the component mounts
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages for the selected chat and scroll to bottom
  useEffect(() => {
    if (currentChat) {
      // Clear messages before fetching new ones to prevent a flash of old data
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
      // Add the new message to the UI
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage('');
      // Refresh conversations to show the last message
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 antialiased text-gray-800">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b-2 border-gray-200 shadow-sm">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">WhatsApp Web Clone</h1>
          </div>
        </header>
        <div className="flex-1 flex flex-row overflow-y-hidden">
          {/* Left Sidebar (Conversations) */}
          <div className="w-1/3 flex flex-col border-r-2 border-gray-200 bg-white">
            <div className="flex flex-col p-3 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-3">Chats</h2>
              {conversations.map((convo) => (
                <div
                  key={convo._id}
                  onClick={() => setCurrentChat(convo)}
                  className={`flex flex-row items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
                    currentChat?._id === convo._id ? 'bg-green-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium">{convo.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{convo.lastMessage.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Main Chat Window */}
          <div className="w-2/3 flex flex-col">
            {currentChat ? (
              <>
                <div className="p-4 bg-white border-b-2 border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium">{currentChat.name}</h3>
                  <p className="text-sm text-gray-500">{currentChat._id}</p>
                </div>
                <div className="flex-1 p-4 overflow-y-auto" ref={messagesEndRef}>
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${msg.from === currentChat._id ? 'items-start' : 'items-end'} mb-4`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg shadow-md ${
                          msg.from === currentChat._id ? 'bg-white text-gray-800' : 'bg-green-300 text-white'
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
