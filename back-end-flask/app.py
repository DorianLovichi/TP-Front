import os

from dotenv import load_dotenv
from flask import (Flask, flash, redirect, render_template, request, session,
                   url_for, jsonify)
from flask_bcrypt import Bcrypt
from flask_login import (LoginManager, current_user, login_required,
                         login_user, logout_user)
from flask_cors import CORS

from init_db import get_db_connection
from models.user import User
from routes.game_routes import game_bp

# Charger les variables d'environnement
load_dotenv()

# Initialiser l'application Flask
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Charger la clé secrète depuis le fichier .env pour sécuriser les sessions
app.secret_key = os.getenv('SECRET_KEY')

# Initialiser Bcrypt pour le hachage des mots de passe
bcrypt = Bcrypt(app)

app.register_blueprint(game_bp, url_prefix='/game')

# Après l'initialisation de l'app Flask
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user WHERE user_id = ?', (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if user:
        return User(
            user['user_id'], 
            user['user_login'], 
            user['user_mail'],
            user['active_character_id']
        )
    return None

@app.route('/')
def home():
    if current_user.is_authenticated:
        return redirect(url_for('game.inventory'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
        
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            return {'code': 400, 'message': 'Email and password are required'}, 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM user WHERE user_mail = ?', (email,))
        user_data = cursor.fetchone()
        cursor.close()
        conn.close()

        if user_data and bcrypt.check_password_hash(user_data['user_password'], password):
            user = User(
                user_data['user_id'], 
                user_data['user_login'], 
                user_data['user_mail'],
                user_data['active_character_id']
            )
            login_user(user)
            return {'code': 200, 'message': 'Login successful'}, 200
        else:
            return {'code': 401, 'message': 'Email ou mot de passe incorrect !'}, 401

    return {'code': 405, 'message': 'Method not allowed'}, 405

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        username = request.form['username']
        password = request.form['password']
        recheck_password = request.form['recheck_password']

        if not email or not username or not password or not recheck_password:
            return {'code': 400, 'message': 'Tous les champs sont obligatoires !'}, 400

        if password != recheck_password:
            return {'code': 400, 'message': 'Les mots de passe ne correspondent pas !'}, 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM user WHERE user_mail = ?', (email,))
        account = cursor.fetchone()

        if account:
            cursor.close()
            conn.close()
            return {'code': 409, 'message': 'Cet email est déjà utilisé!'}, 409
        
        cursor.execute(
            'INSERT INTO user (user_login, user_password, user_mail) VALUES (?, ?, ?)',
            (username, hashed_password, email)
        )
        conn.commit()
        user_id = cursor.lastrowid
        user = User(user_id, username, email)
        login_user(user)
        cursor.close()
        conn.close()
        
        return {'code': 201, 'message': 'Compte créé avec succès !'}, 201

    return {'code': 405, 'message': 'Method not allowed'}, 405

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    flash('Vous avez été déconnecté !', 'success')
    return redirect(url_for('login'))

@app.route('/inventory')
@login_required
def inventory():
    if not current_user.active_character_id:
        return redirect(url_for('game.get_characters'))
    return redirect(url_for('game.inventory'))

@app.route('/add_item', methods=['GET', 'POST'])
@login_required
def add_item():
    if not current_user.active_character_id:
        return redirect(url_for('game.get_characters'))
    
    if request.method == 'POST':
        try:
            data = request.get_json()
            name = data.get('name')
            type_id = data.get('type_id')
            quantity = data.get('quantity')
            character_id = current_user.active_character_id

            if not all([name, type_id, quantity]):
                return jsonify({'error': 'Tous les champs sont obligatoires'}), 400

            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Insert the new item
            cursor.execute('''
                INSERT INTO inventory (name, type_id, quantity, character_id)
                VALUES (?, ?, ?, ?)
            ''', (name, type_id, quantity, character_id))
            
            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({'message': 'Item créé avec succès'}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return redirect(url_for('game.inventory'))

@app.route('/delete/<int:item_id>', methods=['POST'])
@login_required
def delete_item(item_id):
    if not current_user.active_character_id:
        return jsonify({'error': 'Aucun personnage actif'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify the item belongs to the active character
        cursor.execute('SELECT * FROM inventory WHERE id = ? AND character_id = ?', 
                      (item_id, current_user.active_character_id))
        item = cursor.fetchone()
        
        if not item:
            return jsonify({'error': 'Item non trouvé ou n\'appartient pas au personnage actif'}), 404

        cursor.execute('DELETE FROM inventory WHERE id = ?', (item_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Item supprimé avec succès'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/consume/<int:item_id>', methods=['POST'])
@login_required
def consume_item(item_id):
    if not current_user.active_character_id:
        flash('Veuillez d\'abord sélectionner un personnage.', 'warning')
        return redirect(url_for('game.character_list'))

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Vérifier que l'objet appartient au personnage actif
    cursor.execute('''
        SELECT inventory.*, item_types.type_name 
        FROM inventory 
        JOIN item_types ON inventory.type_id = item_types.id 
        WHERE inventory.id = ? AND inventory.character_id = ?
    ''', (item_id, current_user.active_character_id))
    
    item = cursor.fetchone()
    
    if not item:
        flash('Objet non trouvé.', 'error')
        return redirect(url_for('inventory'))
    
    if item['type_name'] not in ['potion', 'plante']:
        flash('Cet objet ne peut pas être consommé.', 'warning')
        return redirect(url_for('inventory'))
    
    # Appliquer les effets de l'objet
    if item['type_name'] == 'potion':
        # Augmenter les points de vie du personnage
        cursor.execute('''
            UPDATE characters 
            SET health = MIN(health + 20, 100) 
            WHERE id = ?
        ''', (current_user.active_character_id,))
        effect_message = "Vous avez récupéré 20 points de vie!"
    elif item['type_name'] == 'plante':
        # Augmenter temporairement l'attaque
        cursor.execute('''
            UPDATE characters 
            SET attack = attack + 5 
            WHERE id = ?
        ''', (current_user.active_character_id,))
        effect_message = "Votre attaque a augmenté de 5 points!"
    
    # Réduire la quantité de l'objet
    if item['quantity'] > 1:
        cursor.execute('''
            UPDATE inventory 
            SET quantity = quantity - 1 
            WHERE id = ?
        ''', (item_id,))
    else:
        cursor.execute('DELETE FROM inventory WHERE id = ?', (item_id,))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    flash(f'Objet consommé! {effect_message}', 'success')
    return redirect(url_for('inventory'))

@app.route('/edit/<int:item_id>', methods=['GET', 'POST'])
def edit_item(item_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM inventory WHERE id = ?', (item_id,))
    item = cursor.fetchone()

    if not item:
        flash("L'objet n'existe pas.", 'danger')
        return redirect(url_for('inventory'))

    cursor.execute('SELECT * FROM item_types')
    item_types = cursor.fetchall()

    if request.method == 'POST':
        name = request.form['name']
        type_id = request.form['type_id']
        quantity = request.form['quantity']

        if not name or not type_id or not quantity:
            flash('Tous les champs sont obligatoires !', 'danger')
            return redirect(url_for('edit_item', item_id=item_id))

        cursor.execute('UPDATE inventory SET name = ?, type_id = ?, quantity = ? WHERE id = ?',
                       (name, type_id, quantity, item_id))
        conn.commit()
        cursor.close()
        conn.close()
        flash('Objet modifié avec succès !', 'success')
        return redirect(url_for('inventory'))

    cursor.close()
    conn.close()
    return render_template('edit_item.html', action='Modifier', item=item, item_types=item_types)

if __name__ == '__main__':
    app.run(debug=True, port=3000
            )
