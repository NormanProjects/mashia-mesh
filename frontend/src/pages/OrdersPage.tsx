import { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  Chip, CircularProgress, Divider
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Order } from '../types';
import type { RootState } from '../store/store';

const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PREPARING: 'info',
  READY: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    api.get(`/api/v1/orders/customer/${user?.userId}`)
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress sx={{ color: '#E53935' }} />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>My Orders</Typography>

      {orders.length === 0 ? (
        <Typography color="text.secondary">You have no orders yet.</Typography>
      ) : (
        orders.map(order => (
          <Card key={order.id} elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  {order.restaurantName}
                </Typography>
                <Chip
                  label={order.status}
                  color={statusColors[order.status] || 'default'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {new Date(order.createdAt).toLocaleString()}
              </Typography>
              <Divider sx={{ my: 1 }} />
              {order.items.map(item => (
                <Box key={item.id} display="flex" justifyContent="space-between" sx={{ py: 0.5 }}>
                  <Typography variant="body2">{item.itemName} x{item.quantity}</Typography>
                  <Typography variant="body2">R{item.subtotal.toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Delivery fee</Typography>
                <Typography variant="body2">R{order.deliveryFee.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight="bold">Total</Typography>
                <Typography fontWeight="bold" color="error">
                  R{order.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}