import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.ighorn.pdfchecklist',
  appName: 'PDF Checklist',
  webDir: 'dist',
  server: {
    // In production APK, the app talks to this backend URL.
    // Change this to your deployed server address.
    // For local testing via USB debugging, use your machine's LAN IP:
    // url: 'http://192.168.1.X:8000',
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
  },
}

export default config
