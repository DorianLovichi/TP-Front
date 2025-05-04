import { characterService } from '../services/api'

export default {
    namespaced: true,
    state: {
        items: [],
        loading: false,
        error: null
    },
    getters: {
        getItems: state => state.items,
        getItemById: state => id => state.items.find(item => item.id === id),
        isLoading: state => state.loading,
        getError: state => state.error
    },
    mutations: {
        SET_ITEMS(state, items) {
            state.items = items
        },
        ADD_ITEM(state, item) {
            state.items.push(item)
        },
        UPDATE_ITEM(state, updatedItem) {
            const index = state.items.findIndex(item => item.id === updatedItem.id)
            if (index !== -1) {
                state.items.splice(index, 1, updatedItem)
            }
        },
        REMOVE_ITEM(state, itemId) {
            state.items = state.items.filter(item => item.id !== itemId)
        },
        SET_LOADING(state, loading) {
            state.loading = loading
        },
        SET_ERROR(state, error) {
            state.error = error
        }
    },
    actions: {
        async fetchItems({ commit }) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            try {
                console.log('Fetching inventory items...')
                const items = await characterService.getInventory()
                console.log('Fetched items:', items)
                commit('SET_ITEMS', items)
            } catch (error) {
                console.error('Error fetching items:', error)
                commit('SET_ERROR', 'Erreur lors du chargement des items')
            } finally {
                commit('SET_LOADING', false)
            }
        },
        async createItem({ commit }, item) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            try {
                console.log('Creating item:', item)
                const newItem = await characterService.createItem(item)
                console.log('Created item:', newItem)
                commit('ADD_ITEM', newItem)
                return newItem
            } catch (error) {
                console.error('Error creating item:', error)
                commit('SET_ERROR', 'Erreur lors de la création de l\'item')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },
        async updateItem({ commit }, { id, item }) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            try {
                console.log('Updating item:', { id, item })
                const updatedItem = await characterService.updateItem(id, item)
                console.log('Updated item:', updatedItem)
                commit('UPDATE_ITEM', updatedItem)
                return updatedItem
            } catch (error) {
                console.error('Error updating item:', error)
                commit('SET_ERROR', 'Erreur lors de la modification de l\'item')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },
        async deleteItem({ commit }, id) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            try {
                console.log('Deleting item:', id)
                const response = await characterService.deleteItem(id)
                console.log('Item deleted successfully')
                commit('REMOVE_ITEM', id)
                return response
            } catch (error) {
                console.error('Error deleting item:', error)
                commit('SET_ERROR', 'Erreur lors de la suppression de l\'item')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },
        async consumeItem({ commit }, id) {
            commit('SET_LOADING', true)
            commit('SET_ERROR', null)
            try {
                console.log('Consuming item:', id)
                await characterService.consumeItem(id)
                console.log('Item consumed successfully')
                commit('REMOVE_ITEM', id)
            } catch (error) {
                console.error('Error consuming item:', error)
                commit('SET_ERROR', 'Erreur lors de la consommation de l\'item')
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        }
    }
}