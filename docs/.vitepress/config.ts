import { defineConfig } from 'vitepress';
import typedocSidebar from '../reference/typedoc-sidebar.json';
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'EnvGuard',
  description: 'Secure and easy env secret management tool for developers',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: typedocSidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
});
