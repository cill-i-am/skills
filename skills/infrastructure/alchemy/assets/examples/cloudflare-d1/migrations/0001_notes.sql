CREATE TABLE notes (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);
-- Non-sensitive tutorial fixture. Production seeding is a separate operation.
INSERT INTO notes (id, title) VALUES (1, 'First note');
