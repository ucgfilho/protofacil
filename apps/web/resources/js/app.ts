import '../css/app.css';
import { createInertiaApp } from '@inertiajs/vue3';
import { createPinia } from 'pinia';
import { createApp, h, type DefineComponent } from 'vue';

interface PageModule {
  default: DefineComponent;
}

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob<PageModule>('./pages/**/*.vue');
    const page = pages[`./pages/${name}.vue`];
    if (!page) {
      throw new Error(`Página Inertia não encontrada: ${name}`);
    }
    return (await page()).default;
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .use(createPinia())
      .mount(el);
  },
  progress: {
    color: '#1d4ed8'
  }
});
