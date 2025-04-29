import api from './api'

export const inventoryService = {
  async getItems() {
    try {
      const response = await api.get('/game/api/inventory')
      return response.data.items
    } catch (error) {
      throw error
    }
  },

  async createItem(item) {
    try {
      const response = await api.post('/game/api/inventory', item)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async updateItem(id, item) {
    try {
      const response = await api.put(`/game/api/inventory/${id}`, item)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async deleteItem(id) {
    try {
      const response = await api.delete(`/game/api/inventory/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}
