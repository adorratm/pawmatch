/**
 * RN core (AppContainer) and some libs still pass pointerEvents as a View prop.
 * react-native-web warns once; silence only that known deprecation noise on web.
 */
const POINTER_EVENTS_DEPRECATION = 'props.pointerEvents is deprecated';

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const originalWarn = console.warn.bind(console);
  console.warn = (...args) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes(POINTER_EVENTS_DEPRECATION)) {
      return;
    }
    originalWarn(...args);
  };
}
