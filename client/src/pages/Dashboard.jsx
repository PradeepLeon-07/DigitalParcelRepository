import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const COURIERS = ['Amazon', 'Flipkart', 'DTDC', 'BlueDart', 'Other'];

const Dashboard = () => {
  const [stats, setStats] = useState({ todayCount: 0, pendingCount: 0, overdueCount: 0, pendingParcels: [] });
  const [newParcel, setNewParcel] = useState({ trackingId: '', courierCompany: 'Amazon', recipientRoll: '' });
  const [otp, setOtp] = useState('');
  const [searchRoll, setSearchRoll] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loadingLog, setLoadingLog] = useState(false);
  const [loadingRelease, setLoadingRelease] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/parcels/dashboard');
      setStats(data);
    } catch {
      toast.error('Failed to load dashboard');
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleLogParcel = async (e) => {
    e.preventDefault();
    setLoadingLog(true);
    try {
      await api.post('/parcels', newParcel);
      toast.success('Parcel logged and OTP sent!');
      setNewParcel({ trackingId: '', courierCompany: 'Amazon', recipientRoll: '' });
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log parcel');
    } finally {
      setLoadingLog(false);
    }
  };

  const handleRelease = async (e) => {
    e.preventDefault();
    setLoadingRelease(true);
    try {
      await api.patch('/parcels/release', { otp });
      toast.success('Parcel marked as PickedUp!');
      setOtp('');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoadingRelease(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoadingSearch(true);
    setSearchResults(null);
    try {
      const { data } = await api.get(`/parcels/search?roll=${searchRoll}`);
      setSearchResults(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Student not found');
    } finally {
      setLoadingSearch(false);
    }
  };

  const isOverdue = (createdAt) => new Date() - new Date(createdAt) > 72 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Today's Parcels", value: stats.todayCount },
            { label: 'Pending Pickups', value: stats.pendingCount },
            { label: 'Overdue (72h+)', value: stats.overdueCount, red: true },
          ].map(({ label, value, red }) => (
            <div key={label} className={`rounded shadow p-4 text-center ${red ? 'bg-red-50 border border-red-300' : 'bg-white'}`}>
              <p className="text-3xl font-bold text-blue-700">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          ))}
        </div>

        {/* Log New Parcel */}
        <div className="bg-white rounded shadow p-5">
          <h3 className="font-semibold text-lg mb-3">Log New Parcel</h3>
          <form onSubmit={handleLogParcel} className="flex flex-wrap gap-3">
            <input
              className="border rounded px-3 py-2 flex-1 min-w-[150px]"
              placeholder="Tracking ID"
              value={newParcel.trackingId}
              onChange={(e) => setNewParcel({ ...newParcel, trackingId: e.target.value })}
              required
            />
            <select
              className="border rounded px-3 py-2"
              value={newParcel.courierCompany}
              onChange={(e) => setNewParcel({ ...newParcel, courierCompany: e.target.value })}
            >
              {COURIERS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input
              className="border rounded px-3 py-2 flex-1 min-w-[150px]"
              placeholder="Student Roll Number"
              value={newParcel.recipientRoll}
              onChange={(e) => setNewParcel({ ...newParcel, recipientRoll: e.target.value })}
              required
            />
            <button
              className="bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-60"
              disabled={loadingLog}
            >
              {loadingLog ? 'Logging...' : 'Log Parcel'}
            </button>
          </form>
        </div>

        {/* Release Parcel */}
        <div className="bg-white rounded shadow p-5">
          <h3 className="font-semibold text-lg mb-3">Release Parcel (OTP Verify)</h3>
          <form onSubmit={handleRelease} className="flex gap-3">
            <input
              className="border rounded px-3 py-2 w-40 tracking-widest text-center text-lg"
              placeholder="0000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/, '').slice(0, 4))}
              maxLength={4}
              required
            />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded font-medium disabled:opacity-60"
              disabled={loadingRelease}
            >
              {loadingRelease ? 'Releasing...' : 'Release'}
            </button>
          </form>
        </div>

        {/* Search by Roll */}
        <div className="bg-white rounded shadow p-5">
          <h3 className="font-semibold text-lg mb-3">Search Parcels by Roll Number</h3>
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <input
              className="border rounded px-3 py-2 flex-1"
              placeholder="Roll Number"
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              required
            />
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded font-medium disabled:opacity-60"
              disabled={loadingSearch}
            >
              {loadingSearch ? 'Searching...' : 'Search'}
            </button>
          </form>
          {searchResults && (
            <>
              <p className="text-sm text-gray-600 mb-2">
                {searchResults.student.name} — {searchResults.student.email}
              </p>
              {searchResults.parcels.length === 0 ? (
                <p className="text-sm text-gray-400">No parcels found for this student.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-3 py-2 text-left">Tracking ID</th>
                      <th className="border px-3 py-2 text-left">Courier</th>
                      <th className="border px-3 py-2 text-left">Status</th>
                      <th className="border px-3 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.parcels.map((p) => (
                      <tr key={p._id}>
                        <td className="border px-3 py-2">{p.trackingId}</td>
                        <td className="border px-3 py-2">{p.courierCompany}</td>
                        <td className="border px-3 py-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${p.status === 'PickedUp' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="border px-3 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* Pending Parcels List */}
        <div className="bg-white rounded shadow p-5">
          <h3 className="font-semibold text-lg mb-3">Pending Parcels</h3>
          {stats.pendingParcels.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending parcels.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">Tracking ID</th>
                  <th className="border px-3 py-2 text-left">Courier</th>
                  <th className="border px-3 py-2 text-left">Student</th>
                  <th className="border px-3 py-2 text-left">Roll</th>
                  <th className="border px-3 py-2 text-left">Arrived</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingParcels.map((p) => (
                  <tr key={p._id} className={isOverdue(p.createdAt) ? 'bg-red-50' : ''}>
                    <td className="border px-3 py-2">{p.trackingId}</td>
                    <td className="border px-3 py-2">{p.courierCompany}</td>
                    <td className="border px-3 py-2">{p.recipient?.name}</td>
                    <td className="border px-3 py-2">{p.recipient?.rollNumber}</td>
                    <td className="border px-3 py-2">
                      {new Date(p.createdAt).toLocaleString()}
                      {isOverdue(p.createdAt) && (
                        <span className="ml-2 text-xs text-red-600 font-semibold">Overdue</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
