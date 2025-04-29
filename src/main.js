import './assets/main.css';
import { createApp, provide, h } from 'vue';
import apolloClient from './plugins/apollo';
import { DefaultApolloClient } from '@vue/apollo-composable';
import App from './App.vue';
import router from './router.js'; // Import the router
import '@fortawesome/fontawesome-free/css/all.css';

const scrollAnimationDirective = {
   
    mounted(el, binding) {
      
      const options = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.3 
      };
  
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            observer.unobserve(el);
          }
        });
      }, options);
  
      observer.observe(el);
  
      el._scrollObserver = observer;
    },
    beforeUnmount(el) {
      if (el._scrollObserver) {
        el._scrollObserver.disconnect();
      }
    }
  };

const app = createApp({
    setup() {
        provide(DefaultApolloClient, apolloClient);
    },
    render: () => h(App)
});
+app.directive('scroll-animation', scrollAnimationDirective);

app.use(router);
app.mount('#app');
