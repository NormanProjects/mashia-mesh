import { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, CardActions,
  Typography, Button, Box, Chip, TextField, CircularProgress
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Restaurant } from '../types';

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/restaurants')
      .then(res => {
        setRestaurants(res.data);
        setFiltered(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(restaurants.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisineType.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q)
    ));
  }, [search, restaurants]);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress sx={{ color: '#E53935' }} />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Restaurants
      </Typography>

      <TextField
        fullWidth placeholder="Search by name, cuisine or city..."
        value={search} onChange={e => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {filtered.length === 0 ? (
        <Typography color="text.secondary">No restaurants found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {filtered.map(r => (
           <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
              <Card elevation={2} sx={{
                height: '100%', display: 'flex',
                flexDirection: 'column',
                '&:hover': { elevation: 6, transform: 'translateY(-2px)' },
                transition: 'transform 0.2s'
              }}>
                <Box sx={{
                  height: 140,
                  backgroundColor: '#FFEBEE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 60
                }}>
                  🍽️
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {r.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {r.description}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="error" />
                    <Typography variant="body2">{r.city}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip label={r.cuisineType} size="small" color="error" variant="outlined" />
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StarIcon fontSize="small" sx={{ color: '#FFC107' }} />
                      <Typography variant="body2">{r.rating || 'New'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth variant="contained"
                    sx={{ backgroundColor: '#E53935' }}
                    onClick={() => navigate(`/restaurants/${r.id}`)}
                  >
                    View Menu
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}