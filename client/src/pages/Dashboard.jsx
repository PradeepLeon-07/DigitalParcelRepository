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

  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500';
  const btnBlue = 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50';
  const btnGreen = 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50';
  const btnGray = 'bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50';

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-blue-500">
            <p className="text-3xl font-bold text-blue-600">{stats.todayCount}</p>
            <p className="text-sm text-gray-500 mt-1">Today's Parcels</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-yellow-400">
            <p className="text-3xl font-bold text-yellow-500">{stats.pendingCount}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Pickups</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-red-500">
            <p className="text-3xl font-bold text-red-500">{stats.overdueCount}</p>
            <p className="text-sm text-gray-500 mt-1">Overdue (72h+)</p>
          </div>
        </div>

        {/* Log + Release */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">📥 Log New Parcel</h3>
            <form onSubmit={handleLogParcel} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tracking ID</label>
                <input className={inputCls} placeholder="e.g. AMZ123456" value={newParcel.trackingId}
                  onChange={(e) => setNewParcel({ ...newParcel, trackingId: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Courier</label>
                <select className={inputCls} value={newParcel.courierCompany}
                  onChange={(e) => setNewParcel({ ...newParcel, courierCompany: e.target.value })}>
                  {COURIERS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Student Roll Number</label>
                <input className={inputCls} placeholder="e.g. CS2021001" value={newParcel.recipientRoll}
                  onChange={(e) => setNewParcel({ ...newParcel, recipientRoll: e.target.value })} required />
              </div>
              <button className={btnBlue} disabled={loadingLog}>
                {loadingLog ? 'Logging...' : 'Log Parcel'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">🔓 Release Parcel</h3>
            <p className="text-sm text-gray-500 mb-4">Enter the 4-digit OTP the student received on their email.</p>
            <form onSubmit={handleRelease} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">OTP</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-3 text-2xl font-bold tracking-widest text-center focus:outline-none focus:border-blue-500"
                  placeholder="0000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/, '').slice(0, 4))}
                  maxLength={4}
                  required
                />
              </div>
              <button className={btnGreen} disabled={loadingRelease}>
                {loadingRelease ? 'Releasing...' : 'Verify & Release'}
              </button>
            </form>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">🔍 Search by Roll Number</h3>
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <input className={inputCls} placeholder="Enter roll number..." value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)} required />
            <button className={btnGray} disabled={loadingSearch}>
              {loadingSearch ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchResults && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">{searchResults.student.name}</span> — {searchResults.student.email}
              </p>
              {searchResults.parcels.length === 0 ? (
                <p className="text-sm text-gray-400">No parcels found for this student.</p>
              ) : (
                <table className="w-full text-sm border border-gray-200 rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Tracking ID', 'Courier', 'Status', 'Date'].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-xs text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.parcels.map((p) => (
                      <tr key={p._id} className="border-t border-gray-100">
                        <td className="px-3 py-2">{p.trackingId}</td>
                        <td className="px-3 py-2">{p.courierCompany}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${p.status === 'PickedUp' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Pending Parcels */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">📋 Pending Parcels</h3>
          {stats.pendingParcels.length === 0 ? (
            <p className="text-sm text-gray-400">No pending parcels right now.</p>
          ) : (
            <table className="w-full text-sm border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  {['Tracking ID', 'Courier', 'Student', 'Roll No.', 'Arrived', 'Status'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-xs text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.pendingParcels.map((p) => (
                  <tr key={p._id} className={`border-t border-gray-100 ${isOverdue(p.createdAt) ? 'bg-red-50' : ''}`}>
                    <td className="px-3 py-2">{p.trackingId}</td>
                    <td className="px-3 py-2">{p.courierCompany}</td>
                    <td className="px-3 py-2">{p.recipient?.name}</td>
                    <td className="px-3 py-2 text-gray-500">{p.recipient?.rollNumber}</td>
                    <td className="px-3 py-2 text-gray-500">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      {isOverdue(p.createdAt)
                        ? <span className="text-xs px-2 py-0.5 rounded font-medium bg-red-100 text-red-600">Overdue</span>
                        : <span className="text-xs px-2 py-0.5 rounded font-medium bg-yellow-100 text-yellow-700">Pending</span>
                      }
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
