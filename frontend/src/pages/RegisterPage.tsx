import { useState } from 'react';
import {
  Container, Box, TextField, Button, Typography,
  Alert, Paper, Link, MenuItem, Select,
  FormControl, InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/MashiaMeshLogo.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', phone: '', role: 'CUSTOMER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/v1/auth/register', form);
      navigate('/login');
    } catch {
      setError('Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
            <Box component="img" src={logo} alt="MashiaMesh" sx={{ height: 100 }} />
          </Box>

          <Typography variant="h6" textAlign="center" gutterBottom color="text.secondary">
            Create your account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField fullWidth label="First Name" name="firstName"
            margin="normal" value={form.firstName} onChange={handleChange} />
          <TextField fullWidth label="Last Name" name="lastName"
            margin="normal" value={form.lastName} onChange={handleChange} />
          <TextField fullWidth label="Email" name="email" type="email"
            margin="normal" value={form.email} onChange={handleChange} />
          <TextField fullWidth label="Phone" name="phone"
            margin="normal" value={form.phone} onChange={handleChange} />
          <TextField fullWidth label="Password" name="password" type="password"
            margin="normal" value={form.password} onChange={handleChange} />

          <FormControl fullWidth margin="normal">
            <InputLabel>I am a...</InputLabel>
            <Select
              value={form.role}
              label="I am a..."
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <MenuItem value="CUSTOMER">Customer</MenuItem>
              <MenuItem value="RESTAURANT_OWNER">Restaurant Owner</MenuItem>
              <MenuItem value="DELIVERY_DRIVER">Delivery Driver</MenuItem>
            </Select>
          </FormControl>

          <Button
            fullWidth variant="contained" size="large"
            sx={{ mt: 2, backgroundColor: '#E53935' }}
            onClick={handleRegister} disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <Typography textAlign="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link href="/login" underline="hover">Sign in</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}