import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.shortedge.app',
  appName: 'ShortEdge',
  webDir: 'public',
  server: {
    url: 'https://dramatic-newbie-sky-chances.trycloudflare.com',
    cleartext: true
  }
};

export default config;
