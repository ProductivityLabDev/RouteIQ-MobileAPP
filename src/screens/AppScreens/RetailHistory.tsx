import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import {AppColors} from '../../utils/color';
import {Menu, MenuOptions, MenuOption, MenuTrigger} from 'react-native-popup-menu';
import GlobalIcon from '../../components/GlobalIcon';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {fetchRetailHistory, RFQItem} from '../../store/retailer/retailerSlice';
import AppFonts from '../../utils/appFonts';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';

const RetailHistory = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');

  const history = useAppSelector(state => state.retailerSlices.history);
  const historyStatus = useAppSelector(state => state.retailerSlices.historyStatus);

  useEffect(() => {
    console.log('[RetailHistory] mount | historyStatus:', historyStatus, '| history.length:', history.length);
    dispatch(fetchRetailHistory());
  }, [dispatch]);

  const filtered = history.filter(item =>
    !search ||
    (item.RequestNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (item.PickupLocation ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({item}: {item: RFQItem}) => {
    const daysAgo = item.CreatedAt
      ? moment(item.CreatedAt).fromNow()
      : '';
    const isRecent = item.CreatedAt
      ? moment().diff(moment(item.CreatedAt), 'days') <= 1
      : false;

    return (
      <TouchableOpacity
        style={[styles.card, isRecent && styles.redCard]}
        onPress={() => navigation.navigate('RetailDetail', {requestId: item.RequestId})}>
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.tripText}>{item.RequestNumber || `Trip #${item.RequestId}`}</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.PickupLocation}
              {item.DestinationLocation ? ` → ${item.DestinationLocation}` : ''}
            </Text>
            {item.QuotedAmount != null && (
              <Text style={styles.priceText}>${item.QuotedAmount}</Text>
            )}
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Text style={styles.dateText}>{daysAgo}</Text>
            <View style={[styles.statusBadge, {backgroundColor: item.Status === 'Completed' ? '#2CD671' : AppColors.inputGrey}]}>
              <Text style={styles.statusText}>{item.Status}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.white}}>
      <AppHeader
        role="Retail"
        title="History"
        enableBack={true}
        rightIcon={false}
        createRightIcon={
          <Menu>
            <MenuTrigger>
              <View style={styles.icon}>
                <GlobalIcon
                  library="Entypo"
                  name="dots-three-vertical"
                  color={AppColors.white}
                  size={hp(3)}
                />
              </View>
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={styles.menuOptions}>
              <MenuOption onSelect={() => dispatch(fetchRetailHistory())}>
                <Text style={AppStyles.title}>Refresh</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        }
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trips..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {historyStatus === 'loading' && history.length === 0 ? (
          <ActivityIndicator color={AppColors.red} size="large" style={{marginTop: hp(4)}} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => String(item.RequestId)}
            renderItem={renderItem}
            onRefresh={() => dispatch(fetchRetailHistory())}
            refreshing={historyStatus === 'loading'}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {search ? 'No results found' : 'No trip history'}
              </Text>
            }
          />
        )}
      </View>
    </AppLayout>
  );
};

export default RetailHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f2e8',
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: {marginRight: 5},
  searchInput: {flex: 1, paddingVertical: hp(2)},
  card: {
    backgroundColor: '#f5f2e8',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  redCard: {backgroundColor: '#f8d7da'},
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripText: {fontSize: 15, fontFamily: AppFonts.NunitoSansBold, color: AppColors.lightBlack},
  locationText: {
    fontSize: 12,
    color: AppColors.inputGrey,
    fontFamily: AppFonts.NunitoSansRegular,
    marginTop: 2,
    maxWidth: 200,
  },
  priceText: {
    color: AppColors.red,
    fontSize: 15,
    fontFamily: AppFonts.NunitoSansBold,
    marginTop: 2,
  },
  dateText: {color: '#888', fontSize: 12, fontFamily: AppFonts.NunitoSansRegular},
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  statusText: {color: AppColors.white, fontSize: 10, fontFamily: AppFonts.NunitoSansMedium},
  icon: {padding: hp(1)},
  menuOptions: {
    marginTop: hp(2.5),
    marginLeft: hp(-2.4),
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 5,
    paddingHorizontal: hp(1),
    paddingVertical: hp(1.5),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: hp(4),
    color: AppColors.inputGrey,
    fontFamily: AppFonts.NunitoSansRegular,
  },
});
