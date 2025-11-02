import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLicense } from '../contexts/LicenseContext';
import { Text } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import LicenseActivationScreen from '../screens/LicenseActivationScreen';
import DashboardScreen from '../screens/DashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import PurchasesScreen from '../screens/PurchasesScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ProductionScreen from '../screens/ProductionScreen';
import SalesScreen from '../screens/SalesScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MoreScreen from '../screens/MoreScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t('navigation.dashboard'),
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📊</Text>
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: t('navigation.inventory'),
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📦</Text>
        }}
      />
      <Tab.Screen
        name="Purchases"
        component={PurchasesScreen}
        options={{
          tabBarLabel: t('navigation.purchases'),
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🛒</Text>
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{
          tabBarLabel: t('navigation.recipes'),
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📝</Text>
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{
          tabBarLabel: t('navigation.more'),
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>⋯</Text>
        }}
      />
    </Tab.Navigator>
  );
};

const MoreStack = createNativeStackNavigator();

const MoreNavigator = () => {
  const { t } = useTranslation();

  return (
    <MoreStack.Navigator>
      <MoreStack.Screen name="MoreMenu" component={MoreScreen} options={{ title: t('navigation.more') }} />
      <MoreStack.Screen name="Production" component={ProductionScreen} options={{ title: t('navigation.production') }} />
      <MoreStack.Screen name="Sales" component={SalesScreen} options={{ title: t('navigation.sales') }} />
      <MoreStack.Screen name="Expenses" component={ExpensesScreen} options={{ title: t('navigation.expenses') }} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} options={{ title: t('navigation.reports') }} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ title: t('navigation.settings', { defaultValue: 'Settings' }) }} />
    </MoreStack.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isLicenseValid, isLoading: isLicenseLoading } = useLicense();

  if (isAuthLoading === true || isLicenseLoading === true) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLicenseValid === false ? (
          <Stack.Screen name="LicenseActivation" component={LicenseActivationScreen} />
        ) : user === null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
