const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const movieFilePath = path.join(__dirname, 'data', 'movies.json');
const bookingsFilePath = path.join(__dirname, 'data', 'bookings.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getMovieById(movieId) {
  const movies = readJsonFile(movieFilePath);
  return movies.find((movie) => movie.id === movieId);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Movie booking backend is running' });
});

app.get('/api/movies', (req, res) => {
  const movies = readJsonFile(movieFilePath);
  const { city, category, query, date } = req.query;

  let filteredMovies = [...movies];

  if (city && city !== 'all') {
    filteredMovies = filteredMovies.filter((movie) => movie.city === city);
  }

  if (category && category !== 'all') {
    filteredMovies = filteredMovies.filter((movie) => movie.category === category);
  }

  if (date && date !== 'all') {
    filteredMovies = filteredMovies.filter((movie) => movie.date === date);
  }

  if (query) {
    const keyword = query.toLowerCase();
    filteredMovies = filteredMovies.filter((movie) =>
      `${movie.title} ${movie.category} ${movie.city} ${movie.theatre}`.toLowerCase().includes(keyword)
    );
  }

  res.json(filteredMovies);
});

app.get('/api/movies/:id', (req, res) => {
  const movie = getMovieById(req.params.id);
  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  res.json(movie);
});

app.get('/api/bookings', (req, res) => {
  const bookings = readJsonFile(bookingsFilePath);
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const { movieId, customerName, email, phone, seats, amount } = req.body;

  if (!movieId || !customerName || !email || !phone || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: 'Missing required booking information' });
  }

  const movie = getMovieById(movieId);
  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  const bookings = readJsonFile(bookingsFilePath);
  const selectedSeats = seats.map((seat) => String(seat).trim());
  const existingBookings = bookings.filter((booking) => booking.movieId === movieId);

  const reservedSeats = existingBookings.flatMap((booking) => booking.seats || []);
  const duplicateSeats = selectedSeats.filter((seat) => reservedSeats.includes(seat));

  if (duplicateSeats.length > 0) {
    return res.status(409).json({
      message: 'Some seats are already booked',
      duplicateSeats,
    });
  }

  const booking = {
    id: `booking-${Date.now()}`,
    movieId,
    movieTitle: movie.title,
    customerName,
    email,
    phone,
    seats: selectedSeats,
    amount: Number(amount) || Number(selectedSeats.length * movie.price),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  writeJsonFile(bookingsFilePath, bookings);

  res.status(201).json({ message: 'Booking created successfully', booking });
});

app.get('/api/bookings/:id', (req, res) => {
  const bookings = readJsonFile(bookingsFilePath);
  const booking = bookings.find((item) => item.id === req.params.id);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  res.json(booking);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
