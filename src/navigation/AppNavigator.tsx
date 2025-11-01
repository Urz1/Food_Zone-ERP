import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { Text } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import PurchasesScreen from '../screens/PurchasesScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ProductionScreen from '../screens/ProductionScreen';
import SalesScreen from '../screens/SalesScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import ReportsScreen from '../screens/ReportsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        },
        tabBarLabelStyle: {
          fontSize: 11
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📊</Text>
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📦</Text>
        }}
      />
      <Tab.Screen
        name="Purchases"
        component={PurchasesScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🛒</Text>
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📝</Text>
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>⋯</Text>
        }}
      />
    </Tab.Navigator>
  );
};

const MoreStack = createNativeStackNavigator();

const MoreNavigator = () => {
  return (
    <MoreStack.Navigator>
      <MoreStack.Screen name="MoreMenu" component={ProductionScreen} options={{ title: 'Production' }} />
      <MoreStack.Screen name="Sales" component={SalesScreen} />
      <MoreStack.Screen name="Expenses" component={ExpensesScreen} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} />
    </MoreStack.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
