import api from './api'

export const authService = {
  async login(credentials) {
    try {
      const formData = new FormData()
      formData.append('email', credentials.email)
      formData.append('password', credentials.password)
      
      const response = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(response.data))
        
        // Get the session cookie from the response
        const cookies = document.cookie.split(';')
        const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='))
        if (sessionCookie) {
          localStorage.setItem('session', sessionCookie.split('=')[1])
        }
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  async register(userData) {
    try {
      const formData = new FormData()
      formData.append('email', userData.email)
      formData.append('username', userData.username)
      formData.append('password', userData.password)
      formData.append('recheck_password', userData.password)
      
      const response = await api.post('/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async logout() {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('user')
      localStorage.removeItem('session')
    }
  },

  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  getSession() {
    return localStorage.getItem('session')
  },

  isAuthenticated() {
    return !!this.getSession() && !!this.getCurrentUser()
  },

  async getUserProfile() {
    try {
      const response = await api.get('/game/user')
      return response.data
    } catch (error) {
      throw error
    }
  }
}
