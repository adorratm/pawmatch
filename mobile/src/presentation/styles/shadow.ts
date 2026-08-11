import { Platform, type ViewStyle } from 'react-native';

function hexToRgba(color: string, opacity: number): string {
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    return color;
  }
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (hex.length !== 6) {
    return `rgba(0,0,0,${opacity})`;
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

type ShadowOpts = {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  opacity?: number;
  /** Android native elevation (ignored on web) */
  elevation?: number;
  /** Clears shadow (web needs boxShadow:'none'; shadowOpacity alone won't override). */
  none?: boolean;
};

/**
 * Cross-platform shadow: `boxShadow` on web (avoids RN-web deprecation),
 * classic shadow* + elevation on native.
 */
export function shadowStyle(opts: ShadowOpts = {}): ViewStyle {
  if (opts.none) {
    if (Platform.OS === 'web') {
      return {
        // @ts-expect-error boxShadow is valid on RN-web / newer RN
        boxShadow: 'none',
      };
    }
    return { shadowOpacity: 0, elevation: 0 };
  }

  const color = opts.color ?? '#000';
  const offsetX = opts.offsetX ?? 0;
  const offsetY = opts.offsetY ?? 2;
  const blur = opts.blur ?? 8;
  const opacity = opts.opacity ?? 0.1;
  const elevation = opts.elevation ?? 3;

  if (Platform.OS === 'web') {
    return {
      // @ts-expect-error boxShadow is valid on RN-web / newer RN
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${hexToRgba(color, opacity)}`,
    };
  }

  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };
}
