// views/Chat.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import axios from '../api/axios';

const Chat = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const [conversations, setConversations] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showPrescriptionView, setShowPrescriptionView] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Prescription form state
    const [prescription, setPrescription] = useState({
        diagnosis: '',
        notes: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    useEffect(() => {
        // Initialize Socket.IO
        const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        setSocket(newSocket);

        // Fetch initial data
        fetchConversations();
        fetchAvailableUsers();

        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        if (socket && activeChat) {
            // Join chat room
            socket.emit('join_chat', activeChat._id);

            // Listen for new messages
            socket.on('new_message', (message) => {
                if (message.sender._id !== user._id) {
                    setMessages((prev) => [...prev, message]);
                    scrollToBottom();
                }
            });

            // Listen for typing indicators
            socket.on('user_typing', (data) => {
                if (data.userId !== user._id) {
                    setTypingUser(data.name);
                }
            });

            socket.on('user_stopped_typing', () => {
                setTypingUser(null);
            });

            return () => {
                socket.emit('leave_chat', activeChat._id);
                socket.off('new_message');
                socket.off('user_typing');
                socket.off('user_stopped_typing');
            };
        }
    }, [socket, activeChat]);

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get('/chat/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const res = await axios.get('/chat/available-users');
            setAvailableUsers(res.data);
        } catch (error) {
            console.error('Error fetching available users:', error);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const res = await axios.get(`/chat/${chatId}/messages`);
            setMessages(res.data);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const startNewChat = async (targetUserId) => {
        try {
            const res = await axios.post('/chat/start', { targetUserId });
            setActiveChat(res.data);
            fetchMessages(res.data._id);
            setShowNewChatModal(false);
            fetchConversations();
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    const handleTyping = useCallback(() => {
        if (socket && activeChat) {
            socket.emit('typing_start', { chatId: activeChat._id, userId: user._id, name: user.name });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing_stop', { chatId: activeChat._id, userId: user._id });
            }, 2000);
        }
    }, [socket, activeChat, user]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat || isSending) return;

        setIsSending(true);
        try {
            const res = await axios.post('/chat/send', {
                chatId: activeChat._id,
                content: newMessage
            });
            setMessages((prev) => [...prev, res.data]);
            setNewMessage('');
            scrollToBottom();

            // Update last message in conversations
            setConversations(prev =>
                prev.map(conv =>
                    conv._id === activeChat._id
                        ? { ...conv, lastMessage: newMessage, lastMessageAt: new Date() }
                        : conv
                )
            );
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeChat) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', activeChat._id);

        try {
            setIsSending(true);
            const res = await axios.post('/chat/send-file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages((prev) => [...prev, res.data]);
            scrollToBottom();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please try again.');
        } finally {
            setIsSending(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const sendPrescription = async () => {
        if (!activeChat) return;

        // Validate prescription
        if (!prescription.diagnosis.trim()) {
            alert('Please enter a diagnosis');
            return;
        }

        if (prescription.medications.every(m => !m.name.trim())) {
            alert('Please add at least one medication');
            return;
        }

        try {
            setIsSending(true);
            const res = await axios.post('/chat/send-prescription', {
                chatId: activeChat._id,
                prescription: {
                    ...prescription,
                    medications: prescription.medications.filter(m => m.name.trim())
                }
            });
            setMessages((prev) => [...prev, res.data]);
            setShowPrescriptionModal(false);
            setPrescription({
                diagnosis: '',
                notes: '',
                medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
            });
            scrollToBottom();
        } catch (error) {
            console.error('Error sending prescription:', error);
            alert('Failed to send prescription');
        } finally {
            setIsSending(false);
        }
    };

    const addMedication = () => {
        setPrescription(prev => ({
            ...prev,
            medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        }));
    };

    const removeMedication = (index) => {
        setPrescription(prev => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index)
        }));
    };

    const updateMedication = (index, field, value) => {
        setPrescription(prev => ({
            ...prev,
            medications: prev.medications.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            )
        }));
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSelectChat = (conversation) => {
        setActiveChat(conversation);
        fetchMessages(conversation._id);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const getOtherUser = (conversation) => {
        return user.role === 'therapist' ? conversation.patient : conversation.therapist;
    };

    const filteredConversations = conversations.filter(conv => {
        const otherUser = getOtherUser(conv);
        return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const renderMessage = (msg, idx) => {
        const isMe = msg.sender?._id === user._id || msg.sender === user._id;
        const senderName = isMe ? 'You' : msg.sender?.name || 'Unknown';

        return (
            <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}
            >
                <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                    {/* Message Bubble */}
                    <div
                        className={`relative p-4 rounded-2xl shadow-lg ${isMe
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm border border-slate-100 dark:border-slate-700'
                            }`}
                    >
                        {/* Text Message */}
                        {msg.messageType === 'text' && (
                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}

                        {/* Image Message */}
                        {msg.messageType === 'image' && (
                            <div>
                                <a href={`${API_BASE}${msg.fileUrl}`} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={`${API_BASE}${msg.fileUrl}`}
                                        alt={msg.fileName}
                                        className="max-w-full rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    />
                                </a>
                                <p className="text-xs mt-2 opacity-75">{msg.fileName}</p>
                            </div>
                        )}

                        {/* File Message */}
                        {msg.messageType === 'file' && (
                            <a
                                href={`${API_BASE}${msg.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] ${isMe ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-700'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/50'}`}>
                                    <svg className={`w-6 h-6 ${isMe ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{msg.fileName}</p>
                                    <p className={`text-xs ${isMe ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>Click to download</p>
                                </div>
                            </a>
                        )}

                        {/* Prescription Message */}
                        {msg.messageType === 'prescription' && (
                            <div className={`${isMe ? 'text-white' : ''}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/50'}`}>
                                        <svg className={`w-5 h-5 ${isMe ? 'text-white' : 'text-green-600 dark:text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className="font-bold">📋 Prescription</span>
                                </div>
                                <p className={`text-sm mb-2 ${isMe ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'}`}>
                                    <strong>Diagnosis:</strong> {msg.prescription?.diagnosis}
                                </p>
                                <button
                                    onClick={() => setShowPrescriptionView(msg.prescription)}
                                    className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all ${isMe
                                            ? 'bg-white/20 hover:bg-white/30 text-white'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}
                                >
                                    View Full Prescription
                                </button>
                            </div>
                        )}

                        {/* Timestamp */}
                        <p className={`text-xs mt-2 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                            {formatTime(msg.timestamp)}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="h-[calc(100vh-200px)] flex gap-6 p-2">
            {/* Conversations List */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-1/3 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <span className="text-2xl">💬</span> Messages
                        </h2>
                        <button
                            onClick={() => setShowNewChatModal(true)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full p-3 pl-10 bg-white/20 backdrop-blur-sm rounded-xl text-white placeholder-white/60 outline-none focus:bg-white/30 transition-all text-sm font-medium"
                        />
                        <svg className="w-4 h-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-5xl mb-4">🗨️</div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No conversations yet</p>
                            <button
                                onClick={() => setShowNewChatModal(true)}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Start a conversation
                            </button>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const otherUser = getOtherUser(conv);
                            return (
                                <motion.div
                                    key={conv._id}
                                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectChat(conv)}
                                    className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-all ${activeChat?._id === conv._id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-600'
                                            : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                                                {otherUser?.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                                    {otherUser?.name || 'Unknown'}
                                                </h3>
                                                <span className="text-xs text-slate-400">
                                                    {formatDate(conv.lastMessageAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                                                {conv.lastMessage || 'Start a conversation'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </motion.div>

            {/* Chat Window */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            >
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                                    {getOtherUser(activeChat)?.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white">
                                        {getOtherUser(activeChat)?.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            {typingUser ? `${typingUser} is typing...` : 'Online'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {user.role === 'therapist' && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowPrescriptionModal(true)}
                                        className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                        title="Send Prescription"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/80">
                            <AnimatePresence>
                                {messages.map((msg, idx) => renderMessage(msg, idx))}
                            </AnimatePresence>

                            {/* Typing Indicator */}
                            {typingUser && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-sm shadow-lg">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                {/* File Upload */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                                />
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    title="Attach file"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </motion.button>

                                {/* Message Input */}
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        handleTyping();
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
                                />

                                {/* Send Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isSending || !newMessage.trim()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`p-4 rounded-2xl font-bold transition-all shadow-lg ${isSending || !newMessage.trim()
                                            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl'
                                        }`}
                                >
                                    {isSending ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/80">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-8"
                        >
                            <div className="text-8xl mb-6">💬</div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                Start a Conversation
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">
                                Select a chat from the left or start a new conversation
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowNewChatModal(true)}
                                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                New Conversation
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </motion.div>

            {/* New Chat Modal */}
            <AnimatePresence>
                {showNewChatModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowNewChatModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                                Start New Chat
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Select a {user.role === 'patient' ? 'therapist' : 'patient'} to start chatting
                            </p>

                            {availableUsers.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        No {user.role === 'patient' ? 'therapists' : 'patients'} available.
                                        {user.role === 'patient' && ' Book a session first!'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {availableUsers.map((u) => (
                                        <motion.button
                                            key={u._id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => startNewChat(u._id)}
                                            className="w-full p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                                {u.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-slate-900 dark:text-white">{u.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setShowNewChatModal(false)}
                                className="w-full mt-6 py-3 text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prescription Modal */}
            <AnimatePresence>
                {showPrescriptionModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPrescriptionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">📋</span> Create Prescription
                            </h3>

                            {/* Diagnosis */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Diagnosis *
                                </label>
                                <input
                                    type="text"
                                    value={prescription.diagnosis}
                                    onChange={(e) => setPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                                    placeholder="Enter diagnosis..."
                                    className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                />
                            </div>

                            {/* Medications */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Medications
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addMedication}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                    >
                                        + Add Medication
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {prescription.medications.map((med, index) => (
                                        <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                                    Medication #{index + 1}
                                                </span>
                                                {prescription.medications.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedication(index)}
                                                        className="text-red-500 hover:text-red-600 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={med.name}
                                                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                                    placeholder="Medicine name"
                                                    className="p-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    value={med.dosage}
                                                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                    placeholder="Dosage (e.g., 500mg)"
                                                    className="p-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    value={med.frequency}
                                                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                    placeholder="Frequency (e.g., Twice daily)"
                                                    className="p-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    value={med.duration}
                                                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                    placeholder="Duration (e.g., 7 days)"
                                                    className="p-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={med.instructions}
                                                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                                placeholder="Special instructions (e.g., Take after meals)"
                                                className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    value={prescription.notes}
                                    onChange={(e) => setPrescription(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Any additional notes or recommendations..."
                                    rows={3}
                                    className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPrescriptionModal(false)}
                                    className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={sendPrescription}
                                    disabled={isSending}
                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {isSending ? 'Sending...' : 'Send Prescription'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prescription View Modal */}
            <AnimatePresence>
                {showPrescriptionView && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPrescriptionView(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Prescription</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Issued on {new Date(showPrescriptionView.prescribedAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Diagnosis */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl mb-6">
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                                    Diagnosis
                                </p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                    {showPrescriptionView.diagnosis}
                                </p>
                            </div>

                            {/* Medications */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                                    Medications
                                </h4>
                                <div className="space-y-3">
                                    {showPrescriptionView.medications?.map((med, index) => (
                                        <div key={index} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-slate-900 dark:text-white">
                                                        {med.name}
                                                    </h5>
                                                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                                                        <div>
                                                            <span className="text-slate-500 dark:text-slate-400">Dosage:</span>
                                                            <p className="font-medium text-slate-700 dark:text-slate-200">{med.dosage || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 dark:text-slate-400">Frequency:</span>
                                                            <p className="font-medium text-slate-700 dark:text-slate-200">{med.frequency || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                                                            <p className="font-medium text-slate-700 dark:text-slate-200">{med.duration || '-'}</p>
                                                        </div>
                                                    </div>
                                                    {med.instructions && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">
                                                            📝 {med.instructions}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            {showPrescriptionView.notes && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl mb-6">
                                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                                        Additional Notes
                                    </p>
                                    <p className="text-slate-700 dark:text-slate-300">
                                        {showPrescriptionView.notes}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => setShowPrescriptionView(null)}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chat;
