import React from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Rating,
  Chip,
  CircularProgress,
} from '@mui/material';
import { AddShoppingCart, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
            onClick={() => onAddToCart(product.id)}
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
};

const ProductGrid = ({ products, onAddToCart, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
        Our Products
      </Typography>
      
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductGrid;