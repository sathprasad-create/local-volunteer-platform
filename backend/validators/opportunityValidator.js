const validateOpportunity = (input, now = new Date()) => {
    const errors = {};

    const title = (input.title || '').trim();
    if (title.length < 3 || title.length > 100) errors.title = 'Title must be 3 to 100 characters';

    if ((input.description || '').length > 1000) errors.description = 'Description must be 1,000 characters or fewer';

    if (!(input.location || '').trim()) errors.location = 'Location is required';

    const eventDate = new Date(input.eventDate);
    if (!input.eventDate || isNaN(eventDate)) errors.eventDate = 'Event date is required';
    else if (eventDate <= now) errors.eventDate = 'Event date must be in the future';

    const closesAt = new Date(input.closesAt);
    if (!input.closesAt || isNaN(closesAt)) errors.closesAt = 'Close date is required';
    else if (!errors.eventDate && closesAt > eventDate) errors.closesAt = 'Applications must close on or before the event date';

    const capacity = Number(input.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) errors.capacity = 'Capacity must be a whole number from 1 to 100';

    return errors;
};

module.exports = { validateOpportunity };