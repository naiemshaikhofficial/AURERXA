import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aurerxa.app',
  appName: 'AURERXA',
  webDir: 'public',
  server: {
    url: 'https://www.aurerxa.com',
    cleartext: true,
    androidScheme: 'https'
  }
};

export default config;
