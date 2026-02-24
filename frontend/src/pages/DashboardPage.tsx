import { useState } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  Button, TextField, Divider, IconButton, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import { removeItem, clearCart } from '../store/slices/cartSlice';
import api from '../api/axios';

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);
  const { items, restaurantId, restaurantName } = useSelector((s: RootState) => s.cart);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address) { setError('Please enter a delivery address'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/v1/orders', {
        customerId: user?.userId,
        restaurantId,
        restaurantName,
        deliveryAddress: address,
        items,
      });

      // Process payment automatically
      await api.post('/api/v1/payments', {
        orderId: res.data.id,
        customerId: user?.userId,
        amount: total,
        paymentMethod: 'CREDIT_CARD',
      });

      dispatch(clearCart());
      navigate('/orders');
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
      <Button variant="contained" sx={{ backgroundColor: '#E53935' }}
        onClick={() => navigate('/')}>
        Browse Restaurants
      </Button>
    </Container>
  );

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Checkout</Typography>

      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {restaurantName}
          </Typography>
          {items.map(item => (
            <Box key={item.menuItemId} display="flex"
              justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
              <Typography>{item.itemName} x{item.quantity}</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>R{(item.unitPrice * item.quantity).toFixed(2)}</Typography>
                <IconButton size="small" onClick={() => dispatch(removeItem(item.menuItemId))}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography color="text.secondary">Delivery fee</Typography>
            <Typography>R{deliveryFee.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontWeight="bold">Total</Typography>
            <Typography fontWeight="bold" color="error">R{total.toFixed(2)}</Typography>
          </Box>
        </CardContent>
      </Card>

      <TextField
        fullWidth label="Delivery Address" multiline rows={2}
        value={address} onChange={e => setAddress(e.target.value)}
        sx={{ mb: 2 }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Button
        fullWidth variant="contained" size="large"
        sx={{ backgroundColor: '#E53935' }}
        onClick={handlePlaceOrder} disabled={loading}
      >
        {loading ? 'Placing Order...' : `Place Order — R${total.toFixed(2)}`}
      </Button>
    </Container>
  );
}