import { useState } from 'react';
import {
  Container, Box, TextField, Button, Typography,
  Alert, Paper, Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../api/axios';
import { login } from '../store/slices/authSlice';
import logo from '../assets/MashiaMeshLogo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/v1/auth/login', { email, password });
      dispatch(login(res.data));
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
         <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
  <Box
    component="img"
    src={logo}
    alt="MashiaMesh"
    sx={{ height: 100 }}
  />
</Box>
          <Typography variant="h6" textAlign="center" gutterBottom color="text.secondary">
            Sign in to your account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth label="Email" type="email" margin="normal"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <TextField
            fullWidth label="Password" type="password" margin="normal"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />

          <Button
            fullWidth variant="contained" size="large"
            sx={{ mt: 2, backgroundColor: '#E53935' }}
            onClick={handleLogin} disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Typography textAlign="center" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link href="/register" underline="hover">Register here</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}