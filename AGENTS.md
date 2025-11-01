# AGENTS.md

This file provides essential development context and guidance for AI coding agents when working on this React Native (Mobile) project.

## Setup Commands

```bash
# Development
CI=1 bunx expo start --web --port 3000

# Build
bunx tsc --noEmit && bunx expo export -p web 2>&1

# Linting
npm run lint
```

## Development Workflow

**Project Structure**: This is a React Native (Mobile) project built with modern tooling and follows industry best practices.

**Key Commands**:

- Development: `CI=1 bunx expo start --web --port 3000`
- Build: `bunx tsc --noEmit && bunx expo export -p web 2>&1`
- Linting: `npm run lint` or `yarn lint`

## Code Style Guidelines


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


## Testing Guidelines

**Default Approach**: Focus on functional application code. Don't write tests unless explicitly requested in the prompt.

**Code Analysis Guidelines**:

- ✅ **DO**: Fix TypeScript type errors, import errors, and broken references
- ✅ **DO**: Address ESLint/Prettier errors that prevent compilation
- ⚠️ **CONDITIONAL**: Only write test files when specifically asked in the user prompt
- ❌ **DON'T**: Address linting warnings (only errors that break functionality)

**When Testing is Requested**: Follow project conventions and use appropriate testing frameworks.

## File Organization

**Safe Directory Structure** - Only create files in these approved directories:

- ✅ `src/` - Main source code (components, pages, hooks, utils, etc.)
- ✅ `components/` - Reusable UI components and related files
- ✅ `lib/` - Utility libraries, shared logic, and helper functions
- ✅ `pages/` - Application pages, screens, and route components
- ✅ `styles/` - CSS files, theme definitions, and styling utilities
- ✅ `utils/` - Utility functions, constants, and helper modules
- ✅ `types/` - TypeScript type definitions and interfaces
- ✅ `hooks/` - Custom React hooks and related logic
- ✅ `lib/` - Utility libraries, shared logic, and helper functions
- ✅ `assets/` - Static assets (images, fonts, icons, etc.)
- ✅ `public/` - Public static files served directly
- ✅ `supabase/` - Database migrations and edge functions
- ✅ `docs/` - Documentation and project guides

❌ **FORBIDDEN**: Root directory (except config files), system directories, parent directories, anything outside project structure

## Performance Considerations

- Prioritize modern JavaScript/TypeScript patterns
- Use appropriate bundling and optimization techniques
- Consider accessibility and responsive design
- Follow SEO best practices where applicable

## Security Guidelines

- Never expose API keys or sensitive data
- Use proper authentication and authorization patterns
- Sanitize user inputs appropriately
- Follow OWASP security guidelines

## External Dependencies

When adding new dependencies:

- Check if similar functionality already exists in the project
- Prefer well-maintained, popular packages
- Consider bundle size impact
- Ensure TypeScript compatibility

## Supabase Backend Integration

### Backend Development Notice

This project does not have a Supabase backend connected.

**Important**:
- Do NOT attempt to implement backend functionality without a connected Supabase project
- If the user requests backend features, inform them that Supabase needs to be connected first
- Focus on frontend/UI development until backend services are configured
- The app should work in a demo/mock mode without real backend functionality

## Supabase Database Best Practices

### Migration File Creation

**Naming Convention**: Always use the format `YYYYMMDDHHmmss_description.sql`:

- Get timestamp: `date +%Y%m%d%H%M%S`
- Example: `20241201143045_create_user_profiles.sql`
- Description should be lowercase with underscores

**Migration Structure**:

```sql
-- Migration: Create user profiles table
-- Purpose: Add user profile management with secure access controls
-- Affected: Creates profiles table with RLS policies
-- Date: 2024-12-01

-- Create the profiles table
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Always enable RLS on new tables
alter table public.profiles enable row level security;

-- Create granular RLS policies (one per operation per role)
create policy "profiles_select_own" on public.profiles
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_own" on public.profiles
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_own" on public.profiles
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "profiles_delete_own" on public.profiles
for delete to authenticated
using ((select auth.uid()) = user_id);

-- Add performance indexes for RLS columns
create index profiles_user_id_idx on public.profiles using btree (user_id);
```

### Row Level Security (RLS) Guidelines

**✅ ALWAYS DO**:

- Enable RLS on every new table: `alter table table_name enable row level security;`
- Use granular policies: separate policy for each operation (SELECT, INSERT, UPDATE, DELETE)
- Specify roles explicitly: `to authenticated` or `to anon`
- Wrap auth functions in SELECT: `(select auth.uid())` instead of `auth.uid()`
- Index columns used in RLS policies: `create index table_column_idx on table_name (column_name);`
- Use snake_case for all database objects (tables, columns, functions, policies)
- Add comprehensive comments explaining policy purpose

**⚠️ PERFORMANCE OPTIMIZATIONS**:

- Avoid joins in RLS policies - use IN/ANY instead:

  ```sql
  -- ❌ SLOW - joins in RLS policy
  using (team_id in (select team_id from team_users where user_id = auth.uid() and team_users.active = true))

  -- ✅ FAST - pre-fetch with function
  using (team_id = any(select get_user_teams()))
  ```

- Create security definer functions for complex checks:
  ```sql
  create function private.user_has_role(required_role text)
  returns boolean
  language plpgsql
  security definer
  as $$
  begin
    return exists (
      select 1 from user_roles
      where user_id = (select auth.uid())
      and role = required_role
    );
  end;
  $$;
  ```

**❌ AVOID**:

- Multiple operations in one policy: `for insert, delete` (not supported)
- Using `auth.role()` (deprecated) - use `TO` clauses instead
- camelCase naming - causes issues with Postgres functions
- Permissive policies without explicit role targeting
- Complex joins directly in policy expressions

### Database Advisor Compliance

**Auth RLS InitPlan Optimization**:

- Always wrap auth functions: `(select auth.uid())` enables initPlan caching
- Use security definer functions for complex permission checks
- Avoid calling `auth.uid()` multiple times in same policy

**Multiple Permissive Policies Warning**:

- Don't create conflicting permissive policies for same operation
- Use descriptive policy names to avoid confusion
- Test policies with different user scenarios
- Consider restrictive policies for additional security layers

### Security Definer Functions Best Practices

**Proper Structure**:

```sql
-- Place in private schema for security
create function private.check_team_access(team_uuid uuid)
returns boolean
language plpgsql
security definer
set search_path = public, private
as $$
begin
  return exists (
    select 1 from team_members
    where team_id = team_uuid
    and user_id = (select auth.uid())
    and status = 'active'
  );
end;
$$;

-- Grant usage to authenticated users
grant execute on function private.check_team_access(uuid) to authenticated;
```

### Testing RLS Policies

**Manual Testing Pattern**:

```sql
-- Test as different user roles
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"user-uuid-here","role":"authenticated"}';

-- Verify policy behavior
select count(*) from profiles; -- Should only show user's own records

-- Test with EXPLAIN ANALYZE for performance
explain analyze select * from profiles where user_id = (select auth.uid());
```

**Common Test Scenarios**:

- Authenticated users can only access their own data
- Anonymous users have appropriate read-only access
- Users cannot access/modify other users' data
- Policies perform well with large datasets
- No data leakage between tenants/users

---

**Project Info**: React Native (Mobile) | **Generated by**: App2dev Platform | **Auto-Generated**: 2025-10-30T21:56:07.488Z


