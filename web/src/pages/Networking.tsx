import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { Loader2, Search, UserPlus, Check, X, UserCheck } from 'lucide-react';

interface Profile {
    id: number;
    user_id: number;
    full_name: string;
    headline: string;
    department: string;
    graduation_year: number;
    profile_picture: string;
}

interface Connection {
    id: number;
    requester_id: number;
    recipient_id: number;
    status: string;
    created_at: string;
}

export default function Networking() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'find' | 'requests' | 'connections'>('find');
    const [loading, setLoading] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Profile[]>([]);

    // Connection State
    const [requests, setRequests] = useState<Connection[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);

    useEffect(() => {
        if (activeTab === 'requests') fetchRequests();
        if (activeTab === 'connections') fetchConnections();
        if (activeTab === 'find') handleSearch(); // Initial load
    }, [activeTab]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const params = searchQuery ? { q: searchQuery } : {};
            const response = await api.get('/networking/search', { params });
            setSearchResults(response.data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/networking/requests/received');
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchConnections = async () => {
        setLoading(true);
        try {
            const response = await api.get('/networking/connections');
            setConnections(response.data);
        } catch (error) {
            console.error("Failed to fetch connections", error);
        } finally {
            setLoading(false);
        }
    }

    const sendConnectionRequest = async (userId: number) => {
        try {
            await api.post(`/networking/connect/${userId}`);
            alert("Connection request sent!");
            // Maybe update UI to show 'Sent'
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to send request");
        }
    }

    const respondToRequest = async (requestId: number, status: 'ACCEPTED' | 'DECLINED') => {
        try {
            await api.put(`/networking/connect/${requestId}`, { status });
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error("Failed to respond", error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('find')}
                            className={`${activeTab === 'find' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Find Alumni
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`${activeTab === 'requests' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Pending Requests ({requests.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('connections')}
                            className={`${activeTab === 'connections' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            My Network
                        </button>
                    </nav>
                </div>

                <div className="mt-6">
                    {/* Find Tab */}
                    {activeTab === 'find' && (
                        <div className="space-y-6">
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <div className="flex-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                        placeholder="Search by name, department, or year..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Search'}
                                </button>
                            </form>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {searchResults.map((profile) => (
                                    profile.user_id !== user?.id && (
                                        <div key={profile.id} className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                        {profile.full_name[0]}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{profile.full_name}</p>
                                                    <p className="text-sm text-gray-500 truncate">{profile.headline || 'Member'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{profile.department} • {profile.graduation_year}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => sendConnectionRequest(profile.user_id)}
                                                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                    Connect
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            {loading && <p>Loading requests...</p>}
                            {!loading && requests.length === 0 && <p className="text-gray-500">No pending requests.</p>}
                            {requests.map((req) => (
                                <div key={req.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">Request #{req.id}</p>
                                        <p className="text-sm text-gray-500">From User ID: {req.requester_id}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => respondToRequest(req.id, 'ACCEPTED')}
                                            className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                                        >
                                            <Check className="h-5 w-5" />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => respondToRequest(req.id, 'DECLINED')}
                                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                        >
                                            <X className="h-5 w-5" />
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Connections Tab */}
                    {activeTab === 'connections' && (
                        <div className="space-y-4">
                            {loading && <p>Loading connections...</p>}
                            {!loading && connections.length === 0 && <p className="text-gray-500">No connections yet.</p>}
                            {connections.map((conn) => (
                                <div key={conn.id} className="bg-white border rounded-lg p-4 flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <UserCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Connection #{conn.id}</p>
                                        <p className="text-sm text-gray-500">Connected since {new Date(conn.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
