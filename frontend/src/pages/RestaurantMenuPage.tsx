import { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, CardActions,
  Typography, Button, Box, Chip, CircularProgress,
  Snackbar, Alert
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import type { MenuItem, Restaurant } from '../types';
import { addItem } from '../store/slices/cartSlice';
import type { RootState } from '../store/store';

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/api/v1/restaurants/${id}`),
      api.get(`/api/v1/restaurants/${id}/menu`)
    ]).then(([rRes, mRes]) => {
      setRestaurant(rRes.data);
      setMenu(mRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = (item: MenuItem) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    dispatch(addItem({
      item: {
        menuItemId: item.id,
        itemName: item.name,
        unitPrice: item.price,
        quantity: 1,
      },
      restaurantId: restaurant!.id,
      restaurantName: restaurant!.name,
    }));
    setSnackbar(true);
  };

  const categories = [...new Set(menu.map(i => i.category).filter(Boolean))];

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress sx={{ color: '#E53935' }} />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
        Back to Restaurants
      </Button>

      {restaurant && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">{restaurant.name}</Typography>
          <Typography color="text.secondary">{restaurant.description}</Typography>
          <Typography color="text.secondary">{restaurant.address}, {restaurant.city}</Typography>
          <Chip label={restaurant.cuisineType} color="error" size="small" sx={{ mt: 1 }} />
        </Box>
      )}

      {categories.length > 0 ? categories.map(cat => (
        <Box key={cat} sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, borderBottom: '2px solid #E53935', pb: 1 }}>
            {cat}
          </Typography>
          <Grid container spacing={2}>
            {menu.filter(i => i.category === cat && i.available).map(item => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.description}
                    </Typography>
                    <Typography variant="h6" color="error" fontWeight="bold">
                      R{item.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth variant="contained"
                      startIcon={<AddShoppingCartIcon />}
                      sx={{ backgroundColor: '#E53935' }}
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )) : (
        <Grid container spacing={3}> 
          {menu.filter(i => i.available).map(item => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography variant="h6" color="error" fontWeight="bold">
                    R{item.price.toFixed(2)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth variant="contained"
                    startIcon={<AddShoppingCartIcon />}
                    sx={{ backgroundColor: '#E53935' }}
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={snackbar} autoHideDuration={2000} onClose={() => setSnackbar(false)}>
        <Alert severity="success">Added to cart!</Alert>
      </Snackbar>
    </Container>
  );
}