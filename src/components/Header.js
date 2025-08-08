import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Button,
} from '@mui/material';
import {
  ShoppingCart,
  SmartToy,
  Store,
} from '@mui/icons-material';

const Header = ({ cartItems, onChatOpen }) => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Store sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          AI Shopping Assistant
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<SmartToy />}
            onClick={onChatOpen}
            sx={{
              textTransform: 'none',
              borderRadius: '20px',
              px: 2,
            }}
          >
            Chat with AI
          </Button>
          
          <IconButton
            color="inherit"
            onClick={() => navigate('/cart')}
            sx={{
              borderRadius: '50%',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Badge badgeContent={cartItems} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;