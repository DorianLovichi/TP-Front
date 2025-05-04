<template>
  <div class="character-container">
    <header class="header">
      <h1>Vos personnages</h1>
      <div class="header-actions">
        <button @click="showAddCharacterModal = true" class="btn btn-success">
          Créer un personnage
        </button>
        <router-link to="/inventory" class="btn btn-secondary">
          Retour à l'inventaire
        </router-link>
      </div>
    </header>

    <div v-if="notification" :class="['alert', `alert-${notification.type}`]">
      {{ notification.message }}
    </div>

    <div v-if="loading" class="loading">
      Chargement des personnages...
    </div>

    <div v-else-if="characters.length === 0" class="empty-characters">
      <p>Vous n'avez pas encore de personnage.</p>
      <button @click="showAddCharacterModal = true" class="btn btn-primary">
        Créer votre premier personnage
      </button>
    </div>

    <div v-else class="character-grid">
      <div
          v-for="character in characters"
          :key="character.id"
          :class="['character-card', { active: character.is_active }]"
      >
        <div class="character-info">
          <h3>{{ character.name }}</h3>
          <div class="character-stats">
            <p>Niveau: {{ character.level }}</p>
            <p>Santé: {{ character.health }}/100</p>
            <p>Classe: {{ character.class }}</p>
            <p>Race: {{ character.race }}</p>
            <p>Attaque: {{ character.attack }}</p>
            <p>Défense: {{ character.defense }}</p>
          </div>
        </div>
        <div class="character-actions">
          <button 
            v-if="!character.is_active" 
            @click="activateCharacter(character.id)" 
            class="btn btn-primary"
            :disabled="loading"
          >
            Sélectionner
          </button>
          <div v-else class="game-mode-buttons">
            <router-link 
              :to="{ name: 'games', query: { mode: 'quest' }}" 
              class="btn btn-secondary game-mode-btn"
            >
              <i class="fas fa-quest"></i> Mode Quête
            </router-link>
            <router-link 
              :to="{ name: 'games', query: { mode: 'plateau' }}" 
              class="btn btn-secondary game-mode-btn"
            >
              <i class="fas fa-chess"></i> Mode Plateau
            </router-link>
            <router-link 
              :to="{ name: 'games', query: { mode: 'battle' }}" 
              class="btn btn-secondary game-mode-btn"
            >
              <i class="fas fa-swords"></i> Mode Combat
            </router-link>
            <router-link 
              to="/inventory" 
              class="btn btn-secondary game-mode-btn"
            >
              <i class="fas fa-backpack"></i> Inventaire
            </router-link>
            <button 
              @click="deleteCharacter(character.id)" 
              class="btn btn-danger"
              :disabled="loading"
            >
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddCharacterModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>Créer un personnage</h3>
          <button @click="closeModals" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitCharacterForm">
            <div class="form-group">
              <label for="character-name">Nom:</label>
              <input
                  type="text"
                  id="character-name"
                  v-model="characterForm.name"
                  required
                  class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="character-class">Classe:</label>
              <select
                  id="character-class"
                  v-model="characterForm.class"
                  required
                  class="form-control"
              >
                <option value="warrior">Guerrier</option>
                <option value="mage">Mage</option>
              </select>
            </div>

            <div class="form-group">
              <label for="character-race">Race:</label>
              <select
                  id="character-race"
                  v-model="characterForm.race"
                  required
                  class="form-control"
              >
                <option value="human">Humain</option>
                <option value="elf">Elfe</option>
                <option value="dwarf">Nain</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="formLoading">
                {{ formLoading ? 'Enregistrement...' : 'Créer' }}
              </button>
              <button @click="closeModals" type="button" class="btn btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { characterService, storageService } from '../services/api'

export default {
  name: 'CharacterView',
  setup() {
    const router = useRouter()
    const characters = ref([])
    const loading = ref(true)
    const formLoading = ref(false)
    const showAddCharacterModal = ref(false)
    const notification = ref(null)
    const activeCharacterId = ref(null)

    const characterForm = ref({
      name: '',
      class: '',
      race: 'human',
      level: 1,
      health: 100
    })

    const getActiveCharacterId = () => {
      const storedId = storageService.getItem('activeCharacterId')
      if (storedId) {
        activeCharacterId.value = storedId
        console.log('Active character ID from storage:', activeCharacterId.value)
      }
    }

    const fetchCharacters = async () => {
      loading.value = true
      try {
        console.log('Starting to fetch characters...')
        const response = await characterService.getCharacters()
        console.log('Characters response:', response)
        if (response.data && response.data.characters) {
          characters.value = response.data.characters.map(char => ({
            ...char,
            is_active: char.id === activeCharacterId.value
          }))
          console.log('Updated characters array:', characters.value)
        }
      } catch (error) {
        console.error('Error fetching characters:', error)
        notification.value = { 
          message: `Erreur de chargement des personnages: ${error.response?.data?.message || error.message}`,
          type: 'danger'
        }
      } finally {
        loading.value = false
      }
    }

    const showNotification = (message, type = 'info') => {
      notification.value = { message, type }
      setTimeout(() => {
        notification.value = null
      }, 3000)
    }

    const activateCharacter = async (characterId) => {
      console.log('Attempting to activate character:', characterId)
      try {
        const response = await characterService.selectCharacter(characterId)
        console.log('Character selection response:', response)
        activeCharacterId.value = characterId
        showNotification('Personnage sélectionné', 'success')
        await fetchCharacters() // Refresh the character list to update active status
      } catch (error) {
        console.error('Error selecting character:', error)
        showNotification('Erreur de sélection du personnage', 'danger')
      }
    }

    const closeModals = () => {
      showAddCharacterModal.value = false
      characterForm.value = {
        name: '',
        class: '',
        race: 'human',
        level: 1,
        health: 100
      }
    }

    const submitCharacterForm = async () => {
      formLoading.value = true
      try {
        const characterData = {
          name: characterForm.value.name,
          class: characterForm.value.class,
          race: characterForm.value.race,
          level: characterForm.value.level,
          health: characterForm.value.health
        }
        console.log('Creating character with data:', characterData)
        const response = await characterService.createCharacter(characterData)
        console.log('Character creation response:', response)
        showNotification('Personnage créé avec succès', 'success')
        closeModals()
        await fetchCharacters()
      } catch (error) {
        console.error('Error creating character:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        showNotification(
          `Erreur lors de la création du personnage: ${error.response?.data?.message || error.message}`,
          'danger'
        )
      } finally {
        formLoading.value = false
      }
    }

    const deleteCharacter = async (characterId) => {
      console.log('Attempting to delete character:', characterId)
      try {
        const response = await characterService.deleteCharacter(characterId)
        console.log('Character deletion response:', response)
        showNotification('Personnage supprimé avec succès', 'success')
        await fetchCharacters()
      } catch (error) {
        console.error('Error deleting character:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        showNotification(
          `Erreur lors de la suppression du personnage: ${error.response?.data?.message || error.message}`,
          'danger'
        )
      }
    }

    onMounted(() => {
      getActiveCharacterId()
      fetchCharacters()
    })

    return {
      characters,
      loading,
      formLoading,
      showAddCharacterModal,
      characterForm,
      notification,
      activateCharacter,
      closeModals,
      submitCharacterForm,
      deleteCharacter
    }
  }
}
</script>

<style scoped>
.character-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.character-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  transition: all 0.3s ease;
}

.character-card.active {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.25);
  background-color: #f0fff4;
  transform: scale(1.02);
}

.character-card.active::before {
  content: '✓';
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #28a745;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.character-card.active h3 {
  color: #28a745;
  font-weight: bold;
}

.character-info {
  margin-bottom: 1rem;
  flex-grow: 1;
  position: relative;
}

.character-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  transition: color 0.3s ease;
}

.character-stats {
  color: #6c757d;
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.character-stats p {
  margin: 0.25rem 0;
}

.character-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.active-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #28a745;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

.game-mode-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.game-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.game-mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-align: center;
  width: 100%;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
  color: white;
}

.btn-danger {
  grid-column: span 2;
  margin-top: 0.5rem;
}

.btn-danger:hover {
  background-color: #dc3545;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.empty-characters {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.form-group {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.btn i {
  font-size: 1rem;
}
</style>