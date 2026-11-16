import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import OpportunityForm from '../components/OpportunityForm';

const toDateInput = (value) => new Date(value).toISOString().slice(0, 10);

const EditOpportunity = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  const [banner, setBanner] = useState('');

  useEffect(() => {
    axiosInstance.get(`/api/opportunities/${id}`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(({ data }) => setInitial({
        title: data.title,
        description: data.description || '',
        location: data.location,
        eventDate: toDateInput(data.eventDate),
        closesAt: toDateInput(data.closesAt),
        capacity: String(data.capacity),
      }))
      .catch((error) => setBanner(error.response?.data?.message || 'Could not load this opportunity.'));
  }, [id, user.token]);

  const handleSubmit = async (data) => {
    setServerErrors({});
    setBanner('');
    try {
      await axiosInstance.put(`/api/opportunities/${id}`, data, { headers: { Authorization: `Bearer ${user.token}` } });
      navigate('/organiser/opportunities', { state: { updated: data.title } });
    } catch (error) {
      if (error.response?.status === 400) setServerErrors(error.response.data.errors || {});
      else setBanner(error.response?.data?.message || 'Could not save. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Edit opportunity</h1>
      {banner && <div className="border-2 border-red-700 text-red-700 rounded p-2 mb-4">{banner}</div>}
      {initial && <OpportunityForm initial={initial} submitLabel="Save changes" onSubmit={handleSubmit} serverErrors={serverErrors} />}
    </div>
  );
};

export default EditOpportunity;