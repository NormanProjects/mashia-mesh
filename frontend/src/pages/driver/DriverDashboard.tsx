import { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Tab, Tabs, Paper
} from '@mui/material';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';
import DriverDeliveries from './DriverDeliveries.tsx';
import DriverStats from './DriverStats.tsx';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'DELIVERY_DRIVER') {
      navigate('/login');
    }
  }, [isAuthenticated]);

  return (
    <Box sx={{ backgroundColor: '#f8f8f8', minHeight: '100vh' }}>

      {/* Driver Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a1a1a, #0d2137)',
        py: 4, px: 2,
      }}>
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{
              width: 60, height: 60, borderRadius: '50%',
              backgroundColor: 'rgba(79,195,247,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TwoWheelerIcon sx={{ color: '#4FC3F7', fontSize: '2rem' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="white">
                Driver Dashboard
              </Typography>
              <Typography color="grey.400">
                Welcome, {user?.firstName}! Ready to deliver? 🛵
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper elevation={0} sx={{
          mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3
        }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            TabIndicatorProps={{ style: { backgroundColor: '#4FC3F7' } }}
          >
            <Tab label="🛵 My Deliveries" />
            <Tab label="📊 Stats" />
          </Tabs>
        </Paper>

        {tab === 0 && <DriverDeliveries />}
        {tab === 1 && <DriverStats />}
      </Container>
    </Box>
  );
}