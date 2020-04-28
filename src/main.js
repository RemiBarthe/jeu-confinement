import Vue from 'vue'
import vuetify from './plugins/vuetify'
import Vuex from 'vuex'

import App from './App.vue'
import { store } from './store/store'
import './firebase'


Vue.config.productionTip = false
Vue.use(Vuex)

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
