-- Insert sample clients
INSERT INTO clients (name, email, phone) VALUES
('John Doe', 'john@example.com', '2515551234'),
('Jane Smith', 'jane@example.com', '8505555678');

-- Insert sample bookings
INSERT INTO bookings (client_id, event_date, event_type, price, status) VALUES
(1, NOW() + INTERVAL '7 days', 'Birthday', 200.00, 'confirmed'),
(2, NOW() + INTERVAL '14 days', 'Music Video', 500.00, 'pending');

-- Insert sample users
INSERT INTO users (name, email, password_hash, provider) VALUES
('Test User', 'testuser@example.com', 'fakehash123', 'local');
