import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useChatStore } from '@/application/stores/chatStore';
import { useAuthStore } from '@/application/stores/authStore';
import { socketService } from '@/infrastructure/api/socket.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const expoParams = useLocalSearchParams<{ id: string }>();
  const navId = (route.params as { id?: string } | undefined)?.id;
  const id = navId ?? expoParams.id;
  const { user } = useAuthStore();
  const { messages, loadMessages, sendMessage: sendMessageStore, matches } = useChatStore();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const conversationId = parseInt(id || '0');
  const match = matches.find(m => m.conversationId === conversationId);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId).finally(() => setLoading(false));
      socketService.connect().then(() => {
        socketService.joinConversation(conversationId);
      });
      return () => {
        socketService.leaveConversation(conversationId);
      };
    }
  }, [conversationId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    try {
      socketService.sendMessage(conversationId, inputText);
      await sendMessageStore(conversationId, inputText);
      setInputText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#181611" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Image
            source={{ uri: match?.pet?.photos?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAawhoImLsL2silV307vNydYGMkpyOlABSWeebzS-ApjuWtLRkjczcv8W-l5rO3bfLuxxPJV2MpF8hl00MDwoHJA1eoeLCyopUq3lN296bDdc9tpR5kd4FVyvnsBnWpkrBXZcRMuG-MvGNZ-1rNBsCE7zYKYkawsQtIzGuQ5r1fuLSZRHw4ARmwRtzE2EVk6OiHUTKsoNUQMVEhFUVvNyQqP1CgSfvtHcR54kH6Pi5YV9ASF-UAKf3PKOUIgBBLJgtTErl9nJ3Cddgh' }}
            style={styles.headerAvatar}
          />
          <View>
            <Text style={styles.headerName}>{match?.pet?.name || 'PawMatch'} 🐶</Text>
            <Text style={styles.headerStatus}>Çevrimiçi</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages[conversationId] || []}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput
            style={styles.input}
            placeholder="Mesaj yazın..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    marginRight: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerName: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#181611',
  },
  headerStatus: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Bold',
    color: COLORS.primary,
  },
  main: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  messageRow: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageRowMe: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleThem: {
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  msgTextThem: {
    color: '#181611',
  },
  msgTextMe: {
    color: '#fff',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
