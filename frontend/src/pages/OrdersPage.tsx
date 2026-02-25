import { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Card, CardContent,
  Chip, CircularProgress, Divider, Stepper,
  Step, StepLabel, Collapse, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Order } from '../types';
import type { RootState } from '../store/store';

const ORDER_STEPS = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
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

const STATUS_EMOJI: Record<string, string> = {
  PENDING: '⏳',
  CONFIRMED: '✅',
  PREPARING: '👨‍🍳',
  READY: '📦',
  OUT_FOR_DELIVERY: '🛵',
  DELIVERED: '🎉',
  CANCELLED: '❌',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    api.get(`/api/v1/orders/customer/${user?.userId}`)
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  const getActiveStep = (status: string) => {
    const idx = ORDER_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center"
      sx={{ height: '80vh' }}>
      <CircularProgress sx={{ color: '#E53935' }} size={50} />
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: '#f8f8f8', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">My Orders</Typography>
          <Typography color="text.secondary">
            {orders.length} order{orders.length !== 1 ? 's' : ''} placed
          </Typography>
        </Box>

        {orders.length === 0 ? (
          <Card elevation={0} sx={{
            border: '1px solid', borderColor: 'divider',
            borderRadius: 3, p: 6, textAlign: 'center'
          }}>
            <Typography fontSize="4rem">🍽️</Typography>
            <Typography variant="h6" gutterBottom>No orders yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Browse restaurants and place your first order!
            </Typography>
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.id} elevation={0} sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              mb: 2,
              overflow: 'hidden',
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
            }}>
              {/* Order Header */}
              <CardContent sx={{ pb: 0 }}>
                <Box display="flex" justifyContent="space-between"
                  alignItems="flex-start" sx={{ mb: 1 }}>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <RestaurantIcon sx={{ color: '#E53935', fontSize: '1.2rem' }} />
                      <Typography variant="h6" fontWeight="bold">
                        {order.restaurantName}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Order #{order.id} •{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={`${STATUS_EMOJI[order.status]} ${STATUS_LABELS[order.status]}`}
                      color={STATUS_COLORS[order.status] || 'default'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    >
                      {expanded === order.id
                        ? <ExpandLessIcon />
                        : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>

                {/* Order Progress — only for non-cancelled */}
                {order.status !== 'CANCELLED' && (
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Stepper
                      activeStep={getActiveStep(order.status)}
                      alternativeLabel
                      sx={{
                        '& .MuiStepLabel-label': { fontSize: '0.65rem' },
                        '& .MuiStepIcon-root.Mui-active': { color: '#E53935' },
                        '& .MuiStepIcon-root.Mui-completed': { color: '#4CAF50' },
                      }}
                    >
                      {ORDER_STEPS.map(step => (
                        <Step key={step}>
                          <StepLabel>{STATUS_LABELS[step]}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>
                )}

                {order.status === 'DELIVERED' && (
                  <Box display="flex" alignItems="center" gap={1}
                    sx={{
                      mt: 1, p: 1.5, borderRadius: 2,
                      backgroundColor: '#f0fff4',
                      border: '1px solid #c6f6d5'
                    }}>
                    <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: '1.1rem' }} />
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      Order delivered successfully!
                    </Typography>
                  </Box>
                )}
              </CardContent>

              {/* Expandable Order Details */}
              <Collapse in={expanded === order.id}>
                <CardContent sx={{ pt: 1 }}>
                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="body2" fontWeight="bold"
                    color="text.secondary" sx={{ mb: 1 }}>
                    ORDER ITEMS
                  </Typography>

                  {order.items.map(item => (
                    <Box key={item.id} display="flex"
                      justifyContent="space-between" sx={{ py: 0.5 }}>
                      <Box display="flex" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                          {item.quantity}x
                        </Typography>
                        <Typography variant="body2">{item.itemName}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        R{item.subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 1.5 }} />

                  <Box display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2">R{order.subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Delivery fee</Typography>
                    <Typography variant="body2">R{order.deliveryFee.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight="bold">Total</Typography>
                    <Typography fontWeight="bold" color="#E53935" fontSize="1.1rem">
                      R{order.totalAmount.toFixed(2)}
                    </Typography>
                  </Box>

                  {order.deliveryAddress && (
                    <Box sx={{
                      mt: 2, p: 1.5, borderRadius: 2,
                      backgroundColor: '#f5f5f5'
                    }}>
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">
                        📍 DELIVERY ADDRESS
                      </Typography>
                      <Typography variant="body2">{order.deliveryAddress}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Collapse>
            </Card>
          ))
        )}
      </Container>
    </Box>
  );
}