import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { Trophy, Medal, Star } from 'lucide-react';

interface LeaderboardEntry {
    user_id: number;
    full_name: string;
    points: number;
}

interface Badge {
    id: number;
    name: string;
    description: string;
    icon_url: string;
}

interface UserBadge {
    badge: Badge;
    earned_at: string;
}

export default function Gamification() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
    const [loading, setLoading] = useState(false);
    const [earning, setEarning] = useState(false);

    useEffect(() => {
        fetchLeaderboard();
        fetchMyBadges();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await api.get('/gamification/leaderboard');
            setLeaderboard(response.data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchMyBadges = async () => {
        try {
            const response = await api.get('/gamification/my-badges');
            setMyBadges(response.data);
        } catch (error) {
            console.error("Failed to fetch badges", error);
        }
    }

    const handleEarnPoints = async () => {
        setEarning(true);
        try {
            await api.post('/gamification/award-points', { points: 10 });
            fetchLeaderboard(); // Refresh
            alert("You earned 10 points!");
        } catch (error) {
            console.error("Failed to earn points", error);
        } finally {
            setEarning(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Leaderboard & Achievements</h1>
                <button
                    onClick={handleEarnPoints}
                    disabled={earning}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none disabled:opacity-50"
                >
                    <Star className="h-4 w-4 mr-2" />
                    {earning ? 'Earning...' : 'Demo: Earn 10 Points'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leaderboard */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="bg-indigo-700 px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
                            <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                            Global Leaderboard
                        </h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {loading && <li className="p-4 text-center">Loading...</li>}
                        {!loading && leaderboard.map((entry, idx) => (
                            <li key={entry.user_id} className={`px-4 py-4 sm:px-6 flex items-center justify-between ${entry.user_id === user?.id ? 'bg-yellow-50' : ''}`}>
                                <div className="flex items-center">
                                    <span className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold mr-4 ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm font-medium text-indigo-600 truncate">{entry.full_name}</p>
                                </div>
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {entry.points} pts
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* My Badges */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="bg-indigo-700 px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-white flex items-center">
                            <Medal className="h-5 w-5 mr-2 text-yellow-400" />
                            My Badges
                        </h3>
                    </div>
                    <div className="p-6">
                        {myBadges.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No badges earned yet. Participate to earn!</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {myBadges.map((ub) => (
                                    <div key={ub.badge.id} className="border rounded-lg p-4 flex flex-col items-center text-center">
                                        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                                            {ub.badge.icon_url ? <img src={ub.badge.icon_url} alt="" className="h-8 w-8" /> : <Medal className="h-6 w-6 text-indigo-600" />}
                                        </div>
                                        <h4 className="font-bold text-gray-900">{ub.badge.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{ub.badge.description}</p>
                                        <span className="mt-2 text-xs text-green-600">Earned {new Date(ub.earned_at).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
