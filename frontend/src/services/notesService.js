
import { apiRequest } from './api';

// Retrieve all notes belonging to the logged-in user
export const getNotes = async () => {
  return await apiRequest('/notes', {
    method: 'GET',
  });
};

// Create a new note
export const createNote = async (title, content) => {
  return await apiRequest('/notes', {
    method: 'POST',
    body: JSON.stringify({
      title,
      content,
    }),
  });
};

// Update an existing note
export const updateNote = async (id, title, content) => {
  return await apiRequest(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title,
      content,
    }),
  });
};

// Update favourite or archived status
export const updateNoteStatus = async (id, updates) => {
  return await apiRequest(`/notes/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

// Delete an existing note
export const deleteNote = async (id) => {
  return await apiRequest(`/notes/${id}`, {
    method: 'DELETE',
  });
};
