import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { Send, Close, SmartToy, Person } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const AIChat = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Hello! I\'m your AI shopping assistant. How can I help you find the perfect products today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
        }),
      });

      const data = await response.json();
      
      const aiMessage = {
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, I\'m having trouble responding right now. Please try again!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const MessageBubble = ({ message }) => {
    const isAI = message.type === 'ai';
    
    return (
      <motion.div
        initial={{ opacity: 0, x: isAI ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: isAI ? 'flex-start' : 'flex-end',
            mb: 2,
          }}
        >
          {isAI && (
            <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
              <SmartToy />
            </Avatar>
          )}
          
          <Paper
            sx={{
              p: 2,
              maxWidth: '70%',
              bgcolor: isAI ? 'grey.100' : 'primary.main',
              color: isAI ? 'text.primary' : 'white',
              borderRadius: isAI ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
            }}
          >
            <Typography variant="body1">
              {message.content}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
              {message.timestamp.toLocaleTimeString()}
            </Typography>
          </Paper>
          
          {!isAI && (
            <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>
              <Person />
            </Avatar>
          )}
        </Box>
      </motion.div>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SmartToy sx={{ mr: 1 }} />
          <Typography variant="h6">AI Shopping Assistant</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, mb: 2 }}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
          </AnimatePresence>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                <SmartToy />
              </Avatar>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: '20px 20px 20px 5px' }}>
                <CircularProgress size={20} />
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Ask me about products, recommendations, or anything else..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={!inputValue.trim() || loading}
            sx={{
              borderRadius: '50%',
              minWidth: '56px',
              height: '56px',
            }}
          >
            <Send />
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AIChat;