import { createNavigationContainerRef } from '@react-navigation/native';

// Standalone ref so non-component code (e.g. push-notification tap handling)
// can navigate without prop drilling.
export const navigationRef = createNavigationContainerRef();
