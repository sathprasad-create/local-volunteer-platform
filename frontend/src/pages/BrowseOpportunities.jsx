import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const BrowseOpportunities = () => {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/opportunities', { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => setItems(res.data))
      .catch(() => setError('Could not load opportunities.'));
  }, [user.token]);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Open opportunities</h1>
      {error && <div className="border-2 border-red-700 text-red-700 rounded p-2 mb-4">{error}</div>}
      {items && items.length === 0 && (
        <div className="border-2 border-dashed rounded p-8 text-center text-gray-600">No open opportunities right now. Check back soon.</div>
      )}
      {items && items.map((o) => {
        const left = Math.max(o.capacity - o.approvedCount, 0);
        const full = left === 0;
        return (
          <div key={o._id} className="border rounded p-3 mb-3">
            <div className="flex justify-between">
              <strong>{o.title}</strong>
              {full && <span className="border rounded-full px-2 text-sm">Full</span>}
            </div>
            <div className="text-sm text-gray-600">
              {new Date(o.eventDate).toLocaleDateString()} · {o.location} · closes {new Date(o.closesAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-2 border border-gray-800 rounded overflow-hidden">
                <div className="h-full bg-gray-600" style={{ width: `${(o.approvedCount / o.capacity) * 100}%` }} />
              </div>
              <span className="text-sm">{left} places left</span>
            </div>
            {full ? (
              <button type="button" disabled className="border border-dashed text-gray-500 px-3 py-1 rounded text-sm">Full</button>
            ) : (
              <Link to={`/opportunities/${o._id}`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">View and apply</Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BrowseOpportunities;