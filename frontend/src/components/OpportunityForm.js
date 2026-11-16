import { useState } from 'react';
import validateOpportunity from '../utils/validateOpportunity';

const empty = { title: '', description: '', location: '', eventDate: '', closesAt: '', capacity: '' };

const Field = ({ label, error, children }) => (
  <label className="block mb-4">
    <span className="block text-sm font-semibold mb-1">{label}</span>
    {children}
    {error && <span className="block text-sm text-red-700 mt-1">{error}</span>}
  </label>
);

const OpportunityForm = ({ onSubmit, serverErrors = {} }) => {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const shown = { ...errors, ...serverErrors };
  const cls = (key) => `w-full p-2 border rounded ${shown[key] ? 'border-red-700' : 'border-gray-400'}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateOpportunity(form);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit({ ...form, capacity: Number(form.capacity) });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white p-6 shadow-md rounded">
      <Field label="Title" error={shown.title}>
        <input className={cls('title')} value={form.title} onChange={set('title')} />
      </Field>
      <Field label="Description (optional)" error={shown.description}>
        <textarea className={cls('description')} rows="3" value={form.description} onChange={set('description')} />
      </Field>
      <Field label="Location" error={shown.location}>
        <input className={cls('location')} value={form.location} onChange={set('location')} />
      </Field>
      <Field label="Event date" error={shown.eventDate}>
        <input type="date" className={cls('eventDate')} value={form.eventDate} onChange={set('eventDate')} />
      </Field>
      <Field label="Applications close" error={shown.closesAt}>
        <input type="date" className={cls('closesAt')} value={form.closesAt} onChange={set('closesAt')} />
      </Field>
      <Field label="Capacity (1 to 100)" error={shown.capacity}>
        <input type="number" className={cls('capacity')} value={form.capacity} onChange={set('capacity')} />
      </Field>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Publish opportunity</button>
    </form>
  );
};

export default OpportunityForm;