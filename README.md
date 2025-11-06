# Locker Organizer App

A full-stack web application for managing family lockers and valuable assets. Built with React, Flask, and SQLite.

## Features

- 📦 **Locker Management**: Create, read, update, and delete lockers
- 💎 **Asset Tracking**: Manage multiple assets within each locker
- 🏷️ **Asset Types**: Support for Jewellery, Documents, and Miscellaneous items
- 💍 **Jewellery Details**: Track material type, grade, and worth
- 📄 **Document Management**: Organize important documents by type
- 🎨 **Modern UI**: Beautiful Material-UI interface with responsive design
- 🔄 **Real-time Updates**: Instant feedback for all CRUD operations

## Project Structure

```
cursor_coding/
├── backend/
│   ├── app.py              # Flask API endpoints
│   ├── database.py         # Database initialization and models
│   ├── requirements.txt    # Python dependencies
│   └── lockers.db         # SQLite database (auto-generated)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Database Schema

### Lockers Table
- `id` - Primary key
- `name` - Locker name
- `location_name` - Location identifier
- `address` - Full address
- `created_at` - Timestamp

### Assets Table
- `id` - Primary key
- `locker_id` - Foreign key to lockers
- `name` - Asset name
- `asset_type` - Type: jewellery, document, or misc
- `material_type` - For jewellery (e.g., Gold, Silver)
- `material_grade` - For jewellery (e.g., 24K, 18K)
- `details` - Additional information
- `worth` - Monetary value for jewellery
- `document_type` - For documents
- `created_at` - Timestamp

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize the database (optional - auto-initializes on first run):
```bash
python database.py
```

4. Start the Flask server:
```bash
python app.py
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install npm dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Locker Endpoints
- `GET /api/lockers` - Get all lockers
- `GET /api/lockers/<id>` - Get specific locker
- `POST /api/lockers` - Create new locker
- `PUT /api/lockers/<id>` - Update locker
- `DELETE /api/lockers/<id>` - Delete locker

### Asset Endpoints
- `GET /api/lockers/<locker_id>/assets` - Get all assets for a locker
- `GET /api/assets/<id>` - Get specific asset
- `POST /api/lockers/<locker_id>/assets` - Create new asset
- `PUT /api/assets/<id>` - Update asset
- `DELETE /api/assets/<id>` - Delete asset

## Usage Guide

### Managing Lockers

1. **Create a Locker**: Click the floating "+" button on the home screen
2. **View Locker Details**: Click on any locker card
3. **Edit Locker**: Click the edit icon on a locker card
4. **Delete Locker**: Click the delete icon (warning: deletes all assets inside)

### Managing Assets

1. **Add Asset**: Open a locker and click the floating "+" button
2. **Asset Types**:
   - **Jewellery**: Enter material type, grade, worth, and details
   - **Document**: Specify document type and details
   - **Miscellaneous**: Add any other items with custom details
3. **View Asset Details**: Click on an asset in the list to expand details
4. **Edit Asset**: Click the edit icon on an asset
5. **Delete Asset**: Click the delete icon on an asset

## Technology Stack

### Backend
- Flask 3.0.0 - Python web framework
- Flask-CORS 4.0.0 - Cross-origin resource sharing
- SQLite3 - Lightweight database

### Frontend
- React 18 - UI library
- Vite - Build tool and dev server
- Material-UI - Component library
- React Router - Client-side routing
- Axios - HTTP client

## Development

### Backend Development
The Flask server runs in debug mode by default. Any changes to Python files will automatically reload the server.

### Frontend Development
Vite provides hot module replacement (HMR) for instant updates during development.

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

## Testing the Application

1. **Start both servers** (backend and frontend)
2. **Open browser** to `http://localhost:3000`
3. **Test Locker CRUD**:
   - Create a new locker
   - Edit the locker details
   - View locker information
4. **Test Asset CRUD**:
   - Click on a locker to view details
   - Add different types of assets (jewellery, document, misc)
   - Verify conditional fields appear based on asset type
   - Edit and delete assets
5. **Test Navigation**:
   - Navigate between home and locker detail pages
   - Use breadcrumbs and back button

## Troubleshooting

### Port Already in Use
- Backend: Change port in `backend/app.py` (line: `app.run(debug=True, port=5000)`)
- Frontend: Change port in `frontend/vite.config.js`

### Database Issues
- Delete `backend/lockers.db` and restart the backend to reinitialize

### CORS Issues
- Ensure Flask-CORS is installed and the backend is running on port 5000

## Future Enhancements

- User authentication and multi-user support
- Image upload for assets
- Search and filter functionality
- Export data to PDF/CSV
- Asset history tracking
- Mobile responsive improvements
- Dark mode support

## License

This project is created for personal/family use.
