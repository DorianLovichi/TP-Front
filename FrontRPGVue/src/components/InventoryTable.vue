<template>
  <div class="inventory-table">
    <div class="table-actions">
      <button class="btn btn-primary" @click="$emit('add')">
        Ajouter un item
      </button>
    </div>

    <table v-if="items.length > 0">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Description</th>
          <th>Type</th>
          <th>Quantité</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.description }}</td>
          <td>{{ getTypeLabel(item.type) }}</td>
          <td>{{ item.quantity }}</td>
          <td class="actions">
            <button class="btn btn-sm btn-primary" @click="$emit('edit', item)">
              Modifier
            </button>
            <button class="btn btn-sm btn-danger" @click="$emit('delete', item)">
              Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="no-items">
      Aucun item dans l'inventaire
    </div>
  </div>
</template>

<script>
export default {
  name: 'InventoryTable',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  emits: ['add', 'edit', 'delete'],
  setup() {
    const getTypeLabel = (type) => {
      const types = {
        weapon: 'Arme',
        armor: 'Armure',
        potion: 'Potion',
        misc: 'Divers'
      }
      return types[type] || type
    }

    return {
      getTypeLabel
    }
  }
}
</script>

<style scoped>
.inventory-table {
  width: 100%;
  margin-top: 1rem;
}

.table-actions {
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.actions {
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

.no-items {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>
