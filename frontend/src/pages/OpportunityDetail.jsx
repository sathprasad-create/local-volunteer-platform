import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const OpportunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [opp, setOpp] = useState(null);
  const [message, setMessage] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [banner, setBanner] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(() => {
    axiosInstance.get(`/api/opportunities/${id}/view`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then((res) => setOpp(res.data))
      .catch((err) => setBanner(err.response?.data?.message || 'Could not load this opportunity.'));
  }, [id, user.token]);

  useEffect(() => { load(); }, [load]);

  const apply = async (e) => {
    e.preventDefault();
    setBanner('');
    setFieldError('');
    setToast('');
    if (message.length > 300) {
      setFieldError('Message must be 300 characters or fewer');
      return;
    }
    try {
      await axiosInstance.post(`/api/opportunities/${id}/applications`, { message }, { headers: { Authorization: `Bearer ${user.token}` } });
      setToast('Application sent');
      load();
    } catch (err) {
      if (err.response?.status === 400) {
        setFieldError(err.response.data.errors?.message || 'Please check your message');
      } else {
        setBanner(err.response?.data?.message || 'Could not apply. Please try again.');
        load();
      }
    }
  };

  if (!opp) return <div className="max-w-xl mx-auto mt-10 px-4">{banner || 'Loading...'}</div>;

  const left = Math.max(opp.capacity - opp.approvedCount, 0);
  const date = (value) => new Date(value).toLocaleDateString();

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <Link to="/opportunities" className="text-sm underline">Back to opportunities</Link>
      {toast && <div className="border-2 border-gray-800 bg-gray-100 rounded p-2 my-3 font-semibold">{toast}</div>}
      {banner && <div className="border-2 border-red-700 text-red-700 rounded p-2 my-3 font-semibold">{banner}</div>}
      <h1 className="text-2xl font-bold mt-2">{opp.title}</h1>
      <p>{date(opp.eventDate)} · {opp.location}</p>
      <p className="text-sm text-gray-600">Applications close {date(opp.closesAt)}</p>
      <p className="text-sm my-2">{left} places left</p>
      {opp.description && <p className="my-3 whitespace-pre-line">{opp.description}</p>}

      {opp.myApplication ? (
        <div className="border rounded p-3 flex justify-between items-center mt-3">
          <span>Your application</span>
          <span className="border rounded-full px-2 text-sm capitalize">{opp.myApplication}</span>
        </div>
      ) : opp.status === 'closed' ? (
        <button type="button" disabled className="border border-dashed text-gray-500 px-4 py-2 rounded mt-3">Applications closed</button>
      ) : left === 0 ? (
        <button type="button" disabled className="border border-dashed text-gray-500 px-4 py-2 rounded mt-3">Full</button>
      ) : (
        <form onSubmit={apply} className="mt-3">
          <label className="block mb-3">
            <span className="block text-sm font-semibold mb-1">Message to the organiser (optional, up to 300 characters)</span>
            <textarea
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full p-2 border rounded ${fieldError ? 'border-red-700' : 'border-gray-400'}`}
            />
            <span className="text-xs text-gray-600">{message.length}/300</span>
            {fieldError && <span className="block text-sm text-red-700">{fieldError}</span>}
          </label>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Apply</button>
        </form>
      )}
    </div>
  );
};

export default OpportunityDetail;