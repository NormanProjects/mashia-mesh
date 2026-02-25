import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Chip,
  Select, MenuItem, FormControl, CircularProgress,
  Divider, Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import type { RootState } from '../../store/store';
import type { Order, Restaurant } from '../../types';

const STATUS_FLOW: Record<string, string> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PREPARING: 'info',
  READY: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export default function OwnerOrders() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    // First get owner's restaurant
    api.get('/api/v1/restaurants')
      .then(res => {
        const owned = res.data.find((r: Restaurant) => r.ownerId === user?.userId);
        if (owned) {
          setRestaurant(owned);
          return api.get(`/api/v1/orders/restaurant/${owned.id}`);
        }
      })
      .then(res => { if (res) setOrders(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    await api.patch(`/api/v1/orders/${orderId}/status?status=${newStatus}`);
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
  };

  const filtered = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status === filter);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress sx={{ color: '#E53935' }} />
    </Box>
  );

  if (!restaurant) return (
    <Alert severity="info">
      You don't have a restaurant yet. Go to "My Restaurant" tab to create one.
    </Alert>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Orders for {restaurant.name}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select value={filter} onChange={e => setFilter(e.target.value)}>
            <MenuItem value="ALL">All Orders</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="PREPARING">Preparing</MenuItem>
            <MenuItem value="READY">Ready</MenuItem>
            <MenuItem value="OUT_FOR_DELIVERY">Out for Delivery</MenuItem>
            <MenuItem value="DELIVERED">Delivered</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filtered.length === 0 ? (
        <Typography color="text.secondary">No orders found.</Typography>
      ) : (
        filtered.map(order => (
          <Card key={order.id} elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight="bold">Order #{order.id}</Typography>
                <Chip
                  label={order.status}
                  color={STATUS_COLORS[order.status] || 'default'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                📍 {order.deliveryAddress}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                🕐 {new Date(order.createdAt).toLocaleString()}
              </Typography>

              <Divider sx={{ my: 1 }} />

              {order.items.map(item => (
                <Box key={item.id} display="flex" justifyContent="space-between" sx={{ py: 0.3 }}>
                  <Typography variant="body2">{item.itemName} x{item.quantity}</Typography>
                  <Typography variant="body2">R{item.subtotal.toFixed(2)}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight="bold" color="error">
                  Total: R{order.totalAmount.toFixed(2)}
                </Typography>

                {STATUS_FLOW[order.status] && (
                  <FormControl size="small">
                    <Select
                      value={order.status}
                      onChange={e => handleStatusUpdate(order.id, e.target.value)}
                      sx={{ minWidth: 180 }}
                    >
                      <MenuItem value={order.status} disabled>{order.status}</MenuItem>
                      <MenuItem value={STATUS_FLOW[order.status]}>
                        ✅ Mark as {STATUS_FLOW[order.status]}
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>

              {order.specialInstructions && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  📝 {order.specialInstructions}
                </Alert>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}