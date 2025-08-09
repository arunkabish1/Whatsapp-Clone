import React, { useState, useEffect, useRef } from 'react';
import sticker from './images/sticker.svg';
import plus from './images/plus.svg';
import mic from './images/mic.svg';

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001";


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
      const response = await fetch(`${API_URL}/conversations`);
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (wa_id) => {
    try {
      const response = await fetch(`${API_URL}/${wa_id}`);
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
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
              <header className="flex items-center justify-between bg-white mb-4  border-gray-200">
                <h1 className="text-2xl font-semibold text-green-600 p-2 pl-2">WhatsApp</h1>
                <div className="flex items-center space-x-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 hover:scale-125 hover:bg-slate-50 hover:rounded-3xl h-7 cursor-pointer">
                    <path d="M15 8h-3V5a1 1 0 1 0-2 0v3H7a1 1 0 1 0 0 2h3v3a1 1 0 1 0 2 0v-3h3a1 1 0 1 0 0-2z" />
                    <path d="M20 4H4a2 2 0 0 0-2 2v12c0 1.105.895 2 2 2h16a2 2 0 0 0 2-2V6c0-1.105-.895-2-2-2zM4 6h16v12H4V6z" />
                  </svg>

                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-7 hover:scale-125 hover:bg-slate-50 hover:rounded-3xl h-7 cursor-pointer">
                    <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
                  </svg>
                </div>

              </header>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="  Search or start a new chat."
                className="mb-3 p-2  rounded-3xl bg-green-50 w-full focus:outline-none hover:ring-2 hover:ring-green-400"
              />
              <div class="flex space-x-2 mb-4 ml-2">
                <button class="px-4 py-1 rounded-full border bg-green-100 text-green-700 border-green-200 text-sm">
                  All
                </button>
                <button class="px-4 py-1 rounded-full border bg-white text-gray-600 border-gray-300 text-sm hover:bg-gray-100">
                  Unread
                </button>
                <button class="px-4 py-1 rounded-full border bg-white text-gray-600 border-gray-300 text-sm hover:bg-gray-100">
                  Favorites
                </button>
                <button class="px-4 py-1 rounded-full border bg-white text-gray-600 border-gray-300 text-sm hover:bg-gray-100">
                  Groups
                </button>
              </div>

              {filteredConversations.map((convo) => (
                <div
                  key={convo._id}
                  onClick={() => setCurrentChat(convo)}
                  className={`flex flex-row items-center p-2  rounded-2xl cursor-pointer transition-colors duration-200 ${currentChat?._id === convo._id ? 'bg-green-50' : 'hover:bg-green-50'
                    }`}
                >

                  <div className="flex-grow overflow-x-hidden mb-2">
                    <div className="flex items-center mb-1">
                      <img
                        src={`https://ui-avatars.com/api/?name=${convo.name}&background=random&color=fff`}
                        alt={convo.name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div className="flex flex-col ">
                        <h3 className="text- font-normal ">{convo.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{convo.lastMessage?.body}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col relative overflow-hidden">
            {currentChat ? (
              <>
                <div className="p-4 bg-white border-b-2 border-gray-200 shadow-sm flex items-center">
                  <img
                    src={`https://ui-avatars.com/api/?name=${currentChat.name}&background=random&color=fff`}
                    alt={currentChat.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div className=' flex flex-col flex-grow'>
                    <h3 className="text-lg font-medium">{currentChat.name}</h3>
                    <p className="text-sm text-gray-500">{currentChat._id}</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 hover:scale-125 hover:bg-slate-50 hover:rounded-3xl h-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 6h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                    </svg>


                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 hover:scale-125 hover:bg-slate-50 hover:rounded-3xl h-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
                    </svg>

                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 hover:scale-125 hover:bg-slate-50 hover:rounded-3xl h-6 cursor-pointer rotate-90" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>

                </div>

                <div className="flex-1 overflow-y-auto " style={chatBackgroundStyle}>
                  <div className="p-4 pb-24  flex flex-col ">
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${msg.from === currentChat._id ? 'items-start' : 'items-end'} mb-4`}
                      >
                        <div
                          className={`min-w-28 max-w-lg p-3 rounded-lg shadow-md ${msg.from === currentChat._id ? 'bg-white text-gray-800' : 'bg-green-200/85 text-gray-800'
                            }`}
                        >
                          <p className="text-sm">{msg.text?.body || msg.text}</p>
                          <div className="flex justify-end items-center text-xs mt-1">
                            <span className={`mr-1 ${msg.from === currentChat._id ? 'text-gray-500' : 'text-gray-700'}`}>
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

                <div className="p-3 pr-8 absolute bottom-0 left-0 w-full bg-white/0 ">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    {/* Input with icons */}
                    <div className="relative flex-1">

                      <div className="absolute inset-y-0 left-3 pr-3 flex items-center space-x-2">
                        <img src={plus} alt="add" className="w-5 h-5 hover:scale-125 hover:bg-slate-50 hover:rounded-3xl cursor-pointer" />
                        <img src={sticker} alt="sticker" className="w-5 h-5 hover:scale-125 hover:bg-slate-50 hover:rounded-3xl cursor-pointer" />
                      </div>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full p-3 pl-16 pr-16 rounded-3xl border-2 border-gray-200 focus:outline-none focus:border-green-400 transition-colors duration-200"
                      />


                      <div className="absolute inset-y-0 right-3 flex items-center">
                        {newMessage.trim() === "" ? (
                          <img src={mic} alt="voice" className="w-7 h-7 hover:scale-125 hover:bg-slate-50 hover:rounded-3xl cursor-pointer" />
                        ) : (
                          <button
                            type="submit"
                            className="bg-green-500 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-green-600 transition-colors duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-green-50">
                <div className="text-center flex flex-col items-center p-24">
                  <img src="https://static.whatsapp.net/rsrc.php/v4/y6/r/wa669aeJeom.png" alt="Download Whatsapp" className="min-w-[400px]" />
                  <h2 className="text-4xl font-semibold text-gray-500 mb-2 mt-2">Download WhatsApp for Windows</h2>
                  <p className='text-sm text-gray-500'>Make calls, share your screen and get a faster experience when you download the Windows app.</p>
                  <button className="mt-4 px-6 py-2 bg-green-600 font-bold text-white rounded-3xl hover:bg-green-500 transition-colors duration-200">
                    Download
                  </button>
                  <p className='fixed bottom-16 text-sm text-gray-500'>Your personal messages are end-to-end encrypted</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
