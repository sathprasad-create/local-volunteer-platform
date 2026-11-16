import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import OpportunityForm from '../components/OpportunityForm';

const CreateOpportunity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState({});
  const [banner, setBanner] = useState('');

  const handleSubmit = async (data) => {
    setServerErrors({});
    setBanner('');
    try {
      await axiosInstance.post('/api/opportunities', data, { headers: { Authorization: `Bearer ${user.token}` } });
      navigate('/organiser/opportunities', { state: { published: data.title } });
    } catch (error) {
      if (error.response?.status === 400) setServerErrors(error.response.data.errors || {});
      else setBanner(error.response?.data?.message || 'Could not publish. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">New opportunity</h1>
      {banner && <div className="border-2 border-red-700 text-red-700 rounded p-2 mb-4">{banner}</div>}
      <OpportunityForm onSubmit={handleSubmit} serverErrors={serverErrors} />
    </div>
  );
};

export default CreateOpportunity;