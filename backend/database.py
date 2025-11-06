import sqlite3
from datetime import datetime

DATABASE_NAME = 'lockers.db'

def get_db_connection():
    """Create and return a database connection."""
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create lockers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lockers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location_name TEXT NOT NULL,
            address TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create assets table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locker_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            asset_type TEXT NOT NULL,
            material_type TEXT,
            material_grade TEXT,
            details TEXT,
            worth DECIMAL(10, 2),
            document_type TEXT,
            status TEXT DEFAULT 'deposited',
            primary_image_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (locker_id) REFERENCES lockers (id) ON DELETE CASCADE,
            FOREIGN KEY (primary_image_id) REFERENCES asset_files (id) ON DELETE SET NULL
        )
    ''')
    
    # Create asset_files table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS asset_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_name TEXT NOT NULL,
            is_primary INTEGER DEFAULT 0,
            file_size INTEGER,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE CASCADE
        )
    ''')
    
    # Create transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL,
            reason TEXT,
            responsible_person TEXT,
            transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE CASCADE
        )
    ''')
    
    # Create asset_edit_log table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS asset_edit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL,
            edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            edited_fields TEXT,
            old_values TEXT,
            new_values TEXT,
            edited_by TEXT,
            FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE CASCADE
        )
    ''')
    
    # Migrate existing assets to have 'deposited' status if status column doesn't exist
    try:
        cursor.execute('ALTER TABLE assets ADD COLUMN status TEXT DEFAULT "deposited"')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        cursor.execute('ALTER TABLE assets ADD COLUMN primary_image_id INTEGER')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    # Update existing assets without status to 'deposited'
    cursor.execute('UPDATE assets SET status = "deposited" WHERE status IS NULL')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

if __name__ == '__main__':
    init_db()

