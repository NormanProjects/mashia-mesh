import { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Tab, Tabs, Paper
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';
import OwnerOrders from './OwnerOrders';
import OwnerRestaurant from './OwnerRestaurant';
import OwnerMenu from './OwnerMenu';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'RESTAURANT_OWNER') {
      navigate('/login');
    }
  }, [isAuthenticated]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Owner Dashboard
        </Typography>
        <Typography color="text.secondary">
          Welcome back, {user?.firstName}!
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: '#E53935' } }}
        >
          <Tab label="📦 Incoming Orders" />
          <Tab label="🍽️ My Restaurant" />
          <Tab label="📋 Menu Management" />
        </Tabs>
      </Paper>

      {tab === 0 && <OwnerOrders />}
      {tab === 1 && <OwnerRestaurant />}
      {tab === 2 && <OwnerMenu />}
    </Container>
  );
}