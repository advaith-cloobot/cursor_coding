from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db
import sqlite3

app = Flask(__name__)
CORS(app)

# Initialize database on startup
init_db()

# Helper function to convert row to dict
def row_to_dict(row):
    """Convert sqlite3.Row to dictionary."""
    return dict(zip(row.keys(), row))

# ============= LOCKER ENDPOINTS =============

@app.route('/api/lockers', methods=['GET'])
def get_lockers():
    """Get all lockers."""
    try:
        conn = get_db_connection()
        lockers = conn.execute('SELECT * FROM lockers ORDER BY created_at DESC').fetchall()
        conn.close()
        return jsonify([row_to_dict(locker) for locker in lockers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lockers/<int:locker_id>', methods=['GET'])
def get_locker(locker_id):
    """Get a specific locker by ID."""
    try:
        conn = get_db_connection()
        locker = conn.execute('SELECT * FROM lockers WHERE id = ?', (locker_id,)).fetchone()
        conn.close()
        
        if locker is None:
            return jsonify({'error': 'Locker not found'}), 404
        
        return jsonify(row_to_dict(locker)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lockers', methods=['POST'])
def create_locker():
    """Create a new locker."""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'location_name', 'address']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO lockers (name, location_name, address) VALUES (?, ?, ?)',
            (data['name'], data['location_name'], data['address'])
        )
        conn.commit()
        
        locker_id = cursor.lastrowid
        locker = conn.execute('SELECT * FROM lockers WHERE id = ?', (locker_id,)).fetchone()
        conn.close()
        
        return jsonify(row_to_dict(locker)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lockers/<int:locker_id>', methods=['PUT'])
def update_locker(locker_id):
    """Update an existing locker."""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'location_name', 'address']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_db_connection()
        
        # Check if locker exists
        locker = conn.execute('SELECT * FROM lockers WHERE id = ?', (locker_id,)).fetchone()
        if locker is None:
            conn.close()
            return jsonify({'error': 'Locker not found'}), 404
        
        # Update locker
        conn.execute(
            'UPDATE lockers SET name = ?, location_name = ?, address = ? WHERE id = ?',
            (data['name'], data['location_name'], data['address'], locker_id)
        )
        conn.commit()
        
        # Fetch updated locker
        updated_locker = conn.execute('SELECT * FROM lockers WHERE id = ?', (locker_id,)).fetchone()
        conn.close()
        
        return jsonify(row_to_dict(updated_locker)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lockers/<int:locker_id>', methods=['DELETE'])
def delete_locker(locker_id):
    """Delete a locker and all its assets."""
    try:
        conn = get_db_connection()
        
        # Check if locker exists
        locker = conn.execute('SELECT * FROM lockers WHERE id = ?', (locker_id,)).fetchone()
        if locker is None:
            conn.close()
            return jsonify({'error': 'Locker not found'}), 404
        
        # Delete locker (assets will be deleted automatically due to CASCADE)
        conn.execute('DELETE FROM lockers WHERE id = ?', (locker_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Locker deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= ASSET ENDPOINTS =============

@app.route('/api/lockers/<int:locker_id>/assets', methods=['GET'])
def get_locker_assets(locker_id):
    """Get all assets for a specific locker."""
    try:
        conn = get_db_connection()
        
        # Check if locker exists
        locker = conn.execute('SELECT * FROM lockers WHERE id = ?', (locker_id,)).fetchone()
        if locker is None:
            conn.close()
            return jsonify({'error': 'Locker not found'}), 404
        
        # Get all assets for the locker
        assets = conn.execute(
            'SELECT * FROM assets WHERE locker_id = ? ORDER BY created_at DESC',
            (locker_id,)
        ).fetchall()
        conn.close()
        
        return jsonify([row_to_dict(asset) for asset in assets]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assets/<int:asset_id>', methods=['GET'])
def get_asset(asset_id):
    """Get a specific asset by ID."""
    try:
        conn = get_db_connection()
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        conn.close()
        
        if asset is None:
            return jsonify({'error': 'Asset not found'}), 404
        
        return jsonify(row_to_dict(asset)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lockers/<int:locker_id>/assets', methods=['POST'])
def create_asset(locker_id):
    """Create a new asset for a locker."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'name' not in data or not data['name']:
            return jsonify({'error': 'Missing required field: name'}), 400
        if 'asset_type' not in data or not data['asset_type']:
            return jsonify({'error': 'Missing required field: asset_type'}), 400
        
        # Validate asset_type
        valid_types = ['jewellery', 'document', 'misc']
        if data['asset_type'] not in valid_types:
            return jsonify({'error': f'Invalid asset_type. Must be one of: {", ".join(valid_types)}'}), 400
        
        conn = get_db_connection()
        
        # Check if locker exists
        locker = conn.execute('SELECT * FROM lockers WHERE id = ?', (locker_id,)).fetchone()
        if locker is None:
            conn.close()
            return jsonify({'error': 'Locker not found'}), 404
        
        # Insert asset
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO assets 
               (locker_id, name, asset_type, material_type, material_grade, details, worth, document_type) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                locker_id,
                data['name'],
                data['asset_type'],
                data.get('material_type'),
                data.get('material_grade'),
                data.get('details'),
                data.get('worth'),
                data.get('document_type')
            )
        )
        conn.commit()
        
        asset_id = cursor.lastrowid
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        conn.close()
        
        return jsonify(row_to_dict(asset)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assets/<int:asset_id>', methods=['PUT'])
def update_asset(asset_id):
    """Update an existing asset."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'name' not in data or not data['name']:
            return jsonify({'error': 'Missing required field: name'}), 400
        if 'asset_type' not in data or not data['asset_type']:
            return jsonify({'error': 'Missing required field: asset_type'}), 400
        
        # Validate asset_type
        valid_types = ['jewellery', 'document', 'misc']
        if data['asset_type'] not in valid_types:
            return jsonify({'error': f'Invalid asset_type. Must be one of: {", ".join(valid_types)}'}), 400
        
        conn = get_db_connection()
        
        # Check if asset exists
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        if asset is None:
            conn.close()
            return jsonify({'error': 'Asset not found'}), 404
        
        # Update asset
        conn.execute(
            '''UPDATE assets 
               SET name = ?, asset_type = ?, material_type = ?, material_grade = ?, 
                   details = ?, worth = ?, document_type = ?
               WHERE id = ?''',
            (
                data['name'],
                data['asset_type'],
                data.get('material_type'),
                data.get('material_grade'),
                data.get('details'),
                data.get('worth'),
                data.get('document_type'),
                asset_id
            )
        )
        conn.commit()
        
        # Fetch updated asset
        updated_asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        conn.close()
        
        return jsonify(row_to_dict(updated_asset)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assets/<int:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    """Delete an asset."""
    try:
        conn = get_db_connection()
        
        # Check if asset exists
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        if asset is None:
            conn.close()
            return jsonify({'error': 'Asset not found'}), 404
        
        # Delete asset
        conn.execute('DELETE FROM assets WHERE id = ?', (asset_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Asset deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

