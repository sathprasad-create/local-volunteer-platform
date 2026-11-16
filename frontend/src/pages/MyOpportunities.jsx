import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const MyOpportunities = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const auth = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
    const query = filter === 'all' ? '' : `?status=${filter}`;
    axiosInstance.get(`/api/opportunities/mine${query}`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => setItems(res.data))
      .catch(() => setError('Could not load your opportunities.'));
  }, [user.token, filter]);

  const closeOne = async (id) => {
    setError('');
    try {
      const { data } = await axiosInstance.patch(`/api/opportunities/${id}/close`, {}, auth);
      setItems((list) => list.map((o) => (o._id === id ? data : o)));
      setConfirmingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not close this opportunity.');
    }
  };

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
      {error && <div className="border-2 border-red-700 text-red-700 rounded p-2 mb-4">{error}</div>}
      <div className="flex gap-2 mb-4 text-sm">
        {['all', 'open', 'closed'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`border rounded-full px-3 py-1 ${filter === f ? 'border-gray-800 font-bold' : 'border-gray-400'}`}
          >
            {f === 'all' ? 'All' : f === 'open' ? 'Open' : 'Closed'}
          </button>
        ))}
      </div>
      {items && items.length === 0 && (
        <div className="border-2 border-dashed rounded p-8 text-center text-gray-600">
          {filter === 'all' ? 'No opportunities yet. Create your first.' : `No ${filter} opportunities.`}
        </div>
      )}
      {items && items.map((o) => (
        <div key={o._id} className="border rounded p-3 mb-3">
          <div className="flex justify-between">
            <strong>{o.title}</strong>
            <span className={`border rounded-full px-2 text-sm ${o.status === 'closed' ? 'border-dashed text-gray-600' : ''}`}>
              {o.status === 'closed' ? 'Closed' : 'Open'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {new Date(o.eventDate).toLocaleDateString()} · {o.location} · closes {new Date(o.closesAt).toLocaleDateString()}
          </div>
          <div className="text-sm">{o.approvedCount} of {o.capacity} places filled</div>
          {o.status === 'open' && confirmingId !== o._id && (
            <div className="flex gap-4 mt-2 text-sm">
              <Link to={`/organiser/opportunities/${o._id}/edit`} className="text-blue-700 underline">Edit</Link>
              <button type="button" onClick={() => setConfirmingId(o._id)} className="text-red-700 underline">Close</button>
            </div>
          )}
          {confirmingId === o._id && (
            <div className="border-2 border-gray-800 rounded p-3 mt-2 text-sm">
              <p className="font-semibold">Close {o.title}?</p>
              <p className="mb-2">No new applications will be accepted. Pending applications will show as Closed, not selected. Approved volunteers keep their place.</p>
              <button type="button" onClick={() => setConfirmingId(null)} className="border border-gray-800 px-3 py-1 rounded mr-2">Cancel</button>
              <button type="button" onClick={() => closeOne(o._id)} className="bg-gray-800 text-white px-3 py-1 rounded">Close opportunity</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyOpportunities;