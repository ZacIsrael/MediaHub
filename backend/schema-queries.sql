-- clients table
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  -- auto-incrementing unique ID
  name VARCHAR(100) NOT NULL,
  -- full name, up to 100 characters
  email VARCHAR(100) UNIQUE NOT NULL,
  -- unique email, required
  phone VARCHAR(20) -- phone number (stored as text to handle dashes, parentheses, etc.)
);

-- Add a constraint to ensure all email addresses in the "clients" table are properly formatted
ALTER TABLE
  clients
ADD
  CONSTRAINT valid_email_format -- Name of the new constraint (for easier debugging and management)
  CHECK (
    -- Use a regular expression to validate that the email follows a realistic format
    -- Breakdown of the regex:
    -- ^                 : Start of string
    -- [a-z0-9._%+-]+    : One or more valid characters for the username part
    -- @                 : Must contain an "@" symbol
    -- [a-z0-9.-]+       : One or more valid domain characters (letters, numbers, dots, hyphens)
    -- \.                : A literal dot before the domain extension
    -- [a-z]{2,}         : The domain extension must be at least 2 letters (e.g., com, org, co.uk)
    -- $                 : End of string
    -- ~*                : Case-insensitive regex match (PostgreSQL-specific)
    email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
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

CREATE TABLE users (
  -- internal user ID
  id SERIAL PRIMARY KEY,
  -- user's name (may come from OAuth)
  name VARCHAR(100),
  -- user email (can be used across login methods)
  email VARCHAR(100) UNIQUE,
  -- will be null for OAuth users
  password_hash TEXT,
  -- 'local', 'google', 'github', etc.
  provider VARCHAR(50),
  -- unique ID from OAuth provider (e.g., Google ID)
  provider_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD CONSTRAINT unique_email_provider UNIQUE (email, provider);
