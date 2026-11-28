import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.shortedge.app',
  appName: 'ShortEdge',
  webDir: 'public',
  server: {
    url: 'https://opposed-moderate-automation-motorola.trycloudflare.com',
    cleartext: true
  }
};

export default config;
