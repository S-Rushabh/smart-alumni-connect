import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Heart, DollarSign } from 'lucide-react';

interface Campaign {
    id: number;
    title: string;
    description: string;
    target_amount: number;
    goal_amount: number;
    current_amount: number;
    end_date: string;
}

export default function Donations() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [donatingTo, setDonatingTo] = useState<number | null>(null);
    const [donationAmount, setDonationAmount] = useState<number>(50);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal_amount: 1000,
        end_date: ''
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await api.get('/donations/campaigns');
            setCampaigns(response.data);
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                goal_amount: formData.goal_amount,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
            };

            await api.post('/donations/campaigns', payload);
            setIsCreating(false);
            fetchCampaigns();
            setFormData({
                title: '',
                description: '',
                goal_amount: 1000,
                end_date: ''
            });
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to create campaign");
            console.error(error);
        }
    }

    const handleDonate = async () => {
        if (!donatingTo) return;
        try {
            await api.post('/donations/donate', {
                campaign_id: donatingTo,
                amount: donationAmount
            });
            alert("Thank you for your donation!");
            setDonatingTo(null);
            fetchCampaigns(); // Update progress
        } catch (error: any) {
            alert(error.response?.data?.detail || "Donation failed");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Fundraising Campaigns</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Start Campaign
                </button>
            </div>

            {/* Create Campaign Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Start a Fundraiser</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea rows={3} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Goal Amount ($)</label>
                                <input type="number" required value={formData.goal_amount} onChange={(e) => setFormData({ ...formData, goal_amount: parseFloat(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input type="date" required value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Donation Modal */}
            {donatingTo !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Make a Donation</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                                <input
                                    type="number"
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(parseFloat(e.target.value))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-lg font-bold text-center focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setDonatingTo(null)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button onClick={handleDonate} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">Donate</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {loading && <p>Loading campaigns...</p>}
                {!loading && campaigns.length === 0 && <p className="text-gray-500">No campaigns active.</p>}
                {campaigns.map((camp) => {
                    const percent = Math.min(100, Math.round((camp.current_amount / camp.goal_amount) * 100));
                    return (
                        <div key={camp.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition">
                            <div className="h-32 bg-green-100 flex items-center justify-center">
                                <DollarSign className="h-12 w-12 text-green-600" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 truncate">{camp.title}</h3>
                                <p className="mt-2 text-sm text-gray-500 line-clamp-3">{camp.description}</p>

                                <div className="mt-4">
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span className="text-green-600">${camp.current_amount.toLocaleString()} raised</span>
                                        <span className="text-gray-500">Goal: ${camp.goal_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        onClick={() => setDonatingTo(camp.id)}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                    >
                                        <Heart className="h-4 w-4 mr-2" />
                                        Donate Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
