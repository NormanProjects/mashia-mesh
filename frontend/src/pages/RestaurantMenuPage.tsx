import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Button, Chip,
  CircularProgress, Snackbar, Alert, Divider,
  Badge, Drawer, IconButton, Card
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import type { MenuItem, Restaurant } from '../types';
import { addItem, removeItem, clearCart } from '../store/slices/cartSlice';
import type { RootState } from '../store/store';

const CUISINE_EMOJIS: Record<string, string> = {
  'South African': '🍖', 'Italian': '🍕', 'Chinese': '🥡',
  'Indian': '🍛', 'American': '🍔', 'Mexican': '🌮',
  'Japanese': '🍱', 'Thai': '🍜', 'default': '🍽️',
};

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { items, restaurantId } = useSelector((s: RootState) => s.cart);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const categories = [...new Set(menu.map(i => i.category).filter(Boolean))];

  useEffect(() => {
    Promise.all([
      api.get(`/api/v1/restaurants/${id}`),
      api.get(`/api/v1/restaurants/${id}/menu`)
    ]).then(([rRes, mRes]) => {
      setRestaurant(rRes.data);
      setMenu(mRes.data);
      if (mRes.data.length > 0) {
        setActiveCategory(mRes.data[0].category || '');
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = (item: MenuItem) => {
    if (!isAuthenticated) { navigate('/login'); return; }

    // Warn if switching restaurants
    if (restaurantId && restaurantId !== restaurant?.id) {
      dispatch(clearCart());
    }

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
    setSnackbar(`${item.name} added to cart!`);
  };

  const getItemQuantity = (itemId: number) => {
    const found = items.find(i => i.menuItemId === itemId);
    return found?.quantity || 0;
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center"
      sx={{ height: '80vh' }}>
      <CircularProgress sx={{ color: '#E53935' }} size={50} />
    </Box>
  );

  return (
    <Box>
      {/* Restaurant Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a1a1a, #2d1a1a)',
        py: 5, px: 2,
      }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ color: 'grey.400', mb: 2, '&:hover': { color: 'white' } }}
          >
            Back
          </Button>

          <Box display="flex" alignItems="center" gap={3}>
            <Box sx={{
              width: 80, height: 80, borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '2.5rem',
              flexShrink: 0,
            }}>
              {CUISINE_EMOJIS[restaurant?.cuisineType || ''] || '🍽️'}
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" fontWeight="bold" color="white">
                {restaurant?.name}
              </Typography>
              <Typography color="grey.400" sx={{ mb: 1 }}>
                {restaurant?.description}
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocationOnIcon sx={{ fontSize: '0.9rem', color: '#E53935' }} />
                  <Typography variant="body2" color="grey.400">
                    {restaurant?.city}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <StarIcon sx={{ fontSize: '0.9rem', color: '#FFC107' }} />
                  <Typography variant="body2" color="grey.400">
                    {restaurant?.rating || 'New'}
                  </Typography>
                </Box>
                <Chip
                  label={restaurant?.cuisineType}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(229,57,53,0.2)',
                    color: '#E53935',
                    border: '1px solid rgba(229,57,53,0.3)',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
            </Box>

            {/* Cart Button */}
            {cartCount > 0 && (
              <Button
                variant="contained"
                startIcon={
                  <Badge badgeContent={cartCount} color="warning">
                    <ShoppingCartIcon />
                  </Badge>
                }
                onClick={() => setCartOpen(true)}
                sx={{
                  backgroundColor: '#E53935',
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                  flexShrink: 0,
                  '&:hover': { backgroundColor: '#C62828' },
                }}
              >
                R{cartTotal.toFixed(2)}
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>

          {/* Category Sidebar */}
          {categories.length > 0 && (
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{
                position: 'sticky', top: 20,
                backgroundColor: 'white',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography fontWeight="bold" color="text.secondary" fontSize="0.8rem"
                    letterSpacing={1} textTransform="uppercase">
                    Menu
                  </Typography>
                </Box>
                {categories.map(cat => (
                  <Box
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      document.getElementById(`cat-${cat}`)?.scrollIntoView(
                        { behavior: 'smooth', block: 'start' }
                      );
                    }}
                    sx={{
                      px: 2, py: 1.5,
                      cursor: 'pointer',
                      borderLeft: '3px solid',
                      borderColor: activeCategory === cat ? '#E53935' : 'transparent',
                      backgroundColor: activeCategory === cat ? '#fff5f5' : 'transparent',
                      color: activeCategory === cat ? '#E53935' : 'text.primary',
                      fontWeight: activeCategory === cat ? 'bold' : 'normal',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#fff5f5',
                        color: '#E53935',
                      },
                    }}
                  >
                    <Typography fontSize="0.95rem" fontWeight="inherit" color="inherit">
                      {cat}
                    </Typography>
                    <Typography fontSize="0.75rem" color="text.secondary">
                      {menu.filter(m => m.category === cat && m.available).length} items
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          )}

          {/* Menu Items */}
          <Grid size={{ xs: 12, md: categories.length > 0 ? 9 : 12 }}>
            {categories.length > 0 ? (
              categories.map(cat => (
                <Box key={cat} id={`cat-${cat}`} sx={{ mb: 4 }}>
                  <Typography variant="h5" fontWeight="bold"
                    sx={{ mb: 2, pb: 1, borderBottom: '2px solid #E53935', display: 'inline-block' }}>
                    {cat}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {menu.filter(i => i.category === cat && i.available).map(item => (
                      <Card key={item.id} elevation={0} sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#E53935',
                          boxShadow: '0 4px 20px rgba(229,57,53,0.1)',
                        },
                      }}>
                        {/* Item emoji */}
                        <Box sx={{
                          width: 70, height: 70, flexShrink: 0,
                          borderRadius: 2,
                          backgroundColor: '#fff5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                        }}>
                          🍽️
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography fontWeight="bold" fontSize="1rem">
                            {item.name}
                          </Typography>
                          {item.description && (
                            <Typography variant="body2" color="text.secondary"
                              sx={{ mt: 0.3, mb: 0.5 }}>
                              {item.description}
                            </Typography>
                          )}
                          <Typography fontWeight="bold" color="#E53935" fontSize="1.1rem">
                            R{item.price.toFixed(2)}
                          </Typography>
                        </Box>

                        {/* Add to cart controls */}
                        {getItemQuantity(item.id) > 0 ? (
                          <Box display="flex" alignItems="center" gap={1}
                            sx={{
                              border: '1px solid #E53935',
                              borderRadius: 2,
                              px: 0.5,
                            }}>
                            <IconButton size="small" sx={{ color: '#E53935' }}
                              onClick={() => dispatch(removeItem(item.id))}>
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography fontWeight="bold" sx={{ minWidth: 20, textAlign: 'center' }}>
                              {getItemQuantity(item.id)}
                            </Typography>
                            <IconButton size="small" sx={{ color: '#E53935' }}
                              onClick={() => handleAddToCart(item)}>
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Button
                            variant="outlined"
                            startIcon={<AddShoppingCartIcon />}
                            onClick={() => handleAddToCart(item)}
                            sx={{
                              borderColor: '#E53935',
                              color: '#E53935',
                              borderRadius: 2,
                              flexShrink: 0,
                              '&:hover': {
                                backgroundColor: '#E53935',
                                color: 'white',
                              },
                            }}
                          >
                            Add
                          </Button>
                        )}
                      </Card>
                    ))}
                  </Box>
                </Box>
              ))
            ) : (
              // No categories — flat list
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {menu.filter(i => i.available).map(item => (
                  <Card key={item.id} elevation={0} sx={{
                    border: '1px solid', borderColor: 'divider',
                    borderRadius: 3, p: 2,
                    display: 'flex', alignItems: 'center', gap: 2,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#E53935' },
                  }}>
                    <Box sx={{
                      width: 70, height: 70, flexShrink: 0,
                      borderRadius: 2, backgroundColor: '#fff5f5',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '2rem',
                    }}>
                      🍽️
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight="bold">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                      <Typography fontWeight="bold" color="#E53935">
                        R{item.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => handleAddToCart(item)}
                      sx={{
                        borderColor: '#E53935', color: '#E53935',
                        borderRadius: 2, flexShrink: 0,
                        '&:hover': { backgroundColor: '#E53935', color: 'white' },
                      }}
                    >
                      Add
                    </Button>
                  </Card>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Cart Drawer */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 380, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🛒 Your Cart
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {items.map(item => (
              <Box key={item.menuItemId} sx={{
                display: 'flex', alignItems: 'center',
                gap: 2, mb: 2, pb: 2,
                borderBottom: '1px solid', borderColor: 'divider',
              }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight="bold">{item.itemName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    R{item.unitPrice.toFixed(2)} x {item.quantity}
                  </Typography>
                </Box>
                <Typography fontWeight="bold" color="#E53935">
                  R{(item.unitPrice * item.quantity).toFixed(2)}
                </Typography>
                <IconButton size="small" color="error"
                  onClick={() => dispatch(removeItem(item.menuItemId))}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>R{cartTotal.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography color="text.secondary">Delivery fee</Typography>
              <Typography>R25.00</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography fontWeight="bold" fontSize="1.1rem">Total</Typography>
              <Typography fontWeight="bold" fontSize="1.1rem" color="#E53935">
                R{(cartTotal + 25).toFixed(2)}
              </Typography>
            </Box>
            <Button
              fullWidth variant="contained" size="large"
              sx={{
                backgroundColor: '#E53935', borderRadius: 3,
                py: 1.5, fontWeight: 'bold',
                '&:hover': { backgroundColor: '#C62828' },
              }}
              onClick={() => { setCartOpen(false); navigate('/checkout'); }}
            >
              Checkout — R{(cartTotal + 25).toFixed(2)}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2000}
        onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: 3 }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}