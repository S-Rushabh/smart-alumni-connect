import { useAuth } from '../lib/auth';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Welcome, {user?.full_name}!</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Here is what's happening today.
                        </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Badges</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                                </div>
                            </div>
                            <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Points</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by connecting with alumni or browsing jobs.</p>
                </div>
            </div>
        </div>
    );
}
