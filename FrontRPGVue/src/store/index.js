import { createStore } from 'vuex'
import auth from './auth'
import inventory from './inventory'

const store = createStore({
  modules: {
    auth,
    inventory
  }
})

export default store 