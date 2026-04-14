import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import i18n from '@/i18n';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';


import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App)
  .use(IonicVue)
  .use(pinia)
  .use(router)
  .use(i18n);

router.isReady().then(() => {
  app.mount('#app');
});