import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Alert, CircularProgress, Switch,
  FormControlLabel, Divider, IconButton, Chip, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import type { RootState } from '../../store/store';
import type { MenuItem, Restaurant } from '../../types';

export default function OwnerMenu() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', price: '',
    category: '', available: true,
  });

  useEffect(() => {
    api.get('/api/v1/restaurants')
      .then(res => {
        const owned = res.data.find((r: Restaurant) => r.ownerId === user?.userId);
        if (owned) {
          setRestaurant(owned);
          return api.get(`/api/v1/restaurants/${owned.id}/menu`);
        }
      })
      .then(res => { if (res) setMenu(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddItem = async () => {
    if (!restaurant) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/api/v1/restaurants/${restaurant.id}/menu`, {
        ...form,
        price: parseFloat(form.price),
      });
      setMenu([...menu, res.data]);
      setForm({ name: '', description: '', price: '', category: '', available: true });
      setSuccess('Menu item added!');
    } catch {
      setError('Failed to add item.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    await api.patch(
      `/api/v1/restaurants/${restaurant?.id}/menu/items/${item.id}/availability?available=${!item.available}`
    );
    setMenu(menu.map(m =>
      m.id === item.id ? { ...m, available: !m.available } : m
    ));
  };

  const handleDelete = async (itemId: number) => {
    await api.delete(`/api/v1/restaurants/${restaurant?.id}/menu/items/${itemId}`);
    setMenu(menu.filter(m => m.id !== itemId));
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress sx={{ color: '#E53935' }} />
    </Box>
  );

  if (!restaurant) return (
    <Alert severity="info">
      Please create your restaurant first in the "My Restaurant" tab.
    </Alert>
  );

  const categories = [...new Set(menu.map(i => i.category).filter(Boolean))];

  return (
    <Box>
      {/* Add new item form */}
      <Card elevation={2} sx={{ mb: 3, p: 1 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            <AddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Add New Menu Item
          </Typography>

          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Item Name" name="name"
                value={form.name} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField fullWidth label="Price (R)" name="price"
                type="number" value={form.price} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField fullWidth label="Category" name="category"
                value={form.category} onChange={handleChange}
                placeholder="e.g. Mains, Starters" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Description" name="description"
                value={form.description} onChange={handleChange} />
            </Grid>
          </Grid>

          <Button
            variant="contained" sx={{ mt: 2, backgroundColor: '#E53935' }}
            onClick={handleAddItem} disabled={saving}
            startIcon={<AddIcon />}
          >
            {saving ? 'Adding...' : 'Add Item'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing menu items */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Current Menu ({menu.length} items)
      </Typography>

      {menu.length === 0 ? (
        <Typography color="text.secondary">No menu items yet. Add your first item above!</Typography>
      ) : (
        categories.length > 0 ? categories.map(cat => (
          <Box key={cat} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold"
              sx={{ mb: 1, color: '#E53935' }}>
              {cat}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {menu.filter(m => m.category === cat).map(item => (
              <Card key={item.id} elevation={1} sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography fontWeight="bold">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                      <Typography color="error" fontWeight="bold">
                        R{item.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={item.available ? 'Available' : 'Unavailable'}
                        color={item.available ? 'success' : 'default'}
                        size="small"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={item.available}
                            onChange={() => handleToggleAvailability(item)}
                            color="success"
                          />
                        }
                        label=""
                      />
                      <IconButton color="error" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )) : menu.map(item => (
          <Card key={item.id} elevation={1} sx={{ mb: 1 }}>
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography fontWeight="bold">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography color="error" fontWeight="bold">
                    R{item.price.toFixed(2)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={item.available ? 'Available' : 'Unavailable'}
                    color={item.available ? 'success' : 'default'}
                    size="small"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={item.available}
                        onChange={() => handleToggleAvailability(item)}
                        color="success"
                      />
                    }
                    label=""
                  />
                  <IconButton color="error" onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}