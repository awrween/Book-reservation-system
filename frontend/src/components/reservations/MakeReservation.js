
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MakeReservation = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: ''
  });

  const minStartDate = new Date().toISOString().split('T')[0];
  const minEndDate = formData.startDate || minStartDate;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`/api/books/${bookId}`);
        setBook(res.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching book details');
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      await axios.post('/api/reservations', {
        bookId,
        startDate: formData.startDate,
        endDate: formData.endDate
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      navigate('/');
    } catch (err) {
      console.error('Reservation failed:', err.response?.data || err.message);
      alert('Failed to make reservation.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '20px' }}>
      <h2>Reserve: {book.title}</h2>
      <p>Author: {book.author}</p>
      <p>Available: {book.available} / {book.quantity}</p>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={onChange}
            min={minStartDate}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={onChange}
            min={formData.startDate || minEndDate}
            required
          />
        </div>
        <input type="submit" value="Reserve" className="btn btn-primary mt-3" />
      </form>
    </div>
  );
};

export default MakeReservation;
