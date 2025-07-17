
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4a87ca03fbb5474b9a612f3d191b195c',
  appName: 'oficina-check-tudo-plus',
  webDir: 'dist',
  server: {
    url: 'https://4a87ca03-fbb5-474b-9a61-2f3d191b195c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;
