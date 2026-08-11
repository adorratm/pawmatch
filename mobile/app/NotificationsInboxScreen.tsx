import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from 'expo-router/react-navigation';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import {
  notificationsService,
  type AppNotification,
} from '@/infrastructure/api/notifications.service';
import { navigateFromNotification } from '@/presentation/utils/notificationNavigation';

function typeIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'match':
      return 'heart';
    case 'like':
      return 'heart-outline';
    case 'message':
      return 'chatbubble-outline';
    case 'appointment':
    case 'appointment_reminder':
      return 'calendar-outline';
    default:
      return 'notifications-outline';
  }
}

export default function NotificationsInboxScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await notificationsService.list();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.response?.data?.message || t('inbox.loadFailed'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const openItem = async (item: AppNotification) => {
    if (!item.isRead) {
      try {
        await notificationsService.markAsRead(item.id);
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* ignore */
      }
    }
    navigateFromNotification(navigation as any, item);
  };

  const markAll = async () => {
    try {
      await notificationsService.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.response?.data?.message || t('inbox.actionFailed'));
    }
  };

  const deleteOne = (item: AppNotification) => {
    Alert.alert(t('inbox.deleteTitle'), t('inbox.deleteMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: async () => {
          try {
            await notificationsService.deleteOne(item.id);
            setItems((prev) => prev.filter((n) => n.id !== item.id));
            if (!item.isRead) setUnreadCount((c) => Math.max(0, c - 1));
          } catch (e: any) {
            Alert.alert(t('common.error'), e?.response?.data?.message || t('inbox.actionFailed'));
          }
        },
      },
    ]);
  };

  const clearAll = () => {
    if (items.length === 0) return;
    Alert.alert(t('inbox.clearTitle'), t('inbox.clearMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('inbox.clearConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await notificationsService.deleteAll();
            setItems([]);
            setUnreadCount(0);
          } catch (e: any) {
            Alert.alert(t('common.error'), e?.response?.data?.message || t('inbox.actionFailed'));
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: '#fff' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#181611" />
        </TouchableOpacity>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>{t('inbox.title')}</Text>
          <Text style={styles.headerSub}>
            {unreadCount > 0
              ? t('inbox.unreadCount', { count: unreadCount })
              : t('inbox.allRead')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (navigation as any).navigate('NotificationPreferences1')}
        >
          <Ionicons name="options-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolBtn, unreadCount === 0 && styles.toolBtnDisabled]}
          disabled={unreadCount === 0}
          onPress={() => void markAll()}
        >
          <Ionicons name="checkmark-done" size={16} color={COLORS.primary} />
          <Text style={styles.toolBtnText}>{t('inbox.markAllRead')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolBtn, items.length === 0 && styles.toolBtnDisabled]}
          disabled={items.length === 0}
          onPress={clearAll}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          <Text style={[styles.toolBtnText, { color: COLORS.error }]}>{t('inbox.clearAll')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={56} color="#e5e5e5" />
            <Text style={styles.emptyText}>{t('inbox.empty')}</Text>
            <Text style={styles.emptyHint}>{t('inbox.emptyHint')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, !item.isRead && styles.rowUnread]}
            activeOpacity={0.85}
            onPress={() => void openItem(item)}
            onLongPress={() => deleteOne(item)}
          >
            <View style={[styles.iconWrap, !item.isRead && styles.iconWrapUnread]}>
              <Ionicons
                name={typeIcon(item.type)}
                size={22}
                color={!item.isRead ? COLORS.primary : COLORS.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.body} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleString('tr-TR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => deleteOne(item)}
            >
              <Ionicons name="close" size={18} color="#ccc" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitleBlock: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#181611' },
  headerSub: { fontSize: 11, fontWeight: '600', color: COLORS.primary, marginTop: 2 },
  toolbar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  toolBtnDisabled: { opacity: 0.45 },
  toolBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  list: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fafafa',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  rowUnread: {
    backgroundColor: 'rgba(106, 63, 42, 0.06)',
    borderColor: 'rgba(106, 63, 42, 0.2)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnread: { backgroundColor: 'rgba(106, 63, 42, 0.15)' },
  title: { fontSize: 15, fontWeight: '700', color: '#333' },
  titleUnread: { color: '#181611', fontWeight: '800' },
  body: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, lineHeight: 18 },
  time: { fontSize: 11, color: '#aaa', marginTop: 6, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyText: { marginTop: 12, fontSize: 17, fontWeight: '700', color: COLORS.text },
  emptyHint: { marginTop: 8, fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
});
