import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Grid,
  Paper,
  Chip,
  Rating,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Refresh, AddShoppingCart, Psychology } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async (preferences = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const addToCart = async (productId) => {
    try {
      const response = await fetch('http://localhost:8000/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });
      
      if (response.ok) {
        console.log('Product added to cart');
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const RecommendationCard = ({ product, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.image_url}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {product.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {product.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={product.rating} readOnly size="small" />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {product.rating}
            </Typography>
          </Box>
          
          <Chip 
            label={product.category} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <Typography variant="h5" color="primary" fontWeight="bold">
            ${product.price}
          </Typography>
        </CardContent>
        
        <CardActions>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddShoppingCart />}
            onClick={() => addToCart(product.id)}
            disabled={!product.in_stock}
            sx={{
              borderRadius: '25px',
              textTransform: 'none',
            }}
          >
            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Paper 
        sx={{ 
          p: 3, 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Psychology sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold">
              AI Recommendations
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => fetchRecommendations()}
            disabled={loading}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
            }}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : recommendations ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                "{recommendations.reason}"
              </Typography>
              
              <Grid container spacing={3}>
                {recommendations.products.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <RecommendationCard product={product} index={index} />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </AnimatePresence>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Click refresh to get AI-powered recommendations!
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AIRecommendations;