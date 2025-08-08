import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Rating,
  Chip,
} from '@mui/material';
import { Search, AddShoppingCart } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ProductSearch = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      setSearchResults(data.results);
      onSearch(searchQuery);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
        // Show success message or update UI
        console.log('Product added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

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
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Search for Products
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search for products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || loading}
            startIcon={<Search />}
            sx={{
              borderRadius: '25px',
              px: 3,
              textTransform: 'none',
            }}
          >
            Search
          </Button>
        </Box>

        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" gutterBottom>
                Search Results ({searchResults.length} found)
              </Typography>
              
              {searchResults.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No products found matching your search. Try different keywords!
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {searchResults.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardMedia
                            component="img"
                            height="150"
                            image={product.image_url}
                            alt={product.name}
                            sx={{ objectFit: 'cover' }}
                          />
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="subtitle1" component="div" noWrap>
                              {product.name}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {product.description.substring(0, 80)}...
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
                              sx={{ mb: 1 }}
                            />
                            
                            <Typography variant="h6" color="primary" fontWeight="bold">
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
                              size="small"
                              sx={{
                                borderRadius: '15px',
                                textTransform: 'none',
                              }}
                            >
                              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                          </CardActions>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </Box>
  );
};

export default ProductSearch;