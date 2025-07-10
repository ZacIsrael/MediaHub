-- clients table
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,          -- auto-incrementing unique ID
  name VARCHAR(100) NOT NULL,     -- full name, up to 100 characters
  email VARCHAR(100) UNIQUE NOT NULL,  -- unique email, required
  phone VARCHAR(20)               -- phone number (stored as text to handle dashes, parentheses, etc.)
);

-- 'bookings' table that stores info about photography/video jobs, shoots, or events
CREATE TABLE bookings (
  -- Unique identifier for each booking
  id SERIAL PRIMARY KEY,

  -- Foreign key linking this booking to a client in the 'clients' table
  client_id INTEGER NOT NULL REFERENCES clients(id),

  -- Date and time of the scheduled event
  event_date TIMESTAMP NOT NULL,

  -- Type of event (e.g. 'wedding', 'birthday', 'music video')
  event_type VARCHAR(100) NOT NULL,

  -- Price charged for the booking (can include deposit or full fee)
  price NUMERIC(10, 2) NOT NULL,

  -- Booking status: must be one of the allowed values ('pending', 'confirmed', etc.)
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  -- Timestamp for when the booking record was first created
  created_at TIMESTAMP DEFAULT NOW(),

  -- Timestamp for when the booking record was last updated
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Enforces that the 'status' field must be one of the specified valid values
  CONSTRAINT status_check CHECK (
    status IN ('pending', 'confirmed', 'completed', 'cancelled')
  )
);


