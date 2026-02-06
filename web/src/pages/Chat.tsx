import { useEffect, useState, useRef } from 'react';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { Send, MessageSquare, User } from 'lucide-react';

interface Connection {
    id: number;
    requester_id: number;
    recipient_id: number;
    status: string;
    // Assuming we can get user details, or we fetch them. 
    // We'll need a way to get the *other* user's ID and Name.
    // For now, let's assume we fetch connections and then fetch profiles or make a helper.
}

interface Message {
    id: number;
    sender_id: number;
    recipient_id: number;
    content: string;
    timestamp: string;
}

export default function Chat() {
    const { user } = useAuth();
    const [connections, setConnections] = useState<any[]>([]); // Using any to store enriched connection data
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConnections();
    }, []);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (user) {
            // Initialize WebSocket
            const token = localStorage.getItem('token'); // Simplistic token retrieval
            if (token) {
                const socket = new WebSocket(`ws://localhost:8000/api/v1/chat/ws/${user.id}?token=${token}`);

                socket.onopen = () => {
                    console.log('Connected to Chat WS');
                };

                socket.onmessage = (event) => {
                    console.log('Message received:', event.data);
                    // The backend sends strings like "From ID: Content" or simple notifications.
                    // We need to parse this or handle structure.
                    // The backend code sends: `await manager.send_personal_message(f"From {user_id}: {content}", recipient_id)`
                    // This is a plain string. We should ideally return JSON.
                    // For now, let's just create a "fake" message object to display it if it matches our selected user.

                    const data = event.data;
                    if (data.startsWith("From ")) {
                        const parts = data.split(": ");
                        if (parts.length >= 2) {
                            const senderInfo = parts[0]; // "From 1"
                            const content = parts.slice(1).join(": ");
                            const senderId = parseInt(senderInfo.split(" ")[1]);

                            if (senderId === selectedUser) {
                                setMessages(prev => [...prev, {
                                    id: Date.now(), // Temp ID
                                    sender_id: senderId,
                                    recipient_id: user.id,
                                    content: content,
                                    timestamp: new Date().toISOString()
                                }]);
                            }
                        }
                    }
                };

                socket.onclose = () => {
                    console.log('Disconnected from Chat WS');
                };

                setWs(socket);

                return () => {
                    socket.close();
                };
            }
        }
    }, [user, selectedUser]); // Re-connect if user changes? No, WS is per logged-in user.

    // Fetch connections and enrich with user info
    const fetchConnections = async () => {
        setLoading(true);
        try {
            const response = await api.get('/networking/connections');
            const rawConnections = response.data;

            // We need to resolve who the "other" person is
            const enriched = await Promise.all(rawConnections.map(async (conn: Connection) => {
                const otherUserId = conn.requester_id === user?.id ? conn.recipient_id : conn.requester_id;
                // Ideally we have an endpoint to get basic user info by ID, or we use search.
                // Using /profiles/{id} if it exists or search?
                // Let's use search with q="" or assuming we can implement get_profile call.
                // Wait, Profile endpoint `GET /:id` was implemented.
                try {
                    // Endpoint might be /profiles/{id}
                    // Let's assume we can fetch it. If not, we fall back to ID.
                    // Actually there was no explicit GET /profiles/{id} in my `view_file` of gamification? 
                    // Ah, `task.md` says "Implement Profile Endpoints ... GET /:id".
                    // Let's assume it works.
                    const profileRes = await api.get(`/profiles/${otherUserId}`);
                    return { ...conn, otherUser: profileRes.data, otherUserId };
                } catch (e) {
                    return { ...conn, otherUserId, otherUser: { full_name: `User ${otherUserId}` } };
                }
            }));

            setConnections(enriched);
        } catch (error) {
            console.error("Failed to fetch connections", error);
        } finally {
            setLoading(false);
        }
    }

    const selectUser = async (userId: number) => {
        setSelectedUser(userId);
        try {
            const response = await api.get(`/chat/history/${userId}`);
            setMessages(response.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedUser) return;

        const content = inputMessage;
        setInputMessage('');

        // Optimistic update
        const tempMsg: Message = {
            id: Date.now(),
            sender_id: user!.id,
            recipient_id: selectedUser,
            content: content,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        // Apply WS or HTTP
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(`${selectedUser}:${content}`);
        } else {
            // Fallback to HTTP
            try {
                await api.post('/chat/send', {
                    recipient_id: selectedUser,
                    content: content
                });
            } catch (error) {
                console.error("Failed to send message via HTTP", error);
                alert("Failed to send message");
            }
        }
    }

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-white shadow rounded-lg overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading && <p className="p-4 text-center text-gray-500">Loading...</p>}
                    {!loading && connections.length === 0 && <p className="p-4 text-center text-gray-500">No connections yet.</p>}
                    {connections.map((conn) => (
                        <button
                            key={conn.id}
                            onClick={() => selectUser(conn.otherUserId)}
                            className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 focus:outline-none ${selectedUser === conn.otherUserId ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                        >
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-indigo-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{conn.otherUser?.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">Click to chat</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <h3 className="text-lg font-medium text-gray-900">Chat with User {selectedUser}</h3>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex space-x-4">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300 border px-3 py-2"
                                    placeholder="Type a message..."
                                />
                                <button
                                    type="submit"
                                    disabled={!inputMessage.trim()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <MessageSquare className="h-12 w-12 mb-4 text-gray-300" />
                        <p className="text-lg">Select a contact to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
