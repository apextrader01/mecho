import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.shortedge.app',
  appName: 'ShortEdge',
  webDir: 'public',
  server: {
    url: 'https://considering-architect-suites-equivalent.trycloudflare.com',
    cleartext: true
  }
};

export default config;
