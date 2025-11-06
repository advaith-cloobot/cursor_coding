from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import get_db_connection, init_db
from werkzeug.utils import secure_filename
import sqlite3
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_PDF_EXTENSIONS = {'pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Create upload directories
os.makedirs(os.path.join(UPLOAD_FOLDER, 'images'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'pdfs'), exist_ok=True)

# Initialize database on startup
init_db()

# Helper function to convert row to dict
def row_to_dict(row):
    """Convert sqlite3.Row to dictionary."""
    return dict(zip(row.keys(), row))

# ============= LOCKER ENDPOINTS =============

@app.route('/api/lockers', methods=['GET'])
def get_lockers():
    """Get all lockers organized by withdrawn/intact status."""
    try:
        conn = get_db_connection()
        all_lockers = conn.execute('SELECT * FROM lockers ORDER BY created_at DESC').fetchall()
        
        withdrawn_lockers = []
        intact_lockers = []
        
        for locker in all_lockers:
            locker_dict = row_to_dict(locker)
            locker_id = locker_dict['id']
            
            # Get asset counts
            asset_counts = conn.execute(
                '''SELECT 
                    COUNT(*) as total_assets,
                    COUNT(CASE WHEN status = 'withdrawn' THEN 1 END) as withdrawn_assets
                   FROM assets 
                   WHERE locker_id = ?''',
                (locker_id,)
            ).fetchone()
            
            locker_dict['total_assets'] = asset_counts['total_assets'] or 0
            locker_dict['withdrawn_assets'] = asset_counts['withdrawn_assets'] or 0
            
            if locker_dict['withdrawn_assets'] > 0:
                withdrawn_lockers.append(locker_dict)
            else:
                intact_lockers.append(locker_dict)
        
        conn.close()
        return jsonify({
            'withdrawn': withdrawn_lockers,
            'intact': intact_lockers
        }), 200
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
               (locker_id, name, asset_type, material_type, material_grade, details, worth, document_type, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                locker_id,
                data['name'],
                data['asset_type'],
                data.get('material_type'),
                data.get('material_grade'),
                data.get('details'),
                data.get('worth'),
                data.get('document_type'),
                'deposited'  # Initial status
            )
        )
        asset_id = cursor.lastrowid
        
        # Auto-create initial transaction
        cursor.execute(
            '''INSERT INTO transactions 
               (asset_id, transaction_type, reason, responsible_person)
               VALUES (?, ?, ?, ?)''',
            (
                asset_id,
                'depositing',
                'Initial deposit',
                data.get('responsible_person', 'System')
            )
        )
        
        # Create initial edit log entry for asset creation
        initial_fields = []
        initial_values = {}
        
        trackable_fields = ['name', 'asset_type', 'material_type', 'material_grade', 'details', 'worth', 'document_type']
        for field in trackable_fields:
            value = data.get(field)
            if value is not None and value != '':
                initial_fields.append(field)
                initial_values[field] = value
        
        # Create creation log entry
        if initial_fields:
            cursor.execute(
                '''INSERT INTO asset_edit_log 
                   (asset_id, edited_fields, old_values, new_values, edited_by)
                   VALUES (?, ?, ?, ?, ?)''',
                (
                    asset_id,
                    json.dumps(initial_fields),
                    json.dumps({}),  # No old values for creation
                    json.dumps(initial_values),
                    data.get('responsible_person', 'System')
                )
            )
        
        conn.commit()
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
        
        asset_dict = row_to_dict(asset)
        
        # Track changes for edit log
        edited_fields = []
        old_values = {}
        new_values = {}
        
        # Fields to track
        trackable_fields = ['name', 'asset_type', 'material_type', 'material_grade', 'details', 'worth', 'document_type']
        
        for field in trackable_fields:
            old_val = asset_dict.get(field)
            new_val = data.get(field)
            
            # Normalize None and empty string
            old_val = old_val if old_val is not None else ''
            new_val = new_val if new_val is not None else ''
            
            # Compare values
            if str(old_val) != str(new_val):
                edited_fields.append(field)
                old_values[field] = old_val
                new_values[field] = new_val
        
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
        
        # Create edit log entry if there are changes
        if edited_fields:
            cursor = conn.cursor()
            cursor.execute(
                '''INSERT INTO asset_edit_log 
                   (asset_id, edited_fields, old_values, new_values, edited_by)
                   VALUES (?, ?, ?, ?, ?)''',
                (
                    asset_id,
                    json.dumps(edited_fields),
                    json.dumps(old_values),
                    json.dumps(new_values),
                    data.get('edited_by', 'System')
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

# ============= FILE UPLOAD ENDPOINTS =============

@app.route('/api/assets/<int:asset_id>/files', methods=['POST'])
def upload_asset_files(asset_id):
    """Upload file(s) for an asset."""
    try:
        conn = get_db_connection()
        
        # Check if asset exists
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        if asset is None:
            conn.close()
            return jsonify({'error': 'Asset not found'}), 404
        
        if 'files' not in request.files:
            conn.close()
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        uploaded_files = []
        
        for file in files:
            if file.filename == '':
                continue
            
            # Determine file type
            filename = secure_filename(file.filename)
            file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
            
            if file_ext in ALLOWED_IMAGE_EXTENSIONS:
                file_type = 'image'
                upload_dir = os.path.join(UPLOAD_FOLDER, 'images')
            elif file_ext in ALLOWED_PDF_EXTENSIONS:
                file_type = 'pdf'
                upload_dir = os.path.join(UPLOAD_FOLDER, 'pdfs')
            else:
                continue  # Skip invalid file types
            
            # Generate unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
            unique_filename = f"{asset_id}_{timestamp}_{filename}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Save file
            file.save(file_path)
            file_size = os.path.getsize(file_path)
            
            # Check if this should be primary (first image uploaded)
            is_primary = 0
            if file_type == 'image':
                existing_primary = conn.execute(
                    'SELECT id FROM asset_files WHERE asset_id = ? AND is_primary = 1',
                    (asset_id,)
                ).fetchone()
                if existing_primary is None:
                    is_primary = 1
            
            # Insert file record
            cursor = conn.cursor()
            cursor.execute(
                '''INSERT INTO asset_files 
                   (asset_id, file_path, file_type, file_name, is_primary, file_size)
                   VALUES (?, ?, ?, ?, ?, ?)''',
                (asset_id, file_path, file_type, filename, is_primary, file_size)
            )
            file_id = cursor.lastrowid
            
            # Update asset primary_image_id if this is the first primary image
            if is_primary == 1:
                conn.execute(
                    'UPDATE assets SET primary_image_id = ? WHERE id = ?',
                    (file_id, asset_id)
                )
            
            uploaded_files.append({
                'id': file_id,
                'file_path': file_path,
                'file_type': file_type,
                'file_name': filename,
                'is_primary': bool(is_primary),
                'file_size': file_size
            })
        
        conn.commit()
        conn.close()
        
        return jsonify({'files': uploaded_files}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assets/<int:asset_id>/files', methods=['GET'])
def get_asset_files(asset_id):
    """Get all files for an asset."""
    try:
        conn = get_db_connection()
        
        # Check if asset exists
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        if asset is None:
            conn.close()
            return jsonify({'error': 'Asset not found'}), 404
        
        files = conn.execute(
            'SELECT * FROM asset_files WHERE asset_id = ? ORDER BY uploaded_at DESC',
            (asset_id,)
        ).fetchall()
        conn.close()
        
        return jsonify([row_to_dict(f) for f in files]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete a file."""
    try:
        conn = get_db_connection()
        
        # Get file info
        file_record = conn.execute('SELECT * FROM asset_files WHERE id = ?', (file_id,)).fetchone()
        if file_record is None:
            conn.close()
            return jsonify({'error': 'File not found'}), 404
        
        file_dict = row_to_dict(file_record)
        file_path = file_dict['file_path']
        asset_id = file_dict['asset_id']
        was_primary = file_dict['is_primary'] == 1
        
        # Delete physical file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete file record
        conn.execute('DELETE FROM asset_files WHERE id = ?', (file_id,))
        
        # If deleted file was primary, set another image as primary
        if was_primary:
            next_image = conn.execute(
                'SELECT id FROM asset_files WHERE asset_id = ? AND file_type = "image" LIMIT 1',
                (asset_id,)
            ).fetchone()
            if next_image:
                conn.execute(
                    'UPDATE asset_files SET is_primary = 1 WHERE id = ?',
                    (next_image['id'],)
                )
                conn.execute(
                    'UPDATE assets SET primary_image_id = ? WHERE id = ?',
                    (next_image['id'], asset_id)
                )
            else:
                conn.execute(
                    'UPDATE assets SET primary_image_id = NULL WHERE id = ?',
                    (asset_id,)
                )
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'File deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/files/<int:file_id>/set-primary', methods=['PUT'])
def set_primary_image(file_id):
    """Set a file as the primary image for an asset."""
    try:
        conn = get_db_connection()
        
        # Get file info
        file_record = conn.execute('SELECT * FROM asset_files WHERE id = ?', (file_id,)).fetchone()
        if file_record is None:
            conn.close()
            return jsonify({'error': 'File not found'}), 404
        
        file_dict = row_to_dict(file_record)
        if file_dict['file_type'] != 'image':
            conn.close()
            return jsonify({'error': 'Only images can be set as primary'}), 400
        
        asset_id = file_dict['asset_id']
        
        # Unset current primary
        conn.execute(
            'UPDATE asset_files SET is_primary = 0 WHERE asset_id = ? AND is_primary = 1',
            (asset_id,)
        )
        
        # Set new primary
        conn.execute(
            'UPDATE asset_files SET is_primary = 1 WHERE id = ?',
            (file_id,)
        )
        
        # Update asset primary_image_id
        conn.execute(
            'UPDATE assets SET primary_image_id = ? WHERE id = ?',
            (file_id, asset_id)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Primary image updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/uploads/<path:filename>', methods=['GET'])
def serve_uploaded_file(filename):
    """Serve uploaded files."""
    try:
        # Determine directory based on file path
        if filename.startswith('images/'):
            directory = os.path.join(UPLOAD_FOLDER, 'images')
            filename = filename.replace('images/', '')
        elif filename.startswith('pdfs/'):
            directory = os.path.join(UPLOAD_FOLDER, 'pdfs')
            filename = filename.replace('pdfs/', '')
        else:
            return jsonify({'error': 'Invalid file path'}), 400
        
        return send_from_directory(directory, filename)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= TRANSACTION ENDPOINTS =============

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get all transactions with optional filters."""
    try:
        asset_id = request.args.get('asset_id', type=int)
        asset_type = request.args.get('asset_type')
        
        conn = get_db_connection()
        
        query = '''
            SELECT t.*, a.name as asset_name, a.asset_type
            FROM transactions t
            JOIN assets a ON t.asset_id = a.id
            WHERE 1=1
        '''
        params = []
        
        if asset_id:
            query += ' AND t.asset_id = ?'
            params.append(asset_id)
        
        if asset_type:
            query += ' AND a.asset_type = ?'
            params.append(asset_type)
        
        query += ' ORDER BY t.transaction_date DESC'
        
        transactions = conn.execute(query, params).fetchall()
        conn.close()
        
        return jsonify([row_to_dict(t) for t in transactions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """Get a specific transaction by ID."""
    try:
        conn = get_db_connection()
        transaction = conn.execute(
            '''SELECT t.*, a.name as asset_name, a.asset_type
               FROM transactions t
               JOIN assets a ON t.asset_id = a.id
               WHERE t.id = ?''',
            (transaction_id,)
        ).fetchone()
        conn.close()
        
        if transaction is None:
            return jsonify({'error': 'Transaction not found'}), 404
        
        return jsonify(row_to_dict(transaction)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    """Create a new transaction."""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'asset_id' not in data:
            return jsonify({'error': 'Missing required field: asset_id'}), 400
        if 'transaction_type' not in data:
            return jsonify({'error': 'Missing required field: transaction_type'}), 400
        
        valid_types = ['depositing', 'withdrawing', 'permanently_remove']
        if data['transaction_type'] not in valid_types:
            return jsonify({'error': f'Invalid transaction_type. Must be one of: {", ".join(valid_types)}'}), 400
        
        conn = get_db_connection()
        
        # Check if asset exists
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (data['asset_id'],)).fetchone()
        if asset is None:
            conn.close()
            return jsonify({'error': 'Asset not found'}), 404
        
        # Insert transaction
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO transactions 
               (asset_id, transaction_type, reason, responsible_person, transaction_date)
               VALUES (?, ?, ?, ?, ?)''',
            (
                data['asset_id'],
                data['transaction_type'],
                data.get('reason'),
                data.get('responsible_person'),
                data.get('transaction_date', datetime.now().isoformat())
            )
        )
        transaction_id = cursor.lastrowid
        
        # Update asset status based on transaction type
        status_map = {
            'depositing': 'deposited',
            'withdrawing': 'withdrawn',
            'permanently_remove': 'removed'
        }
        new_status = status_map[data['transaction_type']]
        conn.execute(
            'UPDATE assets SET status = ? WHERE id = ?',
            (new_status, data['asset_id'])
        )
        
        conn.commit()
        
        # Fetch created transaction
        transaction = conn.execute(
            '''SELECT t.*, a.name as asset_name, a.asset_type
               FROM transactions t
               JOIN assets a ON t.asset_id = a.id
               WHERE t.id = ?''',
            (transaction_id,)
        ).fetchone()
        conn.close()
        
        return jsonify(row_to_dict(transaction)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """Update an existing transaction."""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        
        # Get existing transaction
        transaction = conn.execute('SELECT * FROM transactions WHERE id = ?', (transaction_id,)).fetchone()
        if transaction is None:
            conn.close()
            return jsonify({'error': 'Transaction not found'}), 404
        
        transaction_dict = row_to_dict(transaction)
        asset_id = transaction_dict['asset_id']
        old_type = transaction_dict['transaction_type']
        
        # Update transaction
        conn.execute(
            '''UPDATE transactions 
               SET transaction_type = ?, reason = ?, responsible_person = ?, transaction_date = ?
               WHERE id = ?''',
            (
                data.get('transaction_type', old_type),
                data.get('reason'),
                data.get('responsible_person'),
                data.get('transaction_date', transaction_dict['transaction_date']),
                transaction_id
            )
        )
        
        # Update asset status if transaction type changed
        if 'transaction_type' in data and data['transaction_type'] != old_type:
            status_map = {
                'depositing': 'deposited',
                'withdrawing': 'withdrawn',
                'permanently_remove': 'removed'
            }
            new_status = status_map[data['transaction_type']]
            conn.execute(
                'UPDATE assets SET status = ? WHERE id = ?',
                (new_status, asset_id)
            )
        
        conn.commit()
        
        # Fetch updated transaction
        updated_transaction = conn.execute(
            '''SELECT t.*, a.name as asset_name, a.asset_type
               FROM transactions t
               JOIN assets a ON t.asset_id = a.id
               WHERE t.id = ?''',
            (transaction_id,)
        ).fetchone()
        conn.close()
        
        return jsonify(row_to_dict(updated_transaction)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """Delete a transaction."""
    try:
        conn = get_db_connection()
        
        # Get transaction
        transaction = conn.execute('SELECT * FROM transactions WHERE id = ?', (transaction_id,)).fetchone()
        if transaction is None:
            conn.close()
            return jsonify({'error': 'Transaction not found'}), 404
        
        transaction_dict = row_to_dict(transaction)
        asset_id = transaction_dict['asset_id']
        
        # Delete transaction
        conn.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))
        
        # Recalculate asset status based on latest remaining transaction
        latest_transaction = conn.execute(
            'SELECT * FROM transactions WHERE asset_id = ? ORDER BY transaction_date DESC LIMIT 1',
            (asset_id,)
        ).fetchone()
        
        if latest_transaction:
            status_map = {
                'depositing': 'deposited',
                'withdrawing': 'withdrawn',
                'permanently_remove': 'removed'
            }
            new_status = status_map[latest_transaction['transaction_type']]
            conn.execute(
                'UPDATE assets SET status = ? WHERE id = ?',
                (new_status, asset_id)
            )
        else:
            # No transactions left, set to deposited
            conn.execute(
                'UPDATE assets SET status = ? WHERE id = ?',
                ('deposited', asset_id)
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Transaction deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assets/<int:asset_id>/transactions', methods=['GET'])
def get_asset_transactions(asset_id):
    """Get all transactions for a specific asset."""
    try:
        conn = get_db_connection()
        
        # Check if asset exists
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        if asset is None:
            conn.close()
            return jsonify({'error': 'Asset not found'}), 404
        
        transactions = conn.execute(
            '''SELECT t.*, a.name as asset_name, a.asset_type
               FROM transactions t
               JOIN assets a ON t.asset_id = a.id
               WHERE t.asset_id = ?
               ORDER BY t.transaction_date DESC''',
            (asset_id,)
        ).fetchall()
        conn.close()
        
        return jsonify([row_to_dict(t) for t in transactions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= EDIT LOG ENDPOINTS =============

@app.route('/api/assets/<int:asset_id>/edit-log', methods=['GET'])
def get_asset_edit_log(asset_id):
    """Get edit history for an asset, including creation event."""
    try:
        conn = get_db_connection()
        
        # Check if asset exists
        asset = conn.execute('SELECT * FROM assets WHERE id = ?', (asset_id,)).fetchone()
        if asset is None:
            conn.close()
            return jsonify({'error': 'Asset not found'}), 404
        
        asset_dict = row_to_dict(asset)
        
        # Get last 10 edit logs (ordered by most recent first)
        edit_logs = conn.execute(
            'SELECT * FROM asset_edit_log WHERE asset_id = ? ORDER BY edited_at DESC LIMIT 10',
            (asset_id,)
        ).fetchall()
        conn.close()
        
        # Parse JSON fields
        logs = []
        for log in edit_logs:
            log_dict = row_to_dict(log)
            log_dict['edited_fields'] = json.loads(log_dict['edited_fields']) if log_dict['edited_fields'] else []
            log_dict['old_values'] = json.loads(log_dict['old_values']) if log_dict['old_values'] else {}
            log_dict['new_values'] = json.loads(log_dict['new_values']) if log_dict['new_values'] else {}
            log_dict['is_creation'] = len(log_dict['old_values']) == 0  # Creation has no old values
            logs.append(log_dict)
        
        # If no edit logs exist but asset exists, create a creation log entry from asset data
        if not logs and asset_dict:
            creation_log = {
                'id': 0,  # Virtual ID for creation
                'asset_id': asset_id,
                'edited_at': asset_dict.get('created_at', asset_dict.get('created_at')),
                'edited_fields': [],
                'old_values': {},
                'new_values': {},
                'edited_by': 'System',
                'is_creation': True
            }
            
            # Add all initial values
            trackable_fields = ['name', 'asset_type', 'material_type', 'material_grade', 'details', 'worth', 'document_type']
            for field in trackable_fields:
                value = asset_dict.get(field)
                if value is not None and value != '':
                    creation_log['edited_fields'].append(field)
                    creation_log['new_values'][field] = value
            
            logs.append(creation_log)
        
        # Logs are already sorted by edited_at descending (newest first) from the query
        
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= DASHBOARD ENDPOINTS =============

@app.route('/api/lockers/<int:locker_id>/dashboard', methods=['GET'])
def get_locker_dashboard(locker_id):
    """Get dashboard data for a locker."""
    try:
        conn = get_db_connection()
        
        # Check if locker exists
        locker = conn.execute('SELECT * FROM lockers WHERE id = ?', (locker_id,)).fetchone()
        if locker is None:
            conn.close()
            return jsonify({'error': 'Locker not found'}), 404
        
        # Calculate KPIs
        kpi_query = '''
            SELECT 
                COUNT(DISTINCT a.id) as total_assets,
                COUNT(DISTINCT CASE WHEN a.status = 'withdrawn' THEN a.id END) as withdrawn_assets,
                COUNT(DISTINCT CASE WHEN a.status = 'deposited' THEN a.id END) as deposited_assets
            FROM assets a
            WHERE a.locker_id = ?
        '''
        kpis = conn.execute(kpi_query, (locker_id,)).fetchone()
        
        # Get last 10 transactions for assets in this locker only
        recent_transactions = conn.execute(
            '''SELECT t.*, a.name as asset_name, a.asset_type, l.name as locker_name
               FROM transactions t
               JOIN assets a ON t.asset_id = a.id
               JOIN lockers l ON a.locker_id = l.id
               WHERE a.locker_id = ?
               ORDER BY t.transaction_date DESC
               LIMIT 10''',
            (locker_id,)
        ).fetchall()
        
        conn.close()
        
        return jsonify({
            'kpis': {
                'total_assets': kpis['total_assets'] or 0,
                'withdrawn_assets': kpis['withdrawn_assets'] or 0,
                'deposited_assets': kpis['deposited_assets'] or 0
            },
            'recent_transactions': [row_to_dict(t) for t in recent_transactions]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

