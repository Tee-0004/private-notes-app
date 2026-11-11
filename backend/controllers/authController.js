
import supabase from '../config/supabase.js';

// ==========================================
// USER REGISTRATION
// ==========================================

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Full name, email and password are required'
      });
    }

    // Validate full name
    if (!fullName.trim()) {
      return res.status(400).json({
        message: 'Please enter your full name'
      });
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim()
        }
      }
    });

    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(201).json({
      message: 'Account created successfully',
      user: data.user
    });

  
} catch (error) {
  console.error('LOGIN ERROR:', error);

  return res.status(500).json({
    message: 'Server error during login'
  });
}

};


// ==========================================
// USER LOGIN
// ==========================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Sign in user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        message: error.message
      });
    }

    // Store session in HTTP-only cookie
    res.cookie('token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
      path: '/'
    });

    return res.status(200).json({
      message: 'Login successful',
      user: data.user
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error during login'
    });
  }
};


// ==========================================
// USER LOGOUT
// ==========================================

export const logout = async (req, res) => {
  try {

    // Clear the HTTP-only authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    return res.status(200).json({
      message: 'Logout successful'
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error during logout'
    });
  }
};
