import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, View, ActivityIndicator } from 'react-native';

// Import Screens
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import OutletMenuScreen from '../screens/customer/OutletMenuScreen';
import OrderTrackScreen from '../screens/customer/OrderTrackScreen';
import VendorHomeScreen from '../screens/vendor/VendorHomeScreen';

export type RootStackParamList = {
  Loading: undefined;
  RoleSelection: undefined;
  Login: { role?: 'CUSTOMER' | 'VENDOR' };
  CustomerHome: undefined;
  OutletMenu: { outletId: string; outletName: string };
  OrderTrack: { orderId: string };
  VendorHome: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const prefix = Linking.createURL('/');

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBF2' }}>
    <ActivityIndicator size="large" color="#E13328" />
  </View>
);

export default function AppNavigator() {
  const { isSignedIn } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'VENDOR' | null>(null);
  const [isReady, setIsReady] = useState(false);

  const getPathRole = (): 'CUSTOMER' | 'VENDOR' | null => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('vendor')) return 'VENDOR';
      if (path.includes('customer')) return 'CUSTOMER';
    }
    return null;
  };

  const linking = {
    prefixes: [prefix, 'http://localhost:8081'],
    config: {
      screens: {
        VendorHome: 'vendor',
        CustomerHome: 'customer',
        RoleSelection: 'roles',
        Login: 'login',
      },
    },
    async getInitialURL() {
      const pathRole = getPathRole();
      if (pathRole) {
        setSelectedRole(pathRole);
      }
      return await Linking.getInitialURL();
    },
    subscribe(listener: (url: string) => void) {
      const onReceiveURL = async ({ url }: { url: string }) => {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('vendor')) {
          setSelectedRole('VENDOR');
        } else if (lowerUrl.includes('customer')) {
          setSelectedRole('CUSTOMER');
        }
        listener(url);
      };
      const subscription = Linking.addEventListener('url', onReceiveURL);
      return () => subscription.remove();
    },
  };

  useEffect(() => {
    const resolveRole = async () => {
      // 1. If explicit URL path like /vendor or /customer, honor it
      const pathRole = getPathRole();
      if (pathRole) {
        setSelectedRole(pathRole);
      } else {
        // At root /: do NOT auto-redirect to Customer! Keep selectedRole as null to show Role Selection
        setSelectedRole(null);
      }
      setIsReady(true);
    };
    resolveRole();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  // 1. If no role is selected yet (visiting root http://localhost:8081) -> ALWAYS show RoleSelectionScreen
  if (!selectedRole) {
    return (
      <NavigationContainer linking={linking}>
        <RoleSelectionScreen
          onSelectRole={(role) => {
            setSelectedRole(role);
          }}
        />
      </NavigationContainer>
    );
  }

  // 2. If role is selected, check authentication
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFBF2' },
        }}
      >
        {!isSignedIn ? (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  route={{ ...props.route, params: { role: selectedRole } }}
                  onResetRole={() => setSelectedRole(null)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="RoleSelection">
              {() => <RoleSelectionScreen onSelectRole={(role) => setSelectedRole(role)} />}
            </Stack.Screen>
          </>
        ) : selectedRole === 'VENDOR' ? (

          <Stack.Screen name="VendorHome" component={VendorHomeScreen} />
        ) : (
          <>
            <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
            <Stack.Screen name="OutletMenu" component={OutletMenuScreen} />
            <Stack.Screen name="OrderTrack" component={OrderTrackScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
