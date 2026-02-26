import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import type { RootState } from '../../store/store';
import type { Delivery } from '../../types';

export default function DriverStats() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      api.get(`/api/v1/deliveries/driver/${user.userId}`)
        .then(res => setDeliveries(res.data))
        .finally(() => setLoading(false));
    }
  }, []);

  const total = deliveries.length;
  const completed = deliveries.filter(d => d.status === 'DELIVERED').length;
  const active = deliveries.filter(
    d => d.status !== 'DELIVERED' && d.status !== 'FAILED'
  ).length;
  const failed = deliveries.filter(d => d.status === 'FAILED').length;
  const successRate = total > 0
    ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Total Deliveries', value: total, emoji: '📦', color: '#1a1a1a' },
    { label: 'Completed', value: completed, emoji: '✅', color: '#4CAF50' },
    { label: 'Active', value: active, emoji: '🛵', color: '#4FC3F7' },
    { label: 'Failed', value: failed, emoji: '❌', color: '#E53935' },
  ];

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress sx={{ color: '#4FC3F7' }} />
    </Box>
  );

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(stat => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Card elevation={0} sx={{
              border: '1px solid', borderColor: 'divider',
              borderRadius: 3, textAlign: 'center', p: 1,
            }}>
              <CardContent>
                <Typography fontSize="2.5rem">{stat.emoji}</Typography>
                <Typography variant="h4" fontWeight="bold"
                  sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Success Rate */}
      <Card elevation={0} sx={{
        border: '1px solid', borderColor: 'divider',
        borderRadius: 3, p: 2, textAlign: 'center'
      }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Success Rate
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={successRate}
              size={120}
              thickness={6}
              sx={{ color: successRate > 80 ? '#4CAF50' : '#FFC107' }}
            />
            <Box sx={{
              top: 0, left: 0, bottom: 0, right: 0,
              position: 'absolute',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography variant="h5" fontWeight="bold">
                {successRate}%
              </Typography>
            </Box>
          </Box>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {completed} of {total} deliveries completed
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}