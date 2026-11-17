import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const labels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  'closed-not-selected': 'Closed, not selected',
};

const Applicants = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [banner, setBanner] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(() => {
    axiosInstance.get(`/api/opportunities/${id}/applications`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => setData(res.data))
      .catch((err) => setBanner(err.response?.data?.message || 'Could not load applicants.'));
  }, [id, user.token]);

  useEffect(() => { load(); }, [load]);

  const decide = async (application, decision) => {
    setBanner('');
    setToast('');
    try {
      await axiosInstance.patch(`/api/applications/${application._id}/decision`, { decision }, { headers: { Authorization: `Bearer ${user.token}` } });
      setToast(`${application.volunteer?.name || 'Applicant'} ${decision}.`);
    } catch (err) {
      setBanner(err.response?.data?.message || 'Could not save the decision.');
    }
    load();
  };

  if (!data) return <div className="max-w-3xl mx-auto mt-10 px-4">{banner || 'Loading...'}</div>;

  const { opportunity, applications } = data;
  const closed = opportunity.status === 'closed';

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Link to="/organiser/opportunities" className="text-sm underline">Back to my opportunities</Link>
      {toast && <div className="border-2 border-gray-800 bg-gray-100 rounded p-2 my-3 font-semibold">{toast}</div>}
      {banner && <div className="border-2 border-red-700 text-red-700 rounded p-2 my-3 font-semibold">{banner}</div>}
      <div className="flex justify-between items-center mt-2">
        <h1 className="text-2xl font-bold">{opportunity.title}</h1>
        {closed && <span className="border border-dashed rounded-full px-2 text-sm text-gray-600">Closed</span>}
      </div>
      <p className="text-sm my-2">{opportunity.approvedCount} of {opportunity.capacity} places filled</p>
      {closed && <p className="border border-dashed rounded p-2 text-sm mb-3">Read only. Nothing is deleted.</p>}
      <h2 className="font-semibold mt-4 mb-2">Applicants ({applications.length})</h2>
      {applications.length === 0 && (
        <div className="border-2 border-dashed rounded p-8 text-center text-gray-600">No applications yet. Volunteers appear here when they apply.</div>
      )}
      {applications.map((a) => (
        <div key={a._id} className="border-b py-3">
          <div className="flex justify-between">
            <strong>{a.volunteer?.name || 'Volunteer'}</strong>
            <span className="border rounded-full px-2 text-sm">{labels[a.displayStatus] || a.displayStatus}</span>
          </div>
          {a.message && <p className="text-sm text-gray-700 my-1">{a.message}</p>}
          {!closed && a.status === 'pending' && (
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => decide(a, 'approved')} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">Approve</button>
              <button type="button" onClick={() => decide(a, 'rejected')} className="border border-gray-800 px-3 py-1 rounded text-sm">Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Applicants;