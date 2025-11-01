# Mobile Frontend Guidelines

## Expo + React Native Development Guidelines

### Expo Development Environment
- Use Expo CLI for project management and builds: `bunx expo`
- Leverage Expo Development Build for custom native code when needed
- Use `expo start` for development server
- Configure environment variables in `.env` files with `EXPO_PUBLIC_` prefix
- Use `expo install` for installing packages with proper version compatibility
- Test on multiple devices using Expo Go or development builds

### React Native Best Practices
- Use functional components with hooks over class components
- Leverage React Native's built-in components: View, Text, ScrollView, etc.
- Use Platform-specific code with `Platform.OS` checks when needed
- Implement proper memory management and avoid memory leaks
- Use FlatList/SectionList for large data sets instead of ScrollView
- Handle device orientation changes and screen size variations

### TypeScript Standards
- Use strict TypeScript configuration for mobile development
- Define interfaces for component props, navigation params, and API responses
- Use proper typing for React Native components and platform APIs
- Implement generic constraints for reusable mobile components
- Use type guards for platform-specific code and runtime checks
- Define proper types for navigation screens and route parameters

### Component Architecture
- Use PascalCase for component names (e.g., `UserProfile.tsx`)
- Use camelCase for prop names, function names, and style properties
- Export components as named exports: `export const MyComponent = () => {}`
- Use default exports only for screen components or main exports
- Group related components in feature-based directories
- Separate platform-specific components with `.ios.tsx` and `.android.tsx` extensions


### Import/Export Patterns
- Use named imports for internal code: `import { Button } from './Button'`
- Group imports: React/React Native, third-party, then relative imports
- Use absolute imports with Metro resolver configuration when available
- Export only what's needed externally - keep internal helpers private
- Use `export { ScreenComponent }` for screen components

### Styling Conventions
- Use StyleSheet.create() for component styles instead of inline objects
- Define styles at the bottom of component files or in separate style files
- Use consistent naming: styles.container, styles.text, styles.button
- Implement responsive design with Dimensions API or libraries like react-native-size-matters
- Use platform-specific styles with Platform.select() when needed
- Leverage Expo's built-in theming and dark mode support

### Navigation Patterns (React Navigation)
- Use typed navigation with proper TypeScript interfaces
- Define navigation param types for type-safe screen navigation
- Use proper navigation methods: navigate(), push(), replace(), goBack()
- Implement deep linking with proper URL handling
- Use navigation state management for complex flows
- Handle navigation events and focus/blur states appropriately

### State Management
- Use `useState` for local component state
- Use `useContext` for shared state across components and screens
- Implement proper state persistence with AsyncStorage when needed
- Use `useReducer` for complex state logic with multiple actions
- Handle state updates safely to prevent memory leaks

### Performance Optimization
- Use `React.memo()` to prevent unnecessary re-renders
- Implement `useMemo()` and `useCallback()` for expensive computations
- Use lazy loading and code splitting with React.lazy() where applicable
- Optimize images with proper sizing and caching strategies
- Use FlatList with proper keyExtractor and getItemLayout when possible
- Implement proper cleanup in useEffect hooks to prevent memory leaks

### Platform-Specific Development
- Handle iOS and Android differences with Platform.OS checks
- Use platform-specific components when needed (e.g., ActionSheetIOS)
- Implement proper safe area handling with react-native-safe-area-context
- Handle status bar styling appropriately for each platform
- Use platform-specific navigation patterns and UI guidelines
- Test on both platforms regularly during development

### Asset Management
- Organize assets in logical folders: images/, fonts/, icons/
- Use proper image formats: PNG for images, SVG for icons when possible
- Implement proper image caching and optimization
- Use Expo's asset loading with proper error handling
- Handle different screen densities with appropriate image assets
- Use expo-font for custom fonts with proper loading states

### Error Handling & Loading States
- Implement proper error boundaries for JavaScript errors
- Show loading states for async operations: `{loading && <ActivityIndicator />}`
- Handle network errors gracefully with retry mechanisms
- Use proper error messages and user feedback
- Implement offline handling and network state detection
- Handle permission requests with proper user messaging

### Mobile-Specific Features
- Implement proper keyboard handling with KeyboardAvoidingView
- Use proper touch handling with gesture libraries when needed
- Implement haptic feedback for better user experience
- Handle device sensors (accelerometer, GPS) safely
- Use proper camera and media library integrations
- Implement push notifications with Expo Notifications

### Accessibility Standards
- Use accessibilityLabel and accessibilityHint for screen readers
- Implement proper focus management for navigation
- Use semantic component roles and accessibility traits
- Test with VoiceOver (iOS) and TalkBack (Android)
- Ensure proper contrast ratios and readable text sizes
- Use accessibilityRole for proper element identification

### Code Quality Rules
- Use semicolons to terminate statements
- Use single quotes for strings (following Prettier config)
- Maximum line width of 90 characters
- Use 2 spaces for indentation
- No trailing commas in objects/arrays
- Prefix unused parameters with underscore: `_unusedParam`

### Supabase Integration (when applicable)
- Use `@supabase/supabase-js` for database operations
- Implement proper authentication flows with biometric support
- Handle offline data synchronization appropriately
- Use Supabase Storage for file uploads with proper permissions
- Implement real-time subscriptions with proper cleanup
- Handle deep linking for authentication callbacks

### Common Patterns
```typescript
// Screen component with navigation typing
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation, route }: HomeScreenProps) => {
  const [data, setData] = useState<DataType[]>([]);
  
  const navigateToDetail = (item: DataType) => {
    navigation.navigate('Detail', { itemId: item.id });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigateToDetail(item)}>
            <Text style={styles.itemText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  itemText: {
    fontSize: 16,
    paddingVertical: 8,
  },
});

// Custom hook for async storage
export const useAsyncStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored !== null) {
          setValue(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };
    loadValue();
  }, [key]);

  const setStoredValue = async (newValue: T) => {
    try {
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
  };

  return [value, setStoredValue, loading] as const;
};

// Platform-specific styling
const platformStyles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        paddingTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        paddingTop: 25,
        elevation: 4,
      },
    }),
  },
});
```

### Anti-Patterns to Avoid
- Don't use web-specific libraries or DOM APIs
- Don't create components inside render methods
- Don't mutate state directly - always use setState functions
- Don't forget to clean up subscriptions and listeners
- Don't use array index as key for dynamic lists
- Don't ignore platform differences and design guidelines
- Don't use synchronous storage operations on the main thread
- Don't implement navigation without proper TypeScript typing
- Don't ignore accessibility considerations for mobile users
- Don't use heavy libraries that significantly increase bundle size

### Testing Policy
- NEVER write unit tests, integration tests, or test files
- NEVER create testing utilities, mocks, or test configurations
- NEVER suggest testing frameworks (Jest, Detox, Testing Library, etc.)
- DO read code for syntax/compilation errors and critical linting errors only
- DO fix TypeScript errors, import errors, and broken references
- DON'T address linting warnings (only errors that break functionality)
- Focus on building functional mobile application features, not tests

### Expo-Specific Best Practices
- Use Expo Config for app configuration and build settings
- Leverage Expo SDK for native functionality (Camera, Location, etc.)
- Use Expo Updates for over-the-air updates in production
- Implement proper app icon and splash screen configuration
- Use Expo Application Services (EAS) for building and deployment
- Handle app store guidelines and platform requirements properly
- Use Expo development builds for custom native dependencies

