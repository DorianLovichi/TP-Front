import { authService } from '../services/auth.service'

export default {
    namespaced: true,
    state: {
        user: null
    },
    getters: {
        isAuthenticated: state => !!state.user,
        currentUser: state => state.user
    },
    mutations: {
        SET_USER(state, user) {
            state.user = user
        },
        CLEAR_AUTH(state) {
            state.user = null
        }
    },
    actions: {
        async login({ commit }, credentials) {
            try {
                const response = await authService.login(credentials)
                commit('SET_USER', response)
                return true
            } catch (error) {
                console.error('Login error:', error)
                return false
            }
        },
        async register({ commit }, userData) {
            try {
                const response = await authService.register(userData)
                console.log('Store register response:', response)
                if (response === true) {
                    commit('SET_USER', userData)
                    return true
                }
                return false
            } catch (error) {
                console.error('Register error:', error)
                return false
            }
        },
        logout({ commit }) {
            authService.logout()
            commit('CLEAR_AUTH')
        },
        initializeAuth({ commit }) {
            const user = authService.getCurrentUser()
            if (user) {
                commit('SET_USER', user)
            }
        }
    }
}