import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslations, useLocale } from 'use-intl';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import { getNotifications, markNotificationsRead } from '../api';
import { formatDate } from '../lib/format';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

function timeLabel(iso, locale) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return `${formatDate(iso, locale)} · ${time}`;
}

export default function NotificationsScreen({ navigation }) {
  const t = useTranslations('Notifications');
  const locale = useLocale();

  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getNotifications();
      setItems(res.notifications || []);
      // Viewing the centre clears the unread badge.
      if ((res.unreadCount ?? 0) > 0) markNotificationsRead().catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onPressItem = (n) => {
    const id = n.data?.subscriptionId;
    if (id) navigation.navigate('SubscriptionDetail', { id });
  };

  const renderItem = ({ item }) => {
    const unread = !item.readAt;
    return (
      <Pressable onPress={() => onPressItem(item)}>
        <HStack space="sm" className="px-5 py-3 border-b border-outline-100 items-start">
          <Box className={`w-2 h-2 rounded-full mt-1.5 ${unread ? 'bg-primary-600' : 'bg-transparent'}`} />
          <VStack className="flex-1" space="xs">
            <Text className="font-semibold text-typography-900">{item.title}</Text>
            <Text className="text-sm text-typography-600">{item.body}</Text>
            <Text className="text-xs text-typography-400">{timeLabel(item.createdAt, locale)}</Text>
          </VStack>
          {item.data?.subscriptionId && (
            <Ionicons name="chevron-forward" size={16} color="#a3a3a3" />
          )}
        </HStack>
      </Pressable>
    );
  };

  return (
    <Screen edges={['top']}>
      <ScreenHeader title={t('title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={
          <VStack className="items-center justify-center py-24" space="md">
            <Ionicons name="notifications-off-outline" size={48} color="#a3a3a3" />
            <Text className="text-typography-400">{t('empty')}</Text>
          </VStack>
        }
      />
    </Screen>
  );
}
