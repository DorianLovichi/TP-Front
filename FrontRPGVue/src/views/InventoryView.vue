<template>
  <div class="inventory-container">
    <header class="header">
      <h1>Inventaire</h1>
      <div class="header-actions">
        <button @click="showCreateItemModal = true" class="btn btn-primary">
          Ajouter un item
        </button>
        <router-link to="/characters" class="btn btn-secondary">
          Retour aux personnages
        </router-link>
      </div>
    </header>

    <div v-if="notification" :class="['alert', `alert-${notification.type}`]">
      {{ notification.message }}
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement de l'inventaire...</p>
    </div>

    <div v-else-if="!characterName" class="no-character">
      <p>Aucun personnage sélectionné.</p>
      <router-link to="/characters" class="btn btn-primary">
        Sélectionner un personnage
      </router-link>
    </div>

    <div v-else class="inventory-content">
      <h2>Inventaire de {{ characterName }}</h2>
      
      <div v-if="items.length === 0" class="empty-inventory">
        <p>Votre inventaire est vide.</p>
      </div>

      <div v-else class="items-grid">
        <div v-for="item in items" :key="item.id" class="item-card">
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-type">Type: {{ item.type }}</p>
            <p class="item-quantity">Quantité: {{ item.quantity }}</p>
            <div class="item-actions">
              <button 
                v-if="item.quantity > 0 && (item.type === 'plant' || item.type === 'potion')" 
                @click="consumeItem(item.id)" 
                class="btn btn-primary"
              >
                Consommer
              </button>
              <button 
                @click="deleteItem(item.id)" 
                class="btn btn-danger"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour créer un nouvel item -->
    <div v-if="showCreateItemModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Ajouter un nouvel item</h2>
        <form @submit.prevent="createItem" class="create-item-form">
          <div class="form-group">
            <label for="name">Nom de l'item</label>
            <input
              id="name"
              v-model="newItem.name"
              type="text"
              required
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label for="type">Type</label>
            <select
              id="type"
              v-model="newItem.type_id"
              required
              class="form-control"
            >
              <option v-for="type in itemTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="quantity">Quantité</label>
            <input
              id="quantity"
              v-model.number="newItem.quantity"
              type="number"
              min="1"
              required
              class="form-control"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateItemModal = false" class="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { characterService } from '../services/api'
import { useStore } from 'vuex'

export default {
  name: 'InventoryView',
  setup() {
    const store = useStore()
    const loading = ref(true)
    const characterName = ref('')
    const items = ref([])
    const notification = ref(null)
    const showCreateItemModal = ref(false)
    const itemTypes = ref([])
    const newItem = ref({
      name: '',
      type_id: '',
      quantity: 1,
      character_id: null
    })

    const showNotification = (message, type = 'info') => {
      console.log('Showing notification:', { message, type })
      notification.value = { message, type }
      setTimeout(() => {
        notification.value = null
      }, 3000)
    }

    const fetchItemTypes = async () => {
      try {
        console.log('Fetching item types...')
        const response = await characterService.getItemTypes()
        console.log('Item types response:', response)
        itemTypes.value = response.data.item_types
        if (itemTypes.value.length > 0) {
          newItem.value.type_id = itemTypes.value[0].id
        }
      } catch (error) {
        console.error('Error fetching item types:', error)
        showNotification(
          `Erreur de chargement des types d'items: ${error.response?.data?.message || error.message}`,
          'danger'
        )
      }
    }

    const fetchInventory = async () => {
      loading.value = true
      try {
        console.log('Fetching inventory...')
        const response = await characterService.getInventory()
        console.log('Inventory response:', response)
        characterName.value = response.data.character_name
        items.value = response.data.items
        newItem.value.character_id = response.data.character_id
        console.log('Updated inventory:', { characterName: characterName.value, items: items.value })
      } catch (error) {
        console.error('Error fetching inventory:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        showNotification(
          `Erreur de chargement de l'inventaire: ${error.response?.data?.message || error.message}`,
          'danger'
        )
      } finally {
        loading.value = false
      }
    }

    const createItem = async () => {
      loading.value = true
      try {
        console.log('Creating new item:', newItem.value)
        await characterService.createItem(newItem.value)
        console.log('Item created successfully')
        
        // Refresh the entire inventory instead of manually adding the item
        await fetchInventory()
        
        showNotification('Item créé avec succès', 'success')
        showCreateItemModal.value = false
        // Reset form
        newItem.value = {
          name: '',
          type_id: itemTypes.value.length > 0 ? itemTypes.value[0].id : '',
          quantity: 1,
          character_id: newItem.value.character_id
        }
      } catch (error) {
        console.error('Error creating item:', error)
        showNotification(
          `Erreur lors de la création de l'item: ${error.response?.data?.message || error.message}`,
          'danger'
        )
      } finally {
        loading.value = false
      }
    }

    const consumeItem = async (itemId) => {
      try {
        await store.dispatch('inventory/consumeItem', itemId)
        await fetchInventory() // Refresh the items list
      } catch (err) {
        showNotification(err.message, 'danger')
      }
    }

    const deleteItem = async (itemId) => {
      try {
        await store.dispatch('inventory/deleteItem', itemId)
        await fetchInventory() // Refresh the inventory after successful deletion
        showNotification('Item supprimé avec succès', 'success')
      } catch (err) {
        showNotification(err.message, 'danger')
      }
    }

    onMounted(() => {
      fetchItemTypes()
      fetchInventory()
    })

    return {
      loading,
      characterName,
      items,
      notification,
      showCreateItemModal,
      newItem,
      itemTypes,
      createItem,
      consumeItem,
      deleteItem
    }
  }
}
</script>

<style scoped>
.inventory-container {
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

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.item-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #f8f9fa;
}

.item-info {
  margin-bottom: 1rem;
}

.item-type {
  color: #6c757d;
  margin-top: 0.5rem;
}

.item-quantity {
  color: #6c757d;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
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

.empty-inventory {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 2rem;
}

.no-character {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.loading {
  text-align: center;
  padding: 2rem;
}

/* Modal styles */
.modal-overlay {
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

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.create-item-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.item-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>