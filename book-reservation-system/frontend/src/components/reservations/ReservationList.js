import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ReservationList = () => {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get('/api/reservations', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setReservations(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reservations:', err.response?.data || err.message);
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const cancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      await axios.delete(`/api/reservations/${reservationId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      setReservations(reservations.filter(r => r._id !== reservationId));
    } catch (err) {
      console.error('Failed to cancel reservation:', err.response?.data || err.message);
      alert('Failed to cancel reservation');
    }
  };

  if (loading) return <div>Loading reservations...</div>;

  return (
    <div>
      <h2>Your Reservations</h2>
      {reservations.length === 0 ? (
        <p>You have no reservations.</p>
      ) : (
        <div className="reservation-list">
          {reservations.map(reservation => (
            <div key={reservation._id} className="card">
              <h3>{reservation.book?.title}</h3>
              <p><strong>Author:</strong> {reservation.book?.author}</p>
              <p><strong>Start Date:</strong> {reservation.startDate?.slice(0, 10)}</p>
              <p><strong>End Date:</strong> {reservation.endDate?.slice(0, 10)}</p>
              <button
                className="btn btn-danger"
                onClick={() => cancelReservation(reservation._id)}
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationList;
