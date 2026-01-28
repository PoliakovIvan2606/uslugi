CREATE TABLE service (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    shortDescription TEXT NOT NULL,
    allDescription TEXT,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    nameSpecialist TEXT NOT NULL,
    experience INTEGER NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL
);

CREATE TABLE generate_image (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT CHECK(status IN ('new', 'in_progress', 'created'))
)