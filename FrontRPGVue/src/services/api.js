// services/api.js
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // This is important for cookies
})

// Request interceptor
api.interceptors.request.use(config => {
    console.log('Making API request:', {
        method: config.method,
        url: config.url,
        data: config.data,
        headers: config.headers
    })
    const session = localStorage.getItem('session')
    if (session) {
        config.headers.Cookie = `session=${session}`
    }
    return config
})

// Response interceptor
api.interceptors.response.use(
    response => {
        console.log('API response:', {
            status: response.status,
            data: response.data,
            url: response.config.url
        })
        return response
    },
    error => {
        console.error('API error:', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
            message: error.message
        })
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('user')
            localStorage.removeItem('session')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Local storage service
export const storageService = {
    setItem: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    getItem: (key) => {
        const item = localStorage.getItem(key);
        try {
            return item ? JSON.parse(item) : null;
        } catch (e) {
            return null;
        }
    },
    removeItem: (key) => {
        localStorage.removeItem(key);
    }
};

// Character services
export const characterService = {
    getCharacters: () => {
        console.log('Fetching characters...')
        return api.get('/game/characters')
    },
    getActiveCharacter: () => {
        console.log('Getting active character...')
        return api.get('/game/characters/active')
            .then(response => {
                console.log('Active character response:', response)
                if (response.data) {
                    // Store the character in localStorage
                    storageService.setItem('activeCharacter', response.data)
                }
                return response
            })
            .catch(error => {
                console.error('Error getting active character:', error)
                // Fallback to localStorage if API fails
                const activeCharacter = storageService.getItem('activeCharacter')
                if (activeCharacter) {
                    return Promise.resolve({ data: activeCharacter })
                }
                return Promise.reject(error)
            })
    },
    createCharacter: (characterData) => {
        console.log('Creating character with data:', characterData)
        const formData = new FormData()
        formData.append('name', characterData.name)
        formData.append('race', characterData.race)
        formData.append('class', characterData.class)
        return api.post('/game/create_character', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    selectCharacter: (characterId) => {
        console.log('Selecting character:', characterId)
        return api.post(`/game/select_character/${characterId}`)
            .then(response => {
                console.log('Character selection response:', response.data);
                // Store the character ID in localStorage
                storageService.setItem('activeCharacterId', characterId);
                return response;
            });
    },
    deleteCharacter: (characterId) => {
        console.log('Deleting character:', characterId)
        return api.delete(`/game/api/characters/${characterId}`)
            .then(response => {
                // If the deleted character was active, remove it from storage
                const activeCharacter = storageService.getItem('activeCharacter');
                if (activeCharacter && activeCharacter.id === characterId) {
                    storageService.removeItem('activeCharacter');
                }
                return response;
            });
    },
    getInventory: () => {
        console.log('Fetching inventory...')
        return api.get('/game/inventory')
    },
    getItemTypes: () => {
        console.log('Fetching item types...')
        return api.get('/game/item-types')
    },
    createItem: (itemData) => {
        console.log('Creating item with data:', itemData)
        return api.post('/add_item', {
            name: itemData.name,
            type_id: itemData.type_id,
            quantity: itemData.quantity
        })
    },
    consumeItem: (itemId) => {
        console.log('Consuming item:', itemId)
        return api.post(`/game/inventory/${itemId}/consume`)
    },
    deleteItem: (itemId) => {
        console.log('Deleting item:', itemId)
        return api.delete(`/game/inventory/${itemId}`)
    },
    // Quest mode endpoints
    getQuests: () => {
        console.log('Fetching available quests...')
        return api.get('/game/api/quests')
    },
    startQuest: (questId) => {
        console.log('Starting quest:', questId)
        return api.post(`/game/api/quests/${questId}/start`)
    },
    // Plateau mode endpoints
    playPlateauGame: (characterId) => {
        console.log('Playing plateau game with character:', characterId)
        return api.get(`/game/api/plateau/play/${characterId}`)
    },
    startBattle: (data) => {
        console.log('Starting battle with data:', data)
        return api.post('/game/api/battle', data)
    }
}

export default api