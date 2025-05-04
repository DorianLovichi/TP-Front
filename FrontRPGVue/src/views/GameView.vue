<template>
  <div class="game-container">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Chargement...</p>
    </div>
    <div v-else class="game-content">
      <div class="character-card">
        <h2>{{ characterName }}</h2>
        <div class="character-stats">
          <div class="stat">
            <span>Niveau:</span>
            <span>{{ character?.level || 1 }}</span>
          </div>
          <div class="stat">
            <span>Santé:</span>
            <span>{{ character?.health || 100 }}</span>
          </div>
          <div class="stat">
            <span>Attaque:</span>
            <span>{{ character?.attack || 0 }}</span>
          </div>
          <div class="stat">
            <span>Défense:</span>
            <span>{{ character?.defense || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Quest Mode -->
      <div v-if="gameMode === 'quest'" class="quest-mode">
        <div v-if="!gameResult" class="start-game">
          <div v-if="availableQuests.length > 0" class="quest-selection">
            <h3>Choisissez une quête</h3>
            <div class="quest-list">
              <div v-for="quest in availableQuests" :key="quest.id" class="quest-card">
                <div class="quest-header">
                  <h4>{{ quest.name }}</h4>
                  <div class="quest-meta">
                    <span class="quest-difficulty" :class="quest.difficulty">
                      {{ quest.difficulty }}
                    </span>
                    <span class="quest-level">Niveau {{ quest.recommended_level }}</span>
                  </div>
                </div>
                <p class="quest-description">{{ quest.description }}</p>
                <div class="quest-rewards">
                  <span class="reward-label">Récompense:</span>
                  <div class="reward-details">
                    <span class="reward-item">{{ quest.reward }}</span>
                  </div>
                </div>
                <button 
                  @click="startQuest(quest.id)" 
                  class="play-button" 
                  :disabled="loading"
                >
                  Démarrer la quête
                </button>
              </div>
            </div>
          </div>
          <div v-else class="no-quests">
            <p>Aucune quête disponible pour le moment.</p>
          </div>
        </div>
        <div v-else class="quest-result">
          <div class="battle-header">
            <h3>Résultat de la quête</h3>
            <div class="victory-banner" :class="{ 'victory': gameResult.won, 'defeat': !gameResult.won }">
              <span class="trophy">🏆</span>
              <span class="winner-text">
                {{ gameResult.won ? 'Victoire!' : 'Défaite...' }}
              </span>
            </div>
          </div>
          <div class="battle-log">
            <h4>Déroulement de la quête</h4>
            <div class="log-entries">
              <div v-for="(event, index) in gameResult.battle_log" :key="index" class="log-entry">
                <span class="log-icon">⚔️</span>
                <span class="log-text">{{ event }}</span>
              </div>
            </div>
          </div>
          <div v-if="gameResult.rewards" class="rewards-section">
            <h4>Récompenses obtenues</h4>
            <div class="rewards-details">
              <div class="reward-item">
                <span class="reward-label">Expérience:</span>
                <span class="reward-value">+{{ gameResult.rewards.experience }} XP</span>
              </div>
              <div v-if="gameResult.rewards.items.length > 0" class="reward-item">
                <span class="reward-label">Objets:</span>
                <ul class="items-list">
                  <li v-for="(item, index) in gameResult.rewards.items" :key="index" class="item-card">
                    <div class="item-header">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-type" :class="item.type">{{ item.type }}</span>
                    </div>
                    <div class="item-quantity">
                      <span class="quantity-label">Quantité:</span>
                      <span class="quantity-value">{{ item.quantity }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <button @click="resetQuest" class="play-button">
            Nouvelle quête
          </button>
        </div>
      </div>

      <!-- Battle Mode -->
      <div v-else-if="gameMode === 'battle'" class="battle-mode">
        <div v-if="!gameResult" class="start-game">
          <div class="character-selection">
            <div class="selection-group">
              <label for="player1">Joueur 1:</label>
              <select id="player1" v-model="selectedPlayer1" class="character-select">
                <option value="">Sélectionner un personnage</option>
                <option v-for="char in availableCharacters" :key="char.id" :value="char.id">
                  {{ char.name }} (Niveau {{ char.level }})
                </option>
              </select>
            </div>
            <div class="selection-group">
              <label for="player2">Joueur 2:</label>
              <select id="player2" v-model="selectedPlayer2" class="character-select">
                <option value="">Sélectionner un personnage</option>
                <option v-for="char in availableCharacters" :key="char.id" :value="char.id">
                  {{ char.name }} (Niveau {{ char.level }})
                </option>
              </select>
            </div>
          </div>
          <button 
            @click="startBattle" 
            class="play-button" 
            :disabled="loading || !selectedPlayer1 || !selectedPlayer2"
          >
            Démarrer le combat
          </button>
        </div>
        <div v-else class="battle-result">
          <div class="battle-header">
            <h3>Résultat du combat</h3>
            <div class="victory-banner" :class="{ 'victory': gameResult.won, 'defeat': !gameResult.won }">
              <span class="trophy">🏆</span>
              <span class="winner-text">
                {{ gameResult.won ? gameResult.players.player1.name : gameResult.players.player2.name }} remporte le combat!
              </span>
            </div>
          </div>
          <div class="result-details">
            <div class="battle-summary">
              <div class="player-stats">
                <div class="player-stat" :class="{ 'winner': gameResult.won }">
                  <div class="player-header">
                    <h5>{{ gameResult.players.player1.name }}</h5>
                    <span v-if="gameResult.won" class="winner-badge">Vainqueur</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Santé:</span>
                    <span class="stat-value">{{ gameResult.players.player1.health }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Attaque:</span>
                    <span class="stat-value">{{ gameResult.players.player1.attack }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Défense:</span>
                    <span class="stat-value">{{ gameResult.players.player1.defense }}</span>
                  </div>
                </div>
                <div class="vs-separator">
                  <span>VS</span>
                </div>
                <div class="player-stat" :class="{ 'winner': !gameResult.won }">
                  <div class="player-header">
                    <h5>{{ gameResult.players.player2.name }}</h5>
                    <span v-if="!gameResult.won" class="winner-badge">Vainqueur</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Santé:</span>
                    <span class="stat-value">{{ gameResult.players.player2.health }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Attaque:</span>
                    <span class="stat-value">{{ gameResult.players.player2.attack }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Défense:</span>
                    <span class="stat-value">{{ gameResult.players.player2.defense }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="battle-log">
              <h4>Déroulement du combat</h4>
              <div class="log-entries">
                <div v-for="(event, index) in gameResult.battle_log" :key="index" class="log-entry">
                  <span class="log-icon">⚔️</span>
                  <span class="log-text">{{ event }}</span>
                </div>
              </div>
            </div>
          </div>
          <button @click="resetBattle" class="play-button">
            Nouveau combat
          </button>
        </div>
      </div>

      <!-- Tabletop Mode -->
      <div v-else class="tabletop-mode">
        <div v-if="!gameResult" class="start-game">
          <button @click="startPlateauGame" class="play-button" :disabled="loading">
            Jouer au mode plateau
          </button>
        </div>
        <div v-else class="game-result">
          <h3>Résultat de la partie</h3>
          <div class="result-details">
            <div class="result-stat">
              <span class="label">Position finale:</span>
              <span class="value">{{ gameResult.final_position }}</span>
            </div>
          </div>

          <div class="game-turns">
            <h4>Déroulement de la partie</h4>
            <div class="turns-list">
              <div v-for="(turn, index) in gameResult.turns" :key="index" class="turn">
                <div class="turn-header">
                  <span class="turn-number">Tour {{ index + 1 }}</span>
                  <span class="dice-roll">Dé: {{ turn.dice_roll }}</span>
                  <span class="position">Position: {{ turn.position }}</span>
                </div>
                
                <div class="events">
                  <div v-for="(event, eventIndex) in turn.events" :key="eventIndex" class="event">
                    <div v-if="event.type === 'empty'" class="event-empty">
                      <span class="event-icon">🌫️</span>
                      <span class="event-text">Case vide</span>
                    </div>
                    
                    <div v-else-if="event.type === 'item'" class="event-item">
                      <span class="event-icon">🎁</span>
                      <span class="event-text">Trouvé: {{ event.item }}</span>
                    </div>
                    
                    <div v-else-if="event.type === 'enemy'" class="event-enemy">
                      <span class="event-icon">👹</span>
                      <span class="event-text">Rencontre: {{ event.enemy }}</span>
                    </div>
                    
                    <div v-else-if="event.type === 'battle'" class="event-battle">
                      <div class="battle-header">
                        <span class="event-icon">⚔️</span>
                        <span class="event-text">Combat contre {{ event.battle_data.enemy }}</span>
                      </div>
                      <div class="battle-rounds">
                        <div v-for="(round, roundIndex) in event.battle_data.rounds" :key="roundIndex" class="battle-round">
                          <div class="round-header">Round {{ round.round }}</div>
                          <div class="round-stats">
                            <span>Héros: {{ round.hero_health }} PV</span>
                            <span>Monstre: {{ round.monster_health }} PV</span>
                          </div>
                          <div class="round-actions">
                            <div v-for="(action, actionIndex) in round.actions" :key="actionIndex" class="action">
                              <span class="attacker">{{ action.attacker }}</span>
                              <span class="action-text">inflige {{ action.damage }} dégâts à</span>
                              <span class="target">{{ action.target }}</span>
                              <span class="remaining">({{ action.remaining_health }} PV restants)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="battle-winner">
                        Vainqueur: {{ event.battle_data.winner }}
                      </div>
                    </div>

                    <div v-else-if="event.type === 'victory'" class="event-victory">
                      <span class="event-icon">🏆</span>
                      <span class="event-text">{{ event.message }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button @click="startPlateauGame" class="play-button">
            Rejouer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { characterService } from '../services/api'
import api from '../services/api'

export default {
  name: 'GameView',
  setup() {
    const route = useRoute()
    const loading = ref(true)
    const characterName = ref('')
    const character = ref(null)
    const notification = ref(null)
    const gameResult = ref(null)
    const availableCharacters = ref([])
    const availableQuests = ref([])
    const selectedPlayer1 = ref('')
    const selectedPlayer2 = ref('')
    const selectedQuest = ref(null)

    const gameMode = computed(() => route.query.mode || 'plateau')

    const showNotification = (message, type = 'info') => {
      notification.value = { message, type }
      setTimeout(() => {
        notification.value = null
      }, 3000)
    }

    const fetchCharacterInfo = async () => {
      try {
        const response = await characterService.getActiveCharacter()
        if (response && response.data) {
          characterName.value = response.data.name
          character.value = response.data
        }
      } catch (error) {
        console.error('Error fetching character info:', error)
        showNotification('Erreur lors du chargement du personnage', 'danger')
      }
    }

    const fetchAvailableCharacters = async () => {
      try {
        const response = await api.get('/game/api/characters/battle')
        availableCharacters.value = response.data.characters
        console.log('Available characters:', availableCharacters.value)
      } catch (error) {
        console.error('Error fetching available characters:', error)
        showNotification('Erreur lors du chargement des personnages', 'danger')
      }
    }

    const fetchAvailableQuests = async () => {
      try {
        const response = await api.get('/game/api/quests')
        availableQuests.value = response.data.quests
        console.log('Available quests:', availableQuests.value)
      } catch (error) {
        console.error('Error fetching available quests:', error)
        showNotification('Erreur lors du chargement des quêtes', 'danger')
      }
    }

    const resetBattle = () => {
      gameResult.value = null
      selectedPlayer1.value = ''
      selectedPlayer2.value = ''
    }

    const resetQuest = () => {
      gameResult.value = null
      selectedQuest.value = null
    }

    const startQuest = async (questId) => {
      loading.value = true
      try {
        const characterResponse = await characterService.getActiveCharacter()
        if (!characterResponse?.data?.id) {
          throw new Error('No active character found')
        }
        
        const response = await api.post(`/game/api/quests/${questId}/start`, {
          character_id: characterResponse.data.id
        })
        gameResult.value = response.data
        showNotification('Quête terminée!', 'success')
      } catch (error) {
        console.error('Error starting quest:', error)
        showNotification(
          `Erreur lors de la quête: ${error.response?.data?.message || error.message}`,
          'danger'
        )
      } finally {
        loading.value = false
      }
    }

    const startBattle = async () => {
      if (!selectedPlayer1.value || !selectedPlayer2.value) {
        showNotification('Veuillez sélectionner deux personnages', 'warning')
        return
      }

      loading.value = true
      try {
        const response = await api.post('/game/api/battle', {
          player1_id: selectedPlayer1.value,
          player2_id: selectedPlayer2.value
        })
        gameResult.value = response.data
        showNotification('Combat terminé!', 'success')
      } catch (error) {
        console.error('Error starting battle:', error)
        showNotification(
          `Erreur lors du combat: ${error.response?.data?.message || error.message}`,
          'danger'
        )
      } finally {
        loading.value = false
      }
    }

    const startPlateauGame = async () => {
      loading.value = true
      try {
        const characterResponse = await characterService.getActiveCharacter()
        if (!characterResponse?.data?.id) {
          throw new Error('No active character found')
        }
        
        const response = await characterService.playPlateauGame(characterResponse.data.id)
        gameResult.value = response.data
        showNotification('Partie terminée!', 'success')
      } catch (error) {
        console.error('Error starting plateau game:', error)
        showNotification(
          `Erreur lors de la partie: ${error.response?.data?.message || error.message}`,
          'danger'
        )
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await fetchCharacterInfo()
      if (gameMode.value === 'battle') {
        await fetchAvailableCharacters()
      } else if (gameMode.value === 'quest') {
        await fetchAvailableQuests()
      }
      loading.value = false
    })

    return {
      loading,
      characterName,
      character,
      notification,
      gameResult,
      gameMode,
      availableCharacters,
      availableQuests,
      selectedPlayer1,
      selectedPlayer2,
      selectedQuest,
      startQuest,
      startBattle,
      resetBattle,
      resetQuest,
      startPlateauGame
    }
  }
}
</script>

<style scoped>
.game-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.game-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.character-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.character-card h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.character-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat span:first-child {
  color: #6c757d;
  font-size: 0.9rem;
}

.stat span:last-child {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
}

.character-selection {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 400px;
}

.selection-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selection-group label {
  color: #2c3e50;
  font-weight: bold;
}

.character-select {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.character-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.25);
}

.battle-header {
  text-align: center;
  margin-bottom: 2rem;
}

.victory-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1rem 0;
  font-size: 1.3rem;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.victory-banner.victory {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.victory-banner.defeat {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.trophy {
  font-size: 1.8rem;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.battle-summary {
  margin-bottom: 2rem;
}

.player-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 1rem;
}

.player-stat {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  min-width: 250px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.player-stat.winner {
  transform: scale(1.05);
  border: 2px solid #4CAF50;
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.2);
}

.player-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.player-header h5 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
}

.winner-badge {
  background: #4CAF50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.vs-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f8f9fa;
  border-radius: 50%;
  font-weight: bold;
  color: #6c757d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: rotate 2s infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  100% { transform: rotate(360deg); }
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.stat-row:hover {
  background: #e9ecef;
}

.stat-label {
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  color: #2c3e50;
  font-weight: bold;
}

.battle-log {
  margin-top: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.battle-log h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1.2rem;
}

.log-entries {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  color: #495057;
  transition: all 0.3s ease;
}

.log-entry:hover {
  background-color: #e9ecef;
  transform: translateX(5px);
}

.log-icon {
  font-size: 1.2rem;
}

.log-text {
  flex: 1;
}

.log-entry:last-child {
  border-bottom: none;
}

.play-button {
  margin-top: 2rem;
  background: #3498db;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.play-button:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.play-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.quest-selection {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

.quest-selection h3 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.quest-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.quest-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  min-width: 300px;
  flex: 1;
}

.quest-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quest-header h4 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
}

.quest-level {
  background: #e9ecef;
  color: #6c757d;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: bold;
}

.quest-description {
  color: #495057;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.quest-rewards {
  margin-bottom: 1.5rem;
}

.reward-label {
  display: block;
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.reward-details {
  display: flex;
  gap: 1rem;
}

.exp-reward {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: bold;
}

.items-reward {
  background: #f3e5f5;
  color: #7b1fa2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: bold;
}

.no-quests {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.rewards-section {
  margin-top: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.rewards-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.rewards-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reward-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reward-label {
  color: #6c757d;
  font-weight: 500;
}

.reward-value {
  color: #2c3e50;
  font-weight: bold;
}

.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.item-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.item-name {
  font-weight: bold;
  color: #2c3e50;
}

.item-type {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: capitalize;
}

.item-type.armure {
  background: #e3f2fd;
  color: #1976d2;
}

.item-type.arme {
  background: #ffebee;
  color: #c62828;
}

.item-type.consumable {
  background: #e8f5e9;
  color: #2e7d32;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.quantity-label {
  color: #6c757d;
}

.quantity-value {
  font-weight: bold;
  color: #2c3e50;
}

.quest-meta {
  display: flex;
  gap: 0.5rem;
}

.quest-difficulty {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: capitalize;
}

.quest-difficulty.easy {
  background: #e8f5e9;
  color: #2e7d32;
}

.quest-difficulty.medium {
  background: #fff3e0;
  color: #e65100;
}

.quest-difficulty.hard {
  background: #ffebee;
  color: #c62828;
}

.reward-item {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: bold;
}
</style> 