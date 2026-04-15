import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const MyParcels = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  useEffect(() => {
    api.get('/parcels/mine')
      .then(({ data }) => setParcels(data))
      .catch(() => toast.error('Failed to load parcels'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        <div>
          <h2 className="text-xl font-bold text-gray-800">My Parcels</h2>
          <p className="text-sm text-gray-500">Welcome, {auth?.name}. Here are all your parcels.</p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
          📧 When your parcel arrives, you'll get a 4-digit OTP on your email. Show it to the admin to collect.
        </div>

        {loading && <p className="text-gray-400 text-sm">Loading...</p>}

        {!loading && parcels.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p>No parcels yet.</p>
          </div>
        )}

        {!loading && parcels.length > 0 && (
          <div className="space-y-3">
            {parcels.map((p) => (
              <div key={p._id} className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{p.trackingId}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {p.courierCompany} · {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${p.status === 'PickedUp' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyParcels;
