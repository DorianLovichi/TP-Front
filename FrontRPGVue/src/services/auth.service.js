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
      
      console.log('Sending registration request with:', userData)
      const response = await api.post('/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('Registration response:', response)

      // If we get a 200, return true to indicate success
      if (response.status === 200) {
        return true
      }

      return false
    } catch (error) {
      console.error('Registration error:', error)
      if (error.response) {
        console.error('Error response:', error.response)
        throw error.response.data || error
      }
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

