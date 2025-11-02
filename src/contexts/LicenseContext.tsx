import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

interface LicenseContextType {
  isLicenseValid: boolean;
  isLoading: boolean;
  licenseInfo: LicenseInfo | null;
  activateLicense: (licenseKey: string, businessName: string) => Promise<boolean>;
  checkLicense: () => Promise<boolean>;
  deactivateLicense: () => Promise<void>;
}

interface LicenseInfo {
  licenseKey: string;
  businessName: string;
  deviceId: string;
  activatedAt: string;
  expiresAt?: string; // For subscription model
  isActive: boolean;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

const LICENSE_STORAGE_KEY = 'app_license';
// TODO: Replace with your computer's IP address after running 'ipconfig'
// Example: const LICENSE_API_URL = 'http://192.168.1.100:3000/api/license';
const LICENSE_API_URL = 'http://192.168.0.121:3000/api/license'; // CHANGE THIS TO YOUR IP!

export const LicenseProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLicenseValid, setIsLicenseValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);

  useEffect(() => {
    checkLicense();
  }, []);

  const getDeviceId = async (): Promise<string> => {
    // Get unique device identifier
    let deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      // Generate unique ID combining device info
      deviceId = `${Device.modelName}-${Device.osVersion}-${Date.now()}`;
      await AsyncStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  };

  const activateLicense = async (
    licenseKey: string,
    businessName: string
  ): Promise<boolean> => {
    try {
      const deviceId = await getDeviceId();

      // Call your backend to validate license
      const response = await fetch(`${LICENSE_API_URL}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey,
          businessName,
          deviceId,
          deviceInfo: {
            model: Device.modelName,
            os: Device.osName,
            osVersion: Device.osVersion
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const license: LicenseInfo = {
          licenseKey,
          businessName,
          deviceId,
          activatedAt: new Date().toISOString(),
          expiresAt: data.expiresAt, // For subscription
          isActive: true
        };

        await AsyncStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(license));
        setLicenseInfo(license);
        setIsLicenseValid(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('License activation error:', error);
      return false;
    }
  };

  const checkLicense = async (): Promise<boolean> => {
    try {
      const licenseData = await AsyncStorage.getItem(LICENSE_STORAGE_KEY);
      
      if (!licenseData) {
        setIsLicenseValid(false);
        setIsLoading(false);
        return false;
      }

      const license: LicenseInfo = JSON.parse(licenseData);
      const deviceId = await getDeviceId();

      // Verify device hasn't changed
      if (license.deviceId !== deviceId) {
        console.warn('Device mismatch - license invalid');
        await deactivateLicense();
        setIsLoading(false);
        return false;
      }

      // Check expiry (for subscription model)
      if (license.expiresAt) {
        const expiryDate = new Date(license.expiresAt);
        if (expiryDate < new Date()) {
          console.warn('License expired');
          setIsLicenseValid(false);
          setIsLoading(false);
          return false;
        }
      }

      // Verify with backend (requires internet)
      try {
        const response = await fetch(`${LICENSE_API_URL}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            licenseKey: license.licenseKey,
            deviceId
          })
        });

        const data = await response.json();

        if (!data.valid) {
          await deactivateLicense();
          setIsLoading(false);
          return false;
        }
      } catch (error) {
        // Allow offline usage for limited time (grace period)
        console.warn('Offline mode - cannot verify license online');
      }

      setLicenseInfo(license);
      setIsLicenseValid(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('License check error:', error);
      setIsLicenseValid(false);
      setIsLoading(false);
      return false;
    }
  };

  const deactivateLicense = async () => {
    await AsyncStorage.removeItem(LICENSE_STORAGE_KEY);
    setLicenseInfo(null);
    setIsLicenseValid(false);
  };

  return (
    <LicenseContext.Provider
      value={{
        isLicenseValid,
        isLoading,
        licenseInfo,
        activateLicense,
        checkLicense,
        deactivateLicense
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within LicenseProvider');
  }
  return context;
};
