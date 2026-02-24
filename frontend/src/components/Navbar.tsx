import { AppBar, Toolbar, Button, Badge, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import logo from '../assets/MashiaMeshLogo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const cartCount = useSelector((s: RootState) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a1a', px: 2 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>

        {/* Logo */}
        <Box
          component="img"
          src={logo}
          alt="MashiaMesh"
          sx={{ height: 60, cursor: 'pointer', py: 0.5 }}
          onClick={() => navigate('/')}
        />

        {/* Nav Actions */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="inherit" onClick={() => navigate('/orders')}
              sx={{ color: 'white' }}>
              My Orders
            </Button>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon
                sx={{ cursor: 'pointer', color: 'white' }}
                onClick={() => navigate('/checkout')}
              />
            </Badge>
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/login')}
              sx={{ color: 'white' }}>
              Login
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}