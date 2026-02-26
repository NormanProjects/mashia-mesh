import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Chip,
  Button, CircularProgress, Alert, Divider,
  Select, MenuItem, FormControl
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import NavigationIcon from '@mui/icons-material/Navigation';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import type { RootState } from '../../store/store';
import type { Delivery } from '../../types';

const STATUS_FLOW: Record<string, string> = {
  ASSIGNED: 'HEADING_TO_RESTAURANT',
  HEADING_TO_RESTAURANT: 'PICKED_UP',
  PICKED_UP: 'HEADING_TO_CUSTOMER',
  HEADING_TO_CUSTOMER: 'DELIVERED',
};

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
  ASSIGNED: 'warning',
  HEADING_TO_RESTAURANT: 'info',
  PICKED_UP: 'info',
  HEADING_TO_CUSTOMER: 'info',
  DELIVERED: 'success',
  FAILED: 'error',
};

const STATUS_EMOJI: Record<string, string> = {
  ASSIGNED: '📋',
  HEADING_TO_RESTAURANT: '🏃',
  PICKED_UP: '📦',
  HEADING_TO_CUSTOMER: '🛵',
  DELIVERED: '✅',
  FAILED: '❌',
};

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: 'Assigned',
  HEADING_TO_RESTAURANT: 'Heading to Restaurant',
  PICKED_UP: 'Picked Up',
  HEADING_TO_CUSTOMER: 'On the Way',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
};

const NEXT_ACTION: Record<string, string> = {
  ASSIGNED: '▶️ Head to Restaurant',
  HEADING_TO_RESTAURANT: '📦 Mark as Picked Up',
  PICKED_UP: '🛵 Heading to Customer',
  HEADING_TO_CUSTOMER: '✅ Mark as Delivered',
};

export default function DriverDeliveries() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (user?.userId) {
      api.get(`/api/v1/deliveries/driver/${user.userId}`)
        .then(res => setDeliveries(res.data))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleUpdateStatus = async (delivery: Delivery) => {
    const nextStatus = STATUS_FLOW[delivery.status];
    if (!nextStatus) return;

    setUpdating(delivery.id);
    try {
      const res = await api.patch(
        `/api/v1/deliveries/${delivery.id}/status?status=${nextStatus}`
      );
      setDeliveries(prev =>
        prev.map(d => d.id === delivery.id ? res.data : d)
      );
    } finally {
      setUpdating(null);
    }
  };

  const filtered = deliveries.filter(d => {
    if (filter === 'ACTIVE') return d.status !== 'DELIVERED' && d.status !== 'FAILED';
    if (filter === 'COMPLETED') return d.status === 'DELIVERED';
    return true;
  });

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress sx={{ color: '#4FC3F7' }} />
    </Box>
  );

  return (
    <Box>
      {/* Filter */}
      <Box display="flex" justifyContent="space-between"
        alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          {filtered.length} Deliveries
        </Typography>
        <FormControl size="small">
          <Select value={filter} onChange={e => setFilter(e.target.value)}
            sx={{ minWidth: 150 }}>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="ALL">All</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filtered.length === 0 ? (
        <Card elevation={0} sx={{
          border: '1px solid', borderColor: 'divider',
          borderRadius: 3, p: 6, textAlign: 'center'
        }}>
          <Typography fontSize="3rem">🛵</Typography>
          <Typography variant="h6" gutterBottom>No deliveries yet</Typography>
          <Typography color="text.secondary">
            Deliveries assigned to you will appear here
          </Typography>
        </Card>
      ) : (
        filtered.map(delivery => (
          <Card key={delivery.id} elevation={0} sx={{
            border: '1px solid',
            borderColor: delivery.status === 'DELIVERED'
              ? '#c6f6d5' : 'divider',
            borderRadius: 3,
            mb: 2,
            overflow: 'hidden',
            transition: 'all 0.2s',
            '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
          }}>
            <CardContent>

              {/* Header */}
              <Box display="flex" justifyContent="space-between"
                alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography fontWeight="bold" fontSize="1rem">
                    Delivery #{delivery.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Order #{delivery.orderId}
                  </Typography>
                </Box>
                <Chip
                  label={`${STATUS_EMOJI[delivery.status]} ${STATUS_LABELS[delivery.status]}`}
                  color={STATUS_COLORS[delivery.status] || 'default'}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Delivery Address */}
              <Box display="flex" gap={1} sx={{ mb: 1.5 }}>
                <LocationOnIcon sx={{ color: '#E53935', flexShrink: 0, mt: 0.2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary"
                    fontWeight="bold">
                    DELIVER TO
                  </Typography>
                  <Typography variant="body2">{delivery.deliveryAddress}</Typography>
                </Box>
              </Box>

              {delivery.notes && (
                <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
                  📝 {delivery.notes}
                </Alert>
              )}

              {/* Timestamps */}
              {delivery.pickedUpAt && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  📦 Picked up: {new Date(delivery.pickedUpAt).toLocaleTimeString()}
                </Typography>
              )}
              {delivery.deliveredAt && (
                <Typography variant="body2" color="success.main" sx={{ mb: 0.5 }}>
                  ✅ Delivered: {new Date(delivery.deliveredAt).toLocaleTimeString()}
                </Typography>
              )}

              {/* Action Button */}
              {STATUS_FLOW[delivery.status] && (
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 2,
                    backgroundColor: '#4FC3F7',
                    color: '#1a1a1a',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: '#0288D1', color: 'white' },
                  }}
                  startIcon={<NavigationIcon />}
                  onClick={() => handleUpdateStatus(delivery)}
                  disabled={updating === delivery.id}
                >
                  {updating === delivery.id
                    ? 'Updating...'
                    : NEXT_ACTION[delivery.status]}
                </Button>
              )}

            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}