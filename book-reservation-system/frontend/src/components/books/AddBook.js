
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const AddBook = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    quantity: ''
  });

  const { title, author, isbn, quantity } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/books', { title, author, isbn, quantity }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      navigate('/');
    } catch (err) {
      console.error('Error adding book:', err.response?.data || err.message);
    }
  };

  if (!user || user.role !== 'admin') {
    return <p>Unauthorized access.</p>;
  }

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '20px' }}>
      <h2 className="text-center">Add New Book</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" className="form-control" value={title} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Author</label>
          <input type="text" name="author" className="form-control" value={author} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>ISBN</label>
          <input type="text" name="isbn" className="form-control" value={isbn} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>Quantity</label>
          <input type="number" name="quantity" className="form-control" value={quantity} onChange={onChange} required min="1" />
        </div>
        <button type="submit" className="btn btn-primary mt-3 w-100">Add Book</button>
      </form>
    </div>
  );
};

export default AddBook;
