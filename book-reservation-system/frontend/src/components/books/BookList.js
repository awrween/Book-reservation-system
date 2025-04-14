import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const BookList = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('/api/books');
        setBooks(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching books:', err);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Available Books</h1>

      {user?.role === 'admin' && (
        <div style={{ margin: '10px 0' }}>
          <Link to="/add-book" className="btn btn-primary">Add Book</Link>
        </div>
      )}

      <div className="book-list">
        {books.length === 0 ? (
          <p>No books available in the library.</p>
        ) : (
          <div className="card-grid">
            {books.map(book => (
              <div key={book._id} className="card">
                <h3>{book.title}</h3>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>ISBN:</strong> {book.isbn}</p>
                <p><strong>Status:</strong> {book.available > 0 ? `${book.available} available` : 'Unavailable'}</p>

                {book.available > 0 && (
                  <Link to={`/reserve/${book._id}`} className="btn btn-success me-2">Reserve</Link>
                )}

                {user?.role === 'admin' && (
                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this book?')) {
                        try {
                          await axios.delete(`/api/books/${book._id}`, {
                            headers: {
                              'x-auth-token': localStorage.getItem('token')
                            }
                          });
                          setBooks(books.filter(b => b._id !== book._id));
                        } catch (err) {
                          console.error('Failed to delete book:', err);
                          alert('Failed to delete book. See console for details.');
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;
