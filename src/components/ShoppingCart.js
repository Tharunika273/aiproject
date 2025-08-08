import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Divider,
  Avatar,
  Paper,
} from '@mui/material';
import { Remove, Add, Delete, ShoppingBag } from '@mui/icons-material';
import { motion } from 'framer-motion';

const CartItem = ({ item, onRemove, onQuantityChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Avatar
                src={item.product.image_url}
                alt={item.product.name}
                variant="rounded"
                sx={{ width: 80, height: 80 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" gutterBottom>
                {item.product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.product.description}
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                ${item.product.price}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={() => onQuantityChange(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  size="small"
                >
                  <Remove />
                </IconButton>
                
                <Typography variant="h6" sx={{ minWidth: '40px', textAlign: 'center' }}>
                  {item.quantity}
                </Typography>
                
                <IconButton 
                  onClick={() => onQuantityChange(item.product.id, item.quantity + 1)}
                  size="small"
                >
                  <Add />
                </IconButton>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Subtotal: ${item.subtotal.toFixed(2)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <IconButton 
                onClick={() => onRemove(item.product.id)}
                color="error"
                sx={{ '&:hover': { bgcolor: 'error.light', color: 'white' } }}
              >
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ShoppingCart = ({ cart, onRemoveFromCart, onRefreshCart }) => {
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveFromCart(productId);
      return;
    }
    
    // For simplicity, we'll remove and re-add with new quantity
    // In a real app, you'd have an update quantity endpoint
    await onRemoveFromCart(productId);
    
    try {
      const response = await fetch('http://localhost:8000/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: newQuantity,
        }),
      });
      
      if (response.ok) {
        onRefreshCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleCheckout = () => {
    // In a real app, this would integrate with a payment processor
    alert('Checkout functionality would be implemented here with payment processing!');
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <ShoppingBag sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
        <Typography variant="h4" color="white" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="grey.300" sx={{ mb: 4 }}>
          Looks like you haven't added any items to your cart yet.
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          href="/"
          sx={{ borderRadius: '25px', px: 4 }}
        >
          Start Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
        Your Shopping Cart
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cart.items.map((item, index) => (
            <CartItem
              key={item.product.id}
              item={item}
              onRemove={onRemoveFromCart}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <span>Items ({cart.items.length}):</span>
                <span>${cart.total.toFixed(2)}</span>
              </Typography>
              
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <span>Shipping:</span>
                <span>Free</span>
              </Typography>
              
              <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <span>Tax:</span>
                <span>${(cart.total * 0.08).toFixed(2)}</span>
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <span>Total:</span>
              <span>${(cart.total * 1.08).toFixed(2)}</span>
            </Typography>
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleCheckout}
              sx={{
                borderRadius: '25px',
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShoppingCart;