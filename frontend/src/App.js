import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Shopping Assistant</h1>
        <h2>Products</h2>
        <ul>
          {products.map(product => (
            <li key={product.id} style={{ marginBottom: '1em' }}>
              <strong>{product.name}</strong> - ${product.price}<br />
              <span>{product.description}</span><br />
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </li>
          ))}
        </ul>
        <h2>Cart ({cart.length})</h2>
        <ul>
          {cart.map((item, idx) => (
            <li key={idx}>{item.name} - ${item.price}</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
