# Game Inventory API Documentation

This API provides endpoints for managing inventory items and game characters. All endpoints require authentication using Flask-Login.

## Authentication

The API uses Flask-Login for authentication. You need to be logged in to access the API endpoints.

## Inventory Management

### Get Inventory
```http
GET /api/inventory
```

Response:
```json
{
    "items": [
        {
            "id": 1,
            "name": "Health Potion",
            "type": "potion",
            "quantity": 5
        }
    ]
}
```

### Add Item
```http
POST /api/inventory
Content-Type: application/json

{
    "name": "Health Potion",
    "type_id": 1,
    "quantity": 5
}
```

Response:
```json
{
    "message": "Item added successfully",
    "item": {
        "id": 1,
        "name": "Health Potion",
        "type": "potion",
        "quantity": 5
    }
}
```

### Update Item
```http
PUT /api/inventory/{item_id}
Content-Type: application/json

{
    "name": "Super Health Potion",
    "quantity": 10
}
```

Response:
```json
{
    "message": "Item updated successfully",
    "item": {
        "id": 1,
        "name": "Super Health Potion",
        "type": "potion",
        "quantity": 10
    }
}
```

### Delete Item
```http
DELETE /api/inventory/{item_id}
```

Response:
```json
{
    "message": "Item deleted successfully"
}
```

### Consume Item
```http
POST /api/inventory/{item_id}/consume
```

Response:
```json
{
    "message": "Item consumed successfully"
}
```

## Character Management

### Get Characters
```http
GET /game/api/characters
```

Response:
```json
{
    "characters": [
        {
            "id": 1,
            "name": "Hero",
            "race": "human",
            "class": "warrior",
            "health": 100,
            "attack": 15,
            "defense": 10,
            "is_active": true
        }
    ]
}
```

### Create Character
```http
POST /game/api/characters
Content-Type: application/json

{
    "name": "Hero",
    "race": "human",
    "class": "warrior"
}
```

Response:
```json
{
    "message": "Character created successfully",
    "character": {
        "id": 1,
        "name": "Hero",
        "race": "human",
        "class": "warrior",
        "health": 100,
        "attack": 15,
        "defense": 10
    }
}
```

### Select Character
```http
PUT /game/api/characters/{character_id}
```

Response:
```json
{
    "message": "Character selected successfully",
    "character": {
        "id": 1,
        "name": "Hero",
        "race": "human",
        "class": "warrior",
        "health": 100,
        "attack": 15,
        "defense": 10
    }
}
```

## Quest Management

### Get Quests
```http
GET /game/api/quests
```

Response:
```json
{
    "quests": [
        {
            "id": 1,
            "name": "Dragon Hunt",
            "description": "Defeat the dragon",
            "difficulty": "hard",
            "reward": "Dragon Scale"
        }
    ]
}
```

### Start Quest
```http
POST /game/api/quests/{quest_id}
```

Response:
```json
{
    "winner": "hero",
    "battle_log": [
        "Hero attacks Dragon for 15 damage",
        "Dragon attacks Hero for 10 damage",
        "Hero attacks Dragon for 15 damage",
        "Dragon is defeated!"
    ]
}
```

## Combat

### Fight
```http
POST /game/api/fight
Content-Type: application/json

{
    "opponent_id": 2
}
```

Response:
```json
{
    "winner": "player",
    "battle_log": [
        "Player attacks Opponent for 15 damage",
        "Opponent attacks Player for 10 damage",
        "Player attacks Opponent for 15 damage",
        "Opponent is defeated!"
    ]
}
```

## Error Responses

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

Error response format:
```json
{
    "error": "Error description"
}
``` 