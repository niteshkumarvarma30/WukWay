import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useSignIn, useSignUp, useOAuth } from '@clerk/clerk-expo';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  route?: LoginScreenRouteProp;
  navigation: LoginScreenNavigationProp;
  onResetRole?: () => void;
};

export default function LoginScreen({ route, navigation, onResetRole }: Props) {
  const selectedRole = route?.params?.role || 'CUSTOMER';

  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  const [emailAddress, setEmailAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleChangeRole = async () => {
    await AsyncStorage.removeItem('appRole');
    if (onResetRole) {
      onResetRole();
    } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      navigation.navigate('RoleSelection');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await AsyncStorage.setItem('appRole', selectedRole);
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Platform.OS === 'web' ? window.location.href : Linking.createURL('/'),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err: any) {
      alert('Google Sign-In Error: ' + JSON.stringify(err, null, 2));
    }
  };

  const handleSendOtp = async () => {
    if (!isSignInLoaded || !isSignUpLoaded) return;
    if (!emailAddress.includes('@')) return;

    setLoading(true);
    await AsyncStorage.setItem('appRole', selectedRole);

    try {
      const { supportedFirstFactors } = await signIn.create({ identifier: emailAddress });
      const emailFactor = supportedFirstFactors?.find((f: any) => f.strategy === 'email_code');

      if (emailFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: (emailFactor as any).emailAddressId,
        });
        setIsSignUp(false);
        setIsOtpSent(true);
      } else {
        alert('Email OTP is not supported for this account.');
      }
    } catch (err: any) {
      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        try {
          if (signUp && signUp.emailAddress === emailAddress && signUp.status !== 'complete') {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setIsSignUp(true);
            setIsOtpSent(true);
            return;
          }

          await signUp.create({ emailAddress });
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setIsSignUp(true);
          setIsOtpSent(true);
        } catch (signUpErr: any) {
          alert('Sign Up Error: ' + JSON.stringify(signUpErr, null, 2));
        }
      } else {
        alert('Sign In Error: ' + JSON.stringify(err, null, 2));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isSignInLoaded || !isSignUpLoaded) return;
    if (otp.length !== 6 && otp.length !== 4) return;

    setLoading(true);
    await AsyncStorage.setItem('appRole', selectedRole);

    try {
      if (isSignUp) {
        let completeSignUp = await signUp.attemptEmailAddressVerification({ code: otp });

        if (completeSignUp.status === 'missing_requirements') {
          completeSignUp = await signUp.update({ firstName: 'WukWay', lastName: 'User' });
        }

        if (completeSignUp.status === 'complete') {
          await setSignUpActive({ session: completeSignUp.createdSessionId });
        } else {
          alert('Verification incomplete: ' + JSON.stringify(completeSignUp, null, 2));
        }
      } else {
        const completeSignIn = await signIn.attemptFirstFactor({ strategy: 'email_code', code: otp });
        if (completeSignIn.status === 'complete') {
          await setSignInActive({ session: completeSignIn.createdSessionId });
        } else {
          alert('Verification incomplete: ' + JSON.stringify(completeSignIn, null, 2));
        }
      }
    } catch (err: any) {
      alert(err.errors?.[0]?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const isVendor = selectedRole === 'VENDOR';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        {/* Top Back / Change Role button */}
        <TouchableOpacity
          style={styles.changeRoleBtn}
          onPress={handleChangeRole}
        >
          <Text style={styles.changeRoleText}>← Change Portal / Role</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>WukWay</Text>
          <Text style={styles.subtitle}>Order ahead. Skip the queue.</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Active Role Indicator Badge */}
          <View style={[styles.roleBadge, isVendor ? styles.vendorRoleBadge : styles.customerRoleBadge]}>
            <Text style={[styles.roleBadgeText, isVendor ? styles.vendorRoleText : styles.customerRoleText]}>
              {isVendor ? '🏪 LOGGING IN AS VENDOR' : '🍔 LOGGING IN AS CUSTOMER'}
            </Text>
          </View>

          <Text style={styles.eyebrow}>YOUR EMAIL ADDRESS</Text>

          {!isOtpSent ? (
            <>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#806c61"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, (!emailAddress.includes('@') || loading) && styles.disabledButton]}
                onPress={handleSendOtp}
                disabled={!emailAddress.includes('@') || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Get OTP</Text>}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading}>
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (typeof window !== 'undefined') {
                    window.localStorage.clear();
                    window.sessionStorage.clear();
                    window.location.reload();
                  }
                }}
                style={{ marginTop: 16, alignItems: 'center' }}
              >
                <Text style={{ color: '#806c61', fontSize: 11, fontWeight: '700', textDecorationLine: 'underline' }}>
                  Clear local cache & reset fresh
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter OTP from Email"
                  placeholderTextColor="#806c61"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, (otp.length < 4 || loading) && styles.disabledButton]}
                onPress={handleVerifyOtp}
                disabled={otp.length < 4 || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify & Continue ➔</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsOtpSent(false)} style={styles.textButton}>
                <Text style={styles.textButtonText}>Change email</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFBF2' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  changeRoleBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#2B1710',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  changeRoleText: {
    color: '#2B1710',
    fontSize: 13,
    fontWeight: '800',
  },
  header: { marginBottom: 30 },
  logo: { fontSize: 42, fontWeight: '900', letterSpacing: -1.8, color: '#E13328', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#2B1710', fontWeight: '600' },
  formContainer: {
    backgroundColor: '#fffdf8',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eadfd2',
    shadowColor: '#2B1710',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  customerRoleBadge: {
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#FFC22E',
  },
  customerRoleText: {
    color: '#e65100',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  vendorRoleBadge: {
    backgroundColor: '#ffe9e8',
    borderWidth: 1,
    borderColor: '#E13328',
  },
  vendorRoleText: {
    color: '#E13328',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1, color: '#806c61', marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#eadfd2',
    borderRadius: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  input: { flex: 1, fontSize: 16, fontWeight: '700', color: '#2B1710' },
  primaryButton: {
    backgroundColor: '#E13328',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E13328',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  disabledButton: { opacity: 0.5 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  textButton: { marginTop: 20, alignItems: 'center' },
  textButtonText: { color: '#E13328', fontSize: 14, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divider: { flex: 1, height: 1, backgroundColor: '#eadfd2' },
  dividerText: { marginHorizontal: 10, color: '#806c61', fontWeight: '800', fontSize: 12 },
  googleButton: {
    backgroundColor: '#fff',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#eadfd2',
  },
  googleButtonText: { color: '#2B1710', fontSize: 15, fontWeight: '900' },
});
