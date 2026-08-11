import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/presentation/styles/config';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  size?: 'default' | 'search';
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
};

const webNoOutline =
  Platform.OS === 'web'
    ? ({ outlineStyle: 'none', outlineWidth: 0 } as TextStyle)
    : undefined;

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    size = 'default',
    containerStyle,
    inputStyle,
    wrapperStyle,
    multiline,
    onFocus,
    onBlur,
    placeholderTextColor = COLORS.textMuted,
    editable = true,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const isSearch = size === 'search';
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.wrapper,
          isSearch && styles.wrapperSearch,
          multiline && styles.wrapperMultiline,
          focused && styles.wrapperFocused,
          hasError && styles.wrapperError,
          !editable && styles.wrapperDisabled,
          wrapperStyle,
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={isSearch ? 20 : 22}
            color={focused ? COLORS.primary : COLORS.textMuted}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            isSearch && styles.inputSearch,
            multiline && styles.inputMultiline,
            webNoOutline,
            inputStyle,
          ]}
          placeholderTextColor={placeholderTextColor}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon ? (
          onRightIconPress ? (
            <TouchableOpacity
              onPress={onRightIconPress}
              hitSlop={8}
              style={styles.rightIconBtn}
              accessibilityRole="button"
            >
              <Ionicons
                name={rightIcon}
                size={22}
                color={focused ? COLORS.primary : COLORS.textMuted}
              />
            </TouchableOpacity>
          ) : (
            <Ionicons
              name={rightIcon}
              size={22}
              color={focused ? COLORS.primary : COLORS.textMuted}
              style={styles.rightIcon}
            />
          )
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 6,
    marginLeft: 4,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  wrapperSearch: {
    minHeight: 48,
  },
  wrapperMultiline: {
    alignItems: 'flex-start',
    minHeight: 120,
    paddingVertical: 12,
  },
  wrapperFocused: {
    borderColor: COLORS.primary,
  },
  wrapperError: {
    borderColor: COLORS.error,
  },
  wrapperDisabled: {
    backgroundColor: COLORS.surface,
    opacity: 0.85,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  rightIconBtn: {
    marginLeft: 10,
    padding: 2,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    ...(Platform.OS === 'web'
      ? ({ outlineStyle: 'none', outlineWidth: 0 } as TextStyle)
      : null),
  },
  inputSearch: {
    minHeight: 44,
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: Platform.OS === 'ios' ? 4 : 0,
  },
  error: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },
  hint: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
});

export default Input;
