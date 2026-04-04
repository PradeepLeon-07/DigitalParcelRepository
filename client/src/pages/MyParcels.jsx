import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const MyParcels = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parcels/mine')
      .then(({ data }) => setParcels(data))
      .catch(() => toast.error('Failed to load parcels'))
      .finally(() => setLoading(false));
  }, []);

  const statusStyle = (status) =>
    status === 'PickedUp'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">My Parcels</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : parcels.length === 0 ? (
          <p className="text-gray-500">No parcels found.</p>
        ) : (
          <div className="space-y-3">
            {parcels.map((p) => (
              <div key={p._id} className="bg-white rounded shadow p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{p.trackingId}</p>
                  <p className="text-sm text-gray-500">
                    {p.courierCompany} · {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${statusStyle(p.status)}`}>
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
