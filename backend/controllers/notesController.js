
import { createAuthenticatedClient } from '../config/supabase.js';

// Get all notes belonging to the logged-in user
export const getNotes = async (req, res) => {
    try {
        const userSupabase = createAuthenticatedClient(req.accessToken);

        const { data, error } = await userSupabase
            .from('notes')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(200).json(data);

    } catch (error) {
    console.error('CREATE NOTE ERROR:', error);

    return res.status(500).json({
        message: 'Server error while creating note.'
    });
}
};

// Create a new note
export const createNote = async (req, res) => {
    try {
        const userSupabase = createAuthenticatedClient(req.accessToken);
        const { title, content } = req.body;

        if (
            typeof title !== 'string' ||
            !title.trim() ||
            typeof content !== 'string' ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: 'Title and content are required.'
            });
        }

        const { data, error } = await userSupabase
            .from('notes')
            .insert({
                user_id: req.user.id,
                title: title.trim(),
                content
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(201).json({
            message: 'Note created successfully.',
            note: data
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error while creating note.'
        });
    }
};

// Update an existing note
export const updateNote = async (req, res) => {
    try {
        const userSupabase = createAuthenticatedClient(req.accessToken);
        const { id } = req.params;
        const { title, content } = req.body;

        if (
            typeof title !== 'string' ||
            !title.trim() ||
            typeof content !== 'string' ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: 'Title and content are required.'
            });
        }

        const { data, error } = await userSupabase
            .from('notes')
            .update({
                title: title.trim(),
                content,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(200).json({
            message: 'Note updated successfully.',
            note: data
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error while updating note.'
        });
    }
};

// Update favourite or archived status
export const updateNoteStatus = async (req, res) => {
    try {
        const userSupabase = createAuthenticatedClient(req.accessToken);
        const { id } = req.params;
        const { is_favorite, is_archived } = req.body;

        const updates = {};

        if (typeof is_favorite === 'boolean') {
            updates.is_favorite = is_favorite;
        }

        if (typeof is_archived === 'boolean') {
            updates.is_archived = is_archived;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'Provide a valid favourite or archive status.'
            });
        }

        updates.updated_at = new Date().toISOString();

        const { data, error } = await userSupabase
            .from('notes')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(200).json({
            message: 'Note status updated successfully.',
            note: data
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error while updating note status.'
        });
    }
};

// Delete an existing note
export const deleteNote = async (req, res) => {
    try {
        const userSupabase = createAuthenticatedClient(req.accessToken);
        const { id } = req.params;

        const { data, error } = await userSupabase
            .from('notes')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select('id');

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                message: 'Note not found.'
            });
        }

        return res.status(200).json({
            message: 'Note deleted successfully.'
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error while deleting note.'
        });
    }
};
