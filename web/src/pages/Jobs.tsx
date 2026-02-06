import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Search, Plus, MapPin, Briefcase, Building } from 'lucide-react';

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    description: string;
    job_type: string;
    requirements: string;
    apply_link: string;
    posted_at: string;
    poster_id: number;
}

export default function Jobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        job_type: 'Full-time',
        description: '',
        requirements: '',
        apply_link: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (searchQuery) params.q = searchQuery;
            if (locationQuery) params.location = locationQuery;

            const response = await api.get('/jobs/', { params });
            setJobs(response.data);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/jobs/', formData);
            setIsCreating(false);
            fetchJobs();
            setFormData({
                title: '',
                company: '',
                location: '',
                job_type: 'Full-time',
                description: '',
                requirements: '',
                apply_link: ''
            });
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to create job");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Job Board</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Job
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        placeholder="Search titles (e.g. Engineer)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                        placeholder="Location (e.g. Remote)"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={fetchJobs}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Search
                </button>
            </div>

            {/* Create Job Modal (Inline for simplicity) */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4">Post a New Job</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company</label>
                                    <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select value={formData.job_type} onChange={(e) => setFormData({ ...formData, job_type: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea rows={3} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Requirements</label>
                                <textarea rows={3} required value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apply Link</label>
                                <input type="url" required value={formData.apply_link} onChange={(e) => setFormData({ ...formData, apply_link: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Post Job</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Job List */}
            <div className="space-y-4">
                {loading && <p>Loading jobs...</p>}
                {!loading && jobs.length === 0 && <p className="text-gray-500">No jobs found.</p>}
                {jobs.map((job) => (
                    <div key={job.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-indigo-600">{job.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                                    <span className="flex items-center"><Building className="h-4 w-4 mr-1" /> {job.company}</span>
                                    <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {job.location}</span>
                                    <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1" /> {job.job_type}</span>
                                </div>
                            </div>
                            <a
                                href={job.apply_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                                Apply Now
                            </a>
                        </div>
                        <p className="mt-4 text-sm text-gray-600 line-clamp-3">{job.description}</p>
                        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                            Posted on {new Date(job.posted_at).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
