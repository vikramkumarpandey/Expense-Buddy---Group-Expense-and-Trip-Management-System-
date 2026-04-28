USE expense_buddy;

INSERT INTO users (name, email) VALUES
('Vikram', 'vikram@example.com'),
('Anas', 'anas@example.com'),
('Kartikey', 'kartikey@example.com'),
('Rahul', 'rahul@example.com');

INSERT INTO personal_expenses (user_id, title, category, amount, expense_date, notes, transaction_type, payment_method) VALUES
(1, 'Monthly Pocket Money', 'Food', 5000.00, '2026-03-01', 'Income from parents', 'income', 'Bank Transfer'),
(1, 'Canteen Lunch', 'Food', 180.00, '2026-03-10', 'Quick lunch', 'expense', 'Cash'),
(1, 'Library Snacks', 'Food', 90.00, '2026-03-11', 'Tea and biscuit', 'expense', 'UPI'),
(1, 'Auto Fare', 'Transport', 160.00, '2026-03-12', 'College to hostel', 'expense', 'Cash'),
(1, 'Movie Ticket', 'Entertainment', 250.00, '2026-03-13', 'Weekend show', 'expense', 'Card');

INSERT INTO budgets (user_id, category, monthly_limit) VALUES
(1, 'Food', 3000.00),
(1, 'Transport', 2000.00),
(1, 'Entertainment', 1500.00);

INSERT INTO trips (title, destination, budget, start_date, end_date, status) VALUES
('Nainital Weekend', 'Nainital', 8500.00, '2026-03-25', '2026-03-27', 'Planning'),
('Jaipur Group Ride', 'Jaipur', 5200.00, '2026-04-05', '2026-04-07', 'Open to Join'),
('Rishikesh Escape', 'Rishikesh', 12000.00, '2026-02-10', '2026-02-13', 'Completed');

INSERT INTO trip_members (trip_id, user_id, role) VALUES
(1, 1, 'Coordinator'),
(1, 2, 'Member'),
(1, 3, 'Member'),
(2, 1, 'Member'),
(2, 4, 'Member'),
(3, 1, 'Member'),
(3, 2, 'Member'),
(3, 3, 'Coordinator'),
(3, 4, 'Member');

INSERT INTO trip_expenses (trip_id, paid_by_user_id, title, category, amount, expense_date, split_type) VALUES
(3, 3, 'Stay Booking', 'Stay', 4400.00, '2026-02-10', 'equal'),
(3, 1, 'Food Bundle', 'Food', 1450.00, '2026-02-11', 'equal'),
(3, 2, 'Cab Transfer', 'Travel', 2250.00, '2026-02-10', 'equal');

INSERT INTO trip_ratings (trip_id, rated_user_id, reviewer_user_id, behavior_score, teamwork_score, reliability_score, comment_text) VALUES
(3, 3, 1, 4.9, 4.7, 4.8, 'Managed bookings smoothly and helped the group.'),
(3, 2, 1, 4.5, 4.3, 4.4, 'Friendly and cooperative.'),
(3, 4, 1, 4.2, 4.0, 4.1, 'Improved during the trip.'),
(3, 1, 3, 4.5, 4.6, 4.7, 'Handled group records very well.');
