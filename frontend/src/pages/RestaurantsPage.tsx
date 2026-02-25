import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, TextField, InputAdornment,
  Card, CardContent, CardActions, Button, Chip, Skeleton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import type { Restaurant } from '../types';
import type { RootState } from '../store/store';
import logo from '../assets/MashiaMeshLogo.png';

const CUISINE_EMOJIS: Record<string, string> = {
  'South African': '🍖',
  'Italian': '🍕',
  'Chinese': '🥡',
  'Indian': '🍛',
  'American': '🍔',
  'Mexican': '🌮',
  'Japanese': '🍱',
  'Thai': '🍜',
  'default': '🍽️',
};

const getCuisineEmoji = (cuisine: string) =>
  CUISINE_EMOJIS[cuisine] || CUISINE_EMOJIS['default'];

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  useEffect(() => {
    api.get('/api/v1/restaurants')
      .then(res => {
        setRestaurants(res.data);
        setFiltered(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let results = restaurants;
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.cuisineType.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
      );
    }
    if (selectedCuisine !== 'All') {
      results = results.filter(r => r.cuisineType === selectedCuisine);
    }
    setFiltered(results);
  }, [search, restaurants, selectedCuisine]);

  const cuisines = ['All', ...new Set(restaurants.map(r => r.cuisineType))];

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a1a 50%, #1a1a1a 100%)',
        py: { xs: 6, md: 10 },
        px: 2,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(circle, #E53935 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            component="img"
            src={logo}
            alt="MashiaMesh"
            sx={{ height: { xs: 80, md: 120 }, mb: 3 }}
          />
          <Typography variant="h3" fontWeight="bold" color="white"
            sx={{ mb: 1, fontSize: { xs: '1.8rem', md: '3rem' } }}>
            Craving something delicious?
          </Typography>
          <Typography variant="h6" color="grey.400" sx={{ mb: 4 }}>
            Order food from the best restaurants in your city
          </Typography>

          {/* Search Bar */}
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search restaurants, cuisines or cities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#E53935' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: 'white',
                borderRadius: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  '& fieldset': { border: 'none' },
                },
              }}
            />
          </Box>

          {/* Stats */}
          <Box sx={{
            display: 'flex', justifyContent: 'center',
            gap: { xs: 3, md: 6 }, mt: 4
          }}>
            {[
              { value: `${restaurants.length}+`, label: 'Restaurants' },
              { value: '30min', label: 'Avg Delivery' },
              { value: 'R25', label: 'Delivery Fee' },
            ].map(stat => (
              <Box key={stat.label} textAlign="center">
                <Typography variant="h5" fontWeight="bold" color="white">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="grey.400">
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Cuisine Filter Pills */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {cuisines.map(cuisine => (
            <Chip
              key={cuisine}
              label={cuisine === 'All' ? '🍽️ All' : `${getCuisineEmoji(cuisine)} ${cuisine}`}
              onClick={() => setSelectedCuisine(cuisine)}
              sx={{
                cursor: 'pointer',
                fontWeight: selectedCuisine === cuisine ? 'bold' : 'normal',
                backgroundColor: selectedCuisine === cuisine ? '#E53935' : 'white',
                color: selectedCuisine === cuisine ? 'white' : 'text.primary',
                border: '1px solid',
                borderColor: selectedCuisine === cuisine ? '#E53935' : 'divider',
                '&:hover': {
                  backgroundColor: selectedCuisine === cuisine ? '#C62828' : '#f5f5f5',
                },
                px: 1,
                py: 2.5,
                fontSize: '0.9rem',
              }}
            />
          ))}
        </Box>

        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          {selectedCuisine === 'All' ? 'All Restaurants' : `${selectedCuisine} Restaurants`}
          <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 'normal', fontSize: '1rem' }}>
            ({filtered.length} found)
          </Typography>
        </Typography>

        {/* Restaurant Cards */}
        <Grid container spacing={3}>
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={180} />
                  <CardContent>
                    <Skeleton variant="text" width="70%" height={30} />
                    <Skeleton variant="text" width="50%" />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : filtered.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box textAlign="center" py={8}>
                <Typography fontSize="4rem">🔍</Typography>
                <Typography variant="h6" color="text.secondary">
                  No restaurants found for "{search}"
                </Typography>
                <Button onClick={() => { setSearch(''); setSelectedCuisine('All'); }}
                  sx={{ mt: 2, color: '#E53935' }}>
                  Clear filters
                </Button>
              </Box>
            </Grid>
          ) : (
            filtered.map(r => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
                <Card elevation={0} sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    borderColor: '#E53935',
                  },
                }}
                  onClick={() => navigate(`/restaurants/${r.id}`)}
                >
                  {/* Card Image Area */}
                  <Box sx={{
                    height: 180,
                    background: 'linear-gradient(135deg, #1a1a1a, #2d1a1a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    fontSize: '5rem',
                  }}>
                    {getCuisineEmoji(r.cuisineType)}

                    {/* Cuisine badge */}
                    <Chip
                      label={r.cuisineType}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        backdropFilter: 'blur(4px)',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                      }}
                    />

                    {/* Rating badge */}
                    <Box sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      borderRadius: 2,
                      px: 1,
                      py: 0.3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}>
                      <StarIcon sx={{ fontSize: '0.9rem', color: '#FFC107' }} />
                      <Typography variant="body2" fontWeight="bold">
                        {r.rating || 'New'}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {r.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary"
                      sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.description}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: '0.9rem', color: '#E53935' }} />
                      <Typography variant="body2" color="text.secondary">
                        {r.city}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AccessTimeIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        25–35 min • R25 delivery
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        backgroundColor: '#E53935',
                        borderRadius: 2,
                        fontWeight: 'bold',
                        py: 1,
                        '&:hover': { backgroundColor: '#C62828' },
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        if (!isAuthenticated) { navigate('/login'); return; }
                        navigate(`/restaurants/${r.id}`);
                      }}
                    >
                      View Menu
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}