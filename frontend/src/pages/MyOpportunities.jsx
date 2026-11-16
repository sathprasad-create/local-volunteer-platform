import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const MyOpportunities = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/opportunities/mine', { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => setItems(res.data))
      .catch(() => setError('Could not load your opportunities.'));
  }, [user.token]);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My opportunities</h1>
        <Link to="/organiser/opportunities/new" className="bg-blue-600 text-white px-4 py-2 rounded">New opportunity</Link>
      </div>
      {location.state?.published && (
        <div className="border-2 border-green-700 rounded p-2 mb-4 font-semibold">Published: {location.state.published}</div>
      )}
      {location.state?.updated && (
        <div className="border-2 border-green-700 rounded p-2 mb-4 font-semibold">Saved: {location.state.updated}</div>
      )}
      {error && <p className="text-red-700">{error}</p>}
      {items && items.length === 0 && (
        <div className="border-2 border-dashed rounded p-8 text-center text-gray-600">No opportunities yet. Create your first one.</div>
      )}
      {items && items.map((o) => (
        <div key={o._id} className="border rounded p-3 mb-3">
          <div className="flex justify-between">
            <strong>{o.title}</strong>
            <span className="border rounded-full px-2 text-sm">Open</span>
          </div>
          <div className="text-sm text-gray-600">
            {new Date(o.eventDate).toLocaleDateString()} · {o.location} · closes {new Date(o.closesAt).toLocaleDateString()}
          </div>
          <div className="text-sm">{o.approvedCount} of {o.capacity} places filled</div>
          <Link to={`/organiser/opportunities/${o._id}/edit`} className="text-blue-600 text-sm">Edit</Link>
        </div>
      ))}
    </div>
  );
};

export default MyOpportunities;