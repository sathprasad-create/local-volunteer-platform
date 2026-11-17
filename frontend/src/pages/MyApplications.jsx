import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const labels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  'closed-not-selected': 'Closed, not selected',
};

const MyApplications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/applications/mine', { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => setItems(res.data))
      .catch(() => setError('Could not load your applications.'));
  }, [user.token]);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">My applications</h1>
      {error && <div className="border-2 border-red-700 text-red-700 rounded p-2 mb-4">{error}</div>}
      {items && items.length === 0 && (
        <div className="border-2 border-dashed rounded p-8 text-center text-gray-600">
          <p className="mb-3">You haven't applied for anything yet.</p>
          <Link to="/opportunities" className="bg-blue-600 text-white px-4 py-2 rounded">Browse opportunities</Link>
        </div>
      )}
      {items && items.map((a) => (
        <div key={a._id} className="border rounded p-3 mb-3">
          <div className="flex justify-between">
            <strong>{a.opportunity?.title || 'Opportunity removed'}</strong>
            <span className={`border rounded-full px-2 text-sm ${a.displayStatus === 'closed-not-selected' ? 'border-dashed' : ''}`}>
              {labels[a.displayStatus] || a.displayStatus}
            </span>
          </div>
          {a.opportunity && (
            <div className="text-sm text-gray-600">
              {new Date(a.opportunity.eventDate).toLocaleDateString()} · {a.opportunity.location}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyApplications;