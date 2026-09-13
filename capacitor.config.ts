import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cityconnect.app',
  appName: 'CityConnect',
  webDir: 'dist', // This is the important line
  server: {
    androidScheme: 'https'
  }
};

export default config;