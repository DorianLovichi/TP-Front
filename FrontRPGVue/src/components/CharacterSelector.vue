<template>
  <div class="character-selector">
    <div class="selector-header">
      <h2>Personnages</h2>
      <button class="btn btn-primary" @click="$emit('create')">
        Créer un personnage
      </button>
    </div>

    <div class="characters-grid" v-if="characters.length > 0">
      <div
        v-for="character in characters"
        :key="character.id"
        class="character-card"
        :class="{ active: selectedCharacter?.id === character.id }"
        @click="$emit('select', character)"
      >
        <div class="character-info">
          <h3>{{ character.name }}</h3>
          <p class="class">{{ character.class }}</p>
          <div class="stats">
            <div class="stat">
              <span class="label">Niveau:</span>
              <span class="value">{{ character.level }}</span>
            </div>
            <div class="stat">
              <span class="label">PV:</span>
              <span class="value">{{ character.hp }}/{{ character.maxHp }}</span>
            </div>
          </div>
        </div>
        <div class="character-actions">
          <button class="btn btn-sm btn-primary" @click.stop="$emit('edit', character)">
            Modifier
          </button>
          <button class="btn btn-sm btn-danger" @click.stop="$emit('delete', character)">
            Supprimer
          </button>
        </div>
      </div>
    </div>
    <div v-else class="no-characters">
      Aucun personnage créé
    </div>
  </div>
</template>

<script>
export default {
  name: 'CharacterSelector',
  props: {
    characters: {
      type: Array,
      required: true
    },
    selectedCharacter: {
      type: Object,
      default: null
    }
  },
  emits: ['select', 'create', 'edit', 'delete']
}
</script>

<style scoped>
.character-selector {
  padding: 1rem;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.character-card {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.character-card.active {
  border: 2px solid #4CAF50;
}

.character-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.class {
  color: #666;
  margin: 0 0 1rem 0;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.875rem;
  color: #666;
}

.value {
  font-weight: 600;
  color: #333;
}

.character-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.no-characters {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>
