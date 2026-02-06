import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Calendar, MapPin, Users, Clock } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string;
    event_type: string;
    start_time: string;
    end_time: string;
    location: string;
    max_attendees: number;
    organizer_id: number;
}

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'Virtual',
        start_time: '',
        end_time: '',
        location: '',
        max_attendees: 100
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/events/');
            setEvents(response.data);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure dates are ISO format
            const payload = {
                ...formData,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null
            };

            await api.post('/events/', payload);
            setIsCreating(false);
            fetchEvents();
            setFormData({
                title: '',
                description: '',
                event_type: 'Virtual',
                start_time: '',
                end_time: '',
                location: '',
                max_attendees: 100
            });
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to create event");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Events & Webinars</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                </button>
            </div>

            {/* Create Event Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Event</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Event Title</label>
                                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea rows={3} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select value={formData.event_type} onChange={(e) => setFormData({ ...formData, event_type: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                        <option>Virtual</option>
                                        <option>In-Person</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Max Attendees</label>
                                    <input type="number" required value={formData.max_attendees} onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                    <input type="datetime-local" required value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                                    <input type="datetime-local" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location / Link</label>
                                <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Create Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Events Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {loading && <p>Loading events...</p>}
                {!loading && events.length === 0 && <p className="text-gray-500">No events found.</p>}
                {events.map((event) => (
                    <div key={event.id} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition flex flex-col">
                        <div className="bg-indigo-600 h-24 flex items-center justify-center">
                            <Calendar className="h-10 w-10 text-indigo-200" />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {event.event_type}
                                </span>
                            </div>
                            <h3 className="mt-2 text-xl font-bold text-gray-900">{event.title}</h3>
                            <p className="mt-2 text-sm text-gray-500 line-clamp-3">{event.description}</p>

                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {new Date(event.start_time).toLocaleString()}
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span className="truncate">{event.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    Max: {event.max_attendees}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <button disabled className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                    RSVP (Coming Soon)
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
