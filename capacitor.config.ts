
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.79a3b2788f76404f9049421c23d9acf8',
  appName: 'auto-admin-portal',
  webDir: 'dist',
  server: {
    url: 'https://79a3b278-8f76-404f-9049-421c23d9acf8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffffff",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
    },
  },
};

export default config;
