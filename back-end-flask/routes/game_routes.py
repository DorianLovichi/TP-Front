from flask import Blueprint, flash, redirect, render_template, request, url_for, jsonify
from flask_login import current_user, login_required

from init_db import get_db_connection
from models.game import Character, Item, Mage, Monster, Race, Warrior, Tableau

game_bp = Blueprint('game', __name__)

import json
import time
import random


@game_bp.route('/create_character', methods=['GET', 'POST'])
@login_required
def create_character():
    if request.method == 'POST':
        name = request.form.get('name')
        race = request.form.get('race')
        character_class = request.form.get('class')

        # Créer l'instance temporaire du personnage (sans ID)
        if character_class == 'warrior':
            character = Warrior(name=name, race=Race[race.upper()])
        elif character_class == 'mage':
            character = Mage(name=name, race=Race[race.upper()])

        # Sauvegarder dans la base de données
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO characters (name, race, class, health, attack, defense, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (character.name, character.race.name, character.type,
              character.health, character.attack, character.defense,
              current_user.id))

        character_id = cursor.lastrowid
        # Mettre à jour l'ID du personnage
        character.id = character_id

        # Mettre à jour l'active_character_id de l'utilisateur
        cursor.execute('''
            UPDATE user 
            SET active_character_id = ? 
            WHERE user_id = ?
        ''', (character_id, current_user.id))

        conn.commit()
        cursor.close()
        conn.close()

        flash('Personnage créé avec succès!', 'success')
        return redirect(url_for('game.character_profile'))

    return render_template('game/create_character.html')


@game_bp.route('/select_character/<int:character_id>', methods=['POST'])
@login_required
def select_character(character_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Vérifier que le personnage appartient bien à l'utilisateur
    cursor.execute('''
        SELECT * FROM characters 
        WHERE id = ? AND user_id = ?
    ''', (character_id, current_user.id))

    if cursor.fetchone():
        cursor.execute('''
            UPDATE user 
            SET active_character_id = ? 
            WHERE user_id = ?
        ''', (character_id, current_user.id))
        conn.commit()
        flash('Personnage sélectionné avec succès!', 'success')
    else:
        flash('Personnage non trouvé.', 'error')

    cursor.close()
    conn.close()
    return redirect(url_for('game.character_list'))


@game_bp.route('/versus')
@login_required
def versus_mode():
    characters = Character.get_all_by_user(current_user.id)
    return render_template('game/versus.html', characters=characters)


@game_bp.route('/quests')
@login_required
def quest_mode():
    if not current_user.active_character_id:
        flash('Veuillez d\'abord créer ou sélectionner un personnage.', 'warning')
        return redirect(url_for('game.create_character'))

    character = Character.get_by_id(current_user.active_character_id)
    return render_template('game/quests.html', character=character)


def fight_hero_vs_monster(hero, monster):
    """Simulates a fight between a hero and a monster."""
    fight_data = {
        "mode": "Quest",
        "hero": {
            "name": hero.name,
            "original_health": hero.health,
        },
        "monster": {
            "name": monster.name,
            "original_health": monster.health,
        },
        "rounds": []
    }

    round = 1  # Reset round for each fight

    # Fight until one of the participants is defeated
    while monster.health > 0 and hero.health > 0:
        round_data = {
            "round": round,
            "hero_health": hero.health,
            "monster_health": monster.health,
        }

        # Hero attacks monster
        damage_to_monster = max(hero.attack, 0)  # No negative damage
        monster.health -= damage_to_monster
        round_data["damage_to_monster"] = damage_to_monster

        if monster.health <= 0:
            round_data["winner"] = hero.name
            fight_data["winner"] = hero.name
            fight_data["rounds"].append(round_data)
            break  # Monster is defeated

        # Monster retaliates
        damage_to_hero = max(monster.attack, 0)  # No negative damage
        hero.health -= damage_to_hero
        round_data["damage_to_hero"] = damage_to_hero

        if hero.health <= 0:
            round_data["winner"] = monster.name
            fight_data["winner"] = monster.name
            fight_data["rounds"].append(round_data)
            break  # Hero is defeated

        fight_data["rounds"].append(round_data)
        round += 1

    return json.dumps(fight_data, indent=4)

@game_bp.route('/quest/<int:quest_id>', methods=['POST'])
def start_quest(quest_id):
    # Fetch the character and the opponent for the quest
    character = Character.get_by_id(current_user.active_character_id)
    opponent = get_opponent_for_quest(quest_id)

    # Call the quest logic (PvP battle or similar)
    result_json = fight_hero_vs_monster(character, opponent)

    # Deserialize JSON string into a dictionary
    result = json.loads(result_json)

    # Display the result
    return render_template('game/quest_result.html', result=result)


def get_opponent_for_quest(quest_id):
    """Fetches the opponent based on the quest ID."""
    if quest_id == 1:
        return Monster(name="Forest Monster", health=50, attack=10)
    elif quest_id == 2:
        return Monster(name="Cave Troll", health=80, attack=15)
    elif quest_id == 3:
        return Monster(name="Dragon", health=200, attack=40)


@game_bp.route("/fight", methods=["POST"])
@login_required
def fight():
    player1_id = int(request.form.get("player1"))
    player2_id = int(request.form.get("player2"))

    # Retrieve characters based on IDs (replace with DB query)
    characters = Character.get_all_by_user(current_user.id)
    player1 = next((c for c in characters if c.id == player1_id), None)
    player2 = next((c for c in characters if c.id == player2_id), None)

    if not player1 or not player2:
        return "Invalid characters selected", 400

    # Run the fight logic
    result_json = fight_logic(player1, player2)

    # Deserialize JSON string into a dictionary
    result = json.loads(result_json)

    return render_template("game/fight_result.html", result=result)


@game_bp.route('/character_profile')
@login_required
def character_profile():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM characters WHERE user_id = ? ORDER BY id DESC LIMIT 1', (current_user.id,))
    character_data = cursor.fetchone()
    cursor.close()
    conn.close()

    if character_data:
        character = Character(
            id=character_data['id'],
            name=character_data['name'],
            race=Race[character_data['race']],
            character_type=character_data['class'],
            health=character_data['health'],
            attack=character_data['attack'],
            defense=character_data['defense'],
            level=character_data['level']
        )
        return render_template('game/character_profile.html', character=character)

    flash('Aucun personnage trouvé.', 'warning')
    return redirect(url_for('game.create_character'))


@game_bp.route('/characters')
@login_required
def character_list():
    characters = Character.get_all_by_user(current_user.id)
    return render_template('game/character_list.html', characters=characters)


@game_bp.route("/start_battle", methods=["POST"])
def start_battle():
    player1_id = request.json.get("player1")
    player2_id = request.json.get("player2")

    # Simulate game logic
    result = f"Player 1 (Character {player1_id}) battles Player 2 (Character {player2_id})!"
    # Your actual game function would go here instead of this mock result.

    # Return the result
    return jsonify({"result": result})


def fight_logic(player1, player2):
    round = 1
    fight_data = {
        "mode": "PVP",
        "players": {
            "player1": {
                "name": player1.name,
                "original_health": player1.health,
            },
            "player2": {
                "name": player2.name,
                "original_health": player2.health,
            }
        },
        "rounds": []
    }

    original_player1_health = player1.health
    original_player2_health = player2.health

    while player1.health > 0 and player2.health > 0:
        round_data = {
            "round": round,
            "player1_health": player1.health,
            "player2_health": player2.health,
        }

        # Determine initiative: Who attacks first
        if player1.attack > player2.attack:
            round_data["initiative"] = player1.name

            damage_to_player2 = max(player1.attack - player2.defense, 0)  # Attack - defense, cannot be negative
            player2.health -= damage_to_player2
            round_data["damage_to_player2"] = damage_to_player2

            if player2.health <= 0:
                round_data["winner"] = player1.name
                fight_data["winner"] = player1.name
                fight_data["rounds"].append(round_data)
                break

            damage_to_player1 = max(player2.attack - player1.defense, 0)
            player1.health -= damage_to_player1
            round_data["damage_to_player1"] = damage_to_player1

        else:
            round_data["initiative"] = player2.name

            damage_to_player1 = max(player2.attack - player1.defense, 0)
            player1.health -= damage_to_player1
            round_data["damage_to_player1"] = damage_to_player1

            if player1.health <= 0:
                round_data["winner"] = player2.name
                fight_data["winner"] = player2.name
                fight_data["rounds"].append(round_data)
                break

            damage_to_player2 = max(player1.attack - player2.defense, 0)
            player2.health -= damage_to_player2
            round_data["damage_to_player2"] = damage_to_player2

        fight_data["rounds"].append(round_data)
        round += 1

    # Reset player health for future battles (optional)
    player1.health = original_player1_health
    player2.health = original_player2_health

    return json.dumps(fight_data, indent=4)


@game_bp.route('/api/characters', methods=['GET'])
@login_required
def api_characters():
    characters = Character.get_all_by_user(current_user.id)
    return jsonify({
        'characters': [{
            'id': char.id,
            'name': char.name,
            'race': char.race.name,
            'class': char.type,
            'health': char.health,
            'attack': char.attack,
            'defense': char.defense,
            'level': char.level,
            'is_active': char.id == current_user.active_character_id
        } for char in characters]
    })

@game_bp.route('/api/characters/<int:character_id>/select', methods=['POST'])
@login_required
def api_select_character(character_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Verify the character belongs to the user
    cursor.execute('''
        SELECT * FROM characters 
        WHERE id = ? AND user_id = ?
    ''', (character_id, current_user.id))

    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({'error': 'Character not found or not owned by user'}), 404

    # Update the active character
    cursor.execute('''
        UPDATE user 
        SET active_character_id = ? 
        WHERE user_id = ?
    ''', (character_id, current_user.id))
    
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Character selected successfully'})

@game_bp.route('/api/inventory', methods=['GET'])
@game_bp.route('/api/inventory/<int:character_id>', methods=['GET'])
@login_required
def api_inventory(character_id=None):
    # If no character_id is provided, use the active character
    if character_id is None:
        if not current_user.active_character_id:
            return jsonify({'error': 'No active character selected'}), 400
        character_id = current_user.active_character_id

    conn = get_db_connection()
    cursor = conn.cursor()

    # Verify the character belongs to the user
    cursor.execute('''
        SELECT * FROM characters 
        WHERE id = ? AND user_id = ?
    ''', (character_id, current_user.id))

    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({'error': 'Character not found or not owned by user'}), 404

    # Get character info
    cursor.execute('SELECT name FROM characters WHERE id = ?', (character_id,))
    character = cursor.fetchone()

    # Get inventory items
    query = '''
        SELECT inventory.id AS item_id, inventory.name AS item_name, 
               item_types.type_name AS item_type, inventory.quantity AS item_quantity 
        FROM inventory 
        JOIN item_types ON inventory.type_id = item_types.id 
        WHERE inventory.character_id = ?
    '''
    cursor.execute(query, (character_id,))
    items = cursor.fetchall()
    
    cursor.close()
    conn.close()

    return jsonify({
        'character_name': character['name'],
        'character_id': character_id,
        'items': [{
            'id': item['item_id'],
            'name': item['item_name'],
            'type': item['item_type'],
            'quantity': item['item_quantity']
        } for item in items]
    })

@game_bp.route('/api/item-types', methods=['GET'])
@login_required
def api_item_types():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM item_types')
    item_types = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return jsonify({
        'item_types': [{
            'id': item_type['id'],
            'name': item_type['type_name']
        } for item_type in item_types]
    })

@game_bp.route('/api/inventory/add', methods=['POST'])
@login_required
def api_add_item():
    # Get data from request
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Extract required fields
    character_id = data.get('character_id')
    name = data.get('name')
    type_id = data.get('type_id')
    quantity = data.get('quantity', 1)  # Default to 1 if not specified
    
    # Validate required fields
    if not all([character_id, name, type_id]):
        return jsonify({'error': 'Missing required fields: character_id, name, type_id'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verify the character belongs to the user
    cursor.execute('''
        SELECT * FROM characters 
        WHERE id = ? AND user_id = ?
    ''', (character_id, current_user.id))
    
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({'error': 'Character not found or not owned by user'}), 404
    
    # Verify the item type exists
    cursor.execute('SELECT * FROM item_types WHERE id = ?', (type_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({'error': 'Invalid item type'}), 400
    
    # Add the item to inventory
    cursor.execute('''
        INSERT INTO inventory (character_id, name, type_id, quantity) 
        VALUES (?, ?, ?, ?)
    ''', (character_id, name, type_id, quantity))
    
    item_id = cursor.lastrowid
    
    # Get the item type name for the response
    cursor.execute('SELECT type_name FROM item_types WHERE id = ?', (type_id,))
    item_type = cursor.fetchone()
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({
        'message': 'Item added successfully',
        'item': {
            'id': item_id,
            'name': name,
            'type': item_type['type_name'],
            'quantity': quantity
        }
    }), 201

@game_bp.route('/api/quests', methods=['GET'])
@login_required
def api_quests():
    """Get all available quests"""
    quests = [
        {
            "id": 1,
            "name": "La Forêt Sombre",
            "description": "Defeat the forest monster",
            "difficulty": "easy",
            "recommended_level": 1,
            "reward": "Forest Crystal"
        },
        {
            "id": 2,
            "name": "Les Grottes Mystérieuses",
            "description": "Defeat the cave troll",
            "difficulty": "medium",
            "recommended_level": 2,
            "reward": "Troll Hide"
        },
        {
            "id": 3,
            "name": "Le Donjon du Dragon",
            "description": "Defeat the dragon",
            "difficulty": "hard",
            "recommended_level": 3,
            "reward": "Dragon Scale"
        }
    ]
    
    return jsonify({
        'quests': quests
    })

@game_bp.route('/api/quests/<int:quest_id>/start', methods=['POST'])
@login_required
def api_start_quest(quest_id):
    """Start a quest with the active character"""
    if not current_user.active_character_id:
        return jsonify({'error': 'No active character selected'}), 400
    
    character = Character.get_by_id(current_user.active_character_id)
    if not character:
        return jsonify({'error': 'Character not found'}), 404
    
    # Get the opponent for the quest
    opponent = get_opponent_for_quest(quest_id)
    if not opponent:
        return jsonify({'error': 'Quest not found'}), 404
    
    # Simulate the battle
    result_json = fight_hero_vs_monster(character, opponent)
    result = json.loads(result_json)
    
    # Add battle log for API response
    battle_log = []
    for round_data in result['rounds']:
        if 'damage_to_monster' in round_data:
            battle_log.append(f"{character.name} attacks {opponent.name} for {round_data['damage_to_monster']} damage")
        if 'damage_to_hero' in round_data:
            battle_log.append(f"{opponent.name} attacks {character.name} for {round_data['damage_to_hero']} damage")
    
    # Get quest reward based on quest ID
    rewards = {
        1: {"experience": 50, "items": [{"name": "Forest Crystal", "type": "clé", "quantity": 1}]},
        2: {"experience": 100, "items": [{"name": "Troll Hide", "type": "armure", "quantity": 1}]},
        3: {"experience": 200, "items": [{"name": "Dragon Scale", "type": "armure", "quantity": 1}]}
    }
    
    # Check if the character won (has more than 0 health at the end)
    character_won = character.health > 0
    
    if character_won:
        battle_log.append(f"{opponent.name} is defeated!")
        
        # Add rewards to character
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Add experience (update level if needed)
        cursor.execute('''
            UPDATE characters 
            SET level = level + 1 
            WHERE id = ? AND level < 10
        ''', (character.id,))
        
        # Add items to inventory
        for item in rewards.get(quest_id, {"items": []})["items"]:
            # Get the item type ID
            cursor.execute('SELECT id FROM item_types WHERE type_name = ?', (item["type"],))
            type_result = cursor.fetchone()
            if type_result:
                type_id = type_result['id']
                # Add item to inventory
                cursor.execute('''
                    INSERT INTO inventory (character_id, name, type_id, quantity)
                    VALUES (?, ?, ?, ?)
                ''', (character.id, item["name"], type_id, item["quantity"]))
        
        conn.commit()
        cursor.close()
        conn.close()
    else:
        battle_log.append(f"{character.name} is defeated!")
    
    return jsonify({
        'won': character_won,
        'battle_log': battle_log,
        'rewards': rewards.get(quest_id, {"experience": 0, "items": []}) if character_won else {"experience": 0, "items": []}
    })

@game_bp.route('/api/plateau/play/<int:character_id>', methods=['GET'])
@login_required
def api_play_plateau(character_id):
    """Play a complete plateau game with a specific character and return the result as JSON"""
    # Get the character
    character = Character.get_by_id(character_id)
    if not character:
        return jsonify({'error': 'Character not found'}), 404
    
    # Create the Tableau game instance
    tableau_game = Tableau(character)
    
    # Play the entire game and get the result
    game_result = tableau_game.play_game()
    
    # Parse the game result into structured data
    turns = []
    current_turn = None
    
    for line in game_result.split('\n'):
        if line.startswith(character.name + ' rolls'):
            if current_turn:
                turns.append(current_turn)
            current_turn = {
                'dice_roll': int(line.split(' ')[-1]),
                'events': []
            }
        elif line.startswith(character.name + ' moves'):
            current_turn['position'] = int(line.split(' ')[-1])
        elif line.startswith(character.name + ' found an item'):
            current_turn['events'].append({
                'type': 'item',
                'item': line.split(': ')[-1]
            })
        elif line.startswith('Enemy encountered'):
            current_turn['events'].append({
                'type': 'enemy',
                'enemy': line.split(': ')[-1]
            })
        elif line.startswith('Battle with'):
            # This is handled by the battle_data in the previous event
            pass
        elif line.startswith('Nothing happened'):
            current_turn['events'].append({
                'type': 'empty'
            })
        elif 'VICTORY!' in line:
            current_turn['events'].append({
                'type': 'victory',
                'message': line
            })
    
    if current_turn:
        turns.append(current_turn)
    
    # Prepare the response
    response = {
        'character': {
            'id': character.id,
            'name': character.name,
            'health': character.health,
            'attack': character.attack,
            'defense': character.defense,
            'level': character.level
        },
        'turns': turns,
        'completed': tableau_game.is_completed,
        'game_over': tableau_game.is_game_over,
        'final_position': tableau_game.current_position
    }
    
    # Update character level if completed
    if tableau_game.is_completed:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE characters 
            SET level = level + 1 
            WHERE id = ? AND level < 10
        ''', (character.id,))
        conn.commit()
        cursor.close()
        conn.close()
    
    return jsonify(response)

@game_bp.route('/api/characters/<int:character_id>', methods=['GET'])
@login_required
def api_character_profile(character_id):
    """Get a specific character's profile data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verify the character belongs to the user
    cursor.execute('''
        SELECT * FROM characters 
        WHERE id = ? AND user_id = ?
    ''', (character_id, current_user.id))
    
    character_data = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not character_data:
        return jsonify({'error': 'Character not found or not owned by user'}), 404
    
    # Create a Character object
    character = Character(
        id=character_data['id'],
        name=character_data['name'],
        race=Race[character_data['race']],
        character_type=character_data['class'],
        health=character_data['health'],
        attack=character_data['attack'],
        defense=character_data['defense'],
        level=character_data['level']
    )
    
    return jsonify({
        'character': {
            'id': character.id,
            'name': character.name,
            'race': character.race.name,
            'class': character.type,
            'health': character.health,
            'attack': character.attack,
            'defense': character.defense,
            'level': character.level,
            'is_active': character.id == current_user.active_character_id
        }
    })

@game_bp.route('/api/battle', methods=['POST'])
@login_required
def api_battle():
    """Start a battle between two characters"""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    player1_id = data.get('player1_id')
    player2_id = data.get('player2_id')
    
    if not player1_id or not player2_id:
        return jsonify({'error': 'Missing player IDs'}), 400
    
    # Get both characters
    player1 = Character.get_by_id(player1_id)
    player2 = Character.get_by_id(player2_id)
    
    if not player1 or not player2:
        return jsonify({'error': 'One or both characters not found'}), 404
    
    # Run the fight logic
    result_json = fight_logic(player1, player2)
    result = json.loads(result_json)
    
    # Add battle log for API response
    battle_log = []
    for round_data in result['rounds']:
        if 'damage_to_player2' in round_data:
            battle_log.append(f"{player1.name} attacks {player2.name} for {round_data['damage_to_player2']} damage")
        if 'damage_to_player1' in round_data:
            battle_log.append(f"{player2.name} attacks {player1.name} for {round_data['damage_to_player1']} damage")
    
    # Add final battle result
    if result.get('winner'):
        battle_log.append(f"{result['winner']} is victorious!")
    
    return jsonify({
        'won': result.get('winner') == player1.name,
        'battle_log': battle_log,
        'players': {
            'player1': {
                'name': player1.name,
                'health': player1.health,
                'attack': player1.attack,
                'defense': player1.defense
            },
            'player2': {
                'name': player2.name,
                'health': player2.health,
                'attack': player2.attack,
                'defense': player2.defense
            }
        }
    })

@game_bp.route('/api/characters/battle', methods=['GET'])
@login_required
def api_battle_characters():
    """Get all characters available for battle"""
    characters = Character.get_all_by_user(current_user.id)
    return jsonify({
        'characters': [{
            'id': char.id,
            'name': char.name,
            'race': char.race.name,
            'class': char.type,
            'health': char.health,
            'attack': char.attack,
            'defense': char.defense,
            'level': char.level
        } for char in characters]
    })

@game_bp.route('/api/characters/active', methods=['GET'])
@login_required
def api_active_character():
    if not current_user.active_character_id:
        return jsonify({"error": "No active character selected"}), 404
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM characters 
        WHERE id = ? AND user_id = ?
    ''', (current_user.active_character_id, current_user.id))
    
    character = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not character:
        return jsonify({"error": "Active character not found"}), 404
        
    return jsonify({
        "id": character[0],
        "name": character[1],
        "race": character[2],
        "class": character[3],
        "health": character[4],
        "attack": character[5],
        "defense": character[6]
    })

@game_bp.route('/api/characters', methods=['POST'])
@login_required
def api_create_character():
    """Create a new character via API"""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    name = data.get('name')
    race = data.get('race')
    character_class = data.get('class')
    
    if not all([name, race, character_class]):
        return jsonify({'error': 'Missing required fields: name, race, class'}), 400
    
    try:
        # Create the character instance
        if character_class == 'warrior':
            character = Warrior(name=name, race=Race[race.upper()])
        elif character_class == 'mage':
            character = Mage(name=name, race=Race[race.upper()])
        else:
            return jsonify({'error': 'Invalid character class'}), 400
        
        # Save to database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO characters (name, race, class, health, attack, defense, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (character.name, character.race.name, character.type,
              character.health, character.attack, character.defense,
              current_user.id))
        
        character_id = cursor.lastrowid
        character.id = character_id
        
        # Update user's active character
        cursor.execute('''
            UPDATE user 
            SET active_character_id = ? 
            WHERE user_id = ?
        ''', (character_id, current_user.id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'message': 'Character created successfully',
            'character': {
                'id': character.id,
                'name': character.name,
                'race': character.race.name,
                'class': character.type,
                'health': character.health,
                'attack': character.attack,
                'defense': character.defense,
                'level': character.level
            }
        }), 201
        
    except KeyError:
        return jsonify({'error': 'Invalid race value'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@game_bp.route('/api/character-options', methods=['GET'])
@login_required
def api_character_options():
    """Get available races and classes for character creation"""
    return jsonify({
        'races': [
            {'value': 'HUMAN', 'label': 'Humain'},
            {'value': 'VAMPIRE', 'label': 'Vampire'},
            {'value': 'WEREWOLF', 'label': 'Loup-Garou'}
        ],
        'classes': [
            {
                'value': 'warrior',
                'label': 'Guerrier',
                'stats': {
                    'health': 100,
                    'attack': 15,
                    'defense': 10
                }
            },
            {
                'value': 'mage',
                'label': 'Mage',
                'stats': {
                    'health': 80,
                    'attack': 20,
                    'defense': 5
                }
            }
        ]
    })
