
import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';

import {
    getNotes,
    createNote,
    updateNote,
    updateNoteStatus,
    deleteNote
} from '../controllers/notesController.js';

const router = express.Router();

// Get all notes belonging to the logged-in user
router.get('/', authenticateUser, getNotes);

// Create a new note
router.post('/', authenticateUser, createNote);

// Update an existing note
router.put('/:id', authenticateUser, updateNote);

// Update favourite or archived status
router.patch('/:id/status', authenticateUser, updateNoteStatus);

// Delete an existing note
router.delete('/:id', authenticateUser, deleteNote);

export default router;
