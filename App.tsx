import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';
import { LicenseProvider } from './src/contexts/LicenseContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import './src/i18n';

export default function App() {
  return (
    <LicenseProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </LicenseProvider>
  );
}
