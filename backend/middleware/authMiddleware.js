import supabase from '../config/supabase.js';

export const authenticateUser = async (req, res, next) => {
    try {

        // Get the JWT from the HTTP-only cookie
        const token = req.cookies?.token;

        // Check if the token exists
        if (!token) {
            return res.status(401).json({
                message: 'Access denied. Please log in.'
            });
        }

        // Verify the token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        // Check if the token is valid
        if (error || !user) {
            return res.status(401).json({
                message: 'Invalid or expired token.'
            });
        }

        // Attach authenticated user to the request
        req.user = user;

        // Attach token for future Supabase requests
        req.accessToken = token;

        // Allow request to continue
        next();

    } catch (error) {
        return res.status(500).json({
            message: 'Authentication failed.'
        });
    }
};