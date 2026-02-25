import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Alert, CircularProgress, Chip, Divider
} from '@mui/material';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import type { RootState } from '../../store/store';
import type { Restaurant } from '../../types';

export default function OwnerRestaurant() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', address: '',
    city: '', phone: '', email: '', cuisineType: '',
  });

  useEffect(() => {
    api.get('/api/v1/restaurants')
      .then(res => {
        const owned = res.data.find((r: Restaurant) => r.ownerId === user?.userId);
        if (owned) {
          setRestaurant(owned);
          setForm({
            name: owned.name,
            description: owned.description,
            address: owned.address,
            city: owned.city,
            phone: owned.phone || '',
            email: owned.email || '',
            cuisineType: owned.cuisineType,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (restaurant) {
        await api.put(`/api/v1/restaurants/${restaurant.id}`, form);
        setSuccess('Restaurant updated successfully!');
      } else {
        const res = await api.post('/api/v1/restaurants', {
          ...form,
          ownerId: user?.userId,
        });
        setRestaurant(res.data);
        setSuccess('Restaurant created successfully!');
      }
    } catch {
      setError('Failed to save restaurant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress sx={{ color: '#E53935' }} />
    </Box>
  );

  return (
    <Box>
      {restaurant && (
        <Card elevation={1} sx={{ mb: 3, backgroundColor: '#fff8f8' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">{restaurant.name}</Typography>
              <Chip label={restaurant.active ? 'Active' : 'Inactive'}
                color={restaurant.active ? 'success' : 'error'} size="small" />
            </Box>
            <Typography color="text.secondary">{restaurant.city}</Typography>
            <Typography color="text.secondary">{restaurant.cuisineType}</Typography>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        {restaurant ? 'Update Restaurant Details' : 'Create Your Restaurant'}
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Divider sx={{ mb: 2 }} />

      <TextField fullWidth label="Restaurant Name" name="name"
        margin="normal" value={form.name} onChange={handleChange} />
      <TextField fullWidth label="Description" name="description"
        margin="normal" value={form.description} onChange={handleChange} />
      <TextField fullWidth label="Cuisine Type" name="cuisineType"
        margin="normal" value={form.cuisineType} onChange={handleChange}
        placeholder="e.g. South African, Italian, Chinese" />
      <TextField fullWidth label="Address" name="address"
        margin="normal" value={form.address} onChange={handleChange} />
      <TextField fullWidth label="City" name="city"
        margin="normal" value={form.city} onChange={handleChange} />
      <TextField fullWidth label="Phone" name="phone"
        margin="normal" value={form.phone} onChange={handleChange} />
      <TextField fullWidth label="Email" name="email" type="email"
        margin="normal" value={form.email} onChange={handleChange} />

      <Button
        variant="contained" size="large" sx={{ mt: 2, backgroundColor: '#E53935' }}
        onClick={handleSave} disabled={saving}
      >
        {saving ? 'Saving...' : restaurant ? 'Update Restaurant' : 'Create Restaurant'}
      </Button>
    </Box>
  );
}