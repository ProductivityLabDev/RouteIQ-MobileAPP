import React, {useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {hp, wp} from '../../utils/constants';
import moment from 'moment';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppFonts from '../../utils/appFonts';
import AppButton from '../../components/AppButton';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {fetchRetailRFQList, fetchRetailDashboard, RFQItem} from '../../store/retailer/retailerSlice';

const STATUS_COLORS: Record<string, string> = {
  Accepted: '#2CD671',
  Reviewed: '#FED743',
  Declined: AppColors.red,
  Pending: '#2196F3',
  Completed: '#9E9E9E',
};

const RetailRFQ = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const rfqList = useAppSelector(state => state.retailerSlices.rfqList);
  const rfqListStatus = useAppSelector(state => state.retailerSlices.rfqListStatus);
  const dashboard = useAppSelector(state => state.retailerSlices.dashboard);

  useEffect(() => {
    dispatch(fetchRetailRFQList());
    dispatch(fetchRetailDashboard());
  }, [dispatch]);

  const pendingCount = dashboard?.stats?.pendingTrips ?? rfqList.filter(r => r.Status === 'Pending').length;
  const totalSpend = dashboard?.stats?.totalSpend ?? 0;

  const renderItem = ({item}: {item: RFQItem}) => {
    const color = STATUS_COLORS[item.Status] ?? AppColors.red;
    const canEdit = item.Status === 'Pending' || item.Status === 'Declined';
    return (
      <View style={[styles.rfqItem, {borderTopColor: color}]}>
        <View style={styles.rfqHeader}>
          <Text style={styles.rfqText}>{item.RequestNumber || `RFQ#${item.RequestId}`}</Text>
          <View style={[styles.statusBadge, {backgroundColor: color}]}>
            <Text style={styles.statusText}>{item.Status?.toUpperCase()}</Text>
          </View>
        </View>
        {item.PickupDate ? (
          <Text style={styles.dateText}>
            {moment(item.PickupDate).format('MMM D, YYYY')}
            {item.PickupTime ? ` • ${moment(item.PickupTime).format('h:mm A')}` : ''}
          </Text>
        ) : null}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => navigation.navigate('RetailDetail', {requestId: item.RequestId})}>
            <Text style={styles.actionText}>View Details</Text>
          </TouchableOpacity>
          {canEdit ? (
            <TouchableOpacity onPress={() => navigation.navigate('EditRetailDetail', {requestId: item.RequestId, rfq: item})}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          ) : item.Status === 'Accepted' ? (
            <TouchableOpacity onPress={() => navigation.navigate('RetailInvoice', {rfq: item})}>
              <Text style={styles.actionText}>View Invoice</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <AppLayout statusbackgroundColor={AppColors.red} style={{backgroundColor: AppColors.profileBg}}>
      <AppHeader role="Driver" title="RFQ" enableBack={false} rightIcon={true} switchIcon={false} />

      <View style={styles.tripView}>
        <View style={styles.tripBg}>
          <Text style={styles.tripNumber}>{pendingCount}</Text>
          <Text style={styles.tripText}>Pending</Text>
        </View>
        <View style={styles.tripBg}>
          <Text style={styles.tripNumber}>${totalSpend.toFixed(0)}</Text>
          <Text style={styles.tripText}>Spend</Text>
        </View>
      </View>

      {rfqListStatus === 'loading' ? (
        <ActivityIndicator color={AppColors.red} size="large" style={{marginTop: hp(4)}} />
      ) : (
        <FlatList
          data={rfqList}
          keyExtractor={item => String(item.RequestId)}
          renderItem={renderItem}
          onRefresh={() => {
            dispatch(fetchRetailRFQList());
            dispatch(fetchRetailDashboard());
          }}
          refreshing={rfqListStatus === 'loading'}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No RFQs found</Text>
          }
        />
      )}

      <View style={styles.btnView}>
        <AppButton
          title="New Request for Quote"
          onPress={() => navigation.navigate('RetailRequestQuote')}
          style={styles.QuoteBtn}
        />
      </View>
    </AppLayout>
  );
};

export default RetailRFQ;

const styles = StyleSheet.create({
  tripView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tripBg: {
    backgroundColor: AppColors.white,
    width: '35%',
    padding: 6,
    borderRadius: 10,
    marginTop: hp(2),
  },
  tripNumber: {
    color: AppColors.red,
    fontSize: 24,
    fontFamily: AppFonts.NunitoSansBold,
    textAlign: 'center',
  },
  tripText: {
    color: AppColors.red,
    fontSize: 16,
    fontFamily: AppFonts.NunitoSansBold,
    textAlign: 'center',
  },
  rfqItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: AppColors.white,
    marginTop: hp(1.5),
    borderRadius: 4,
    borderTopWidth: 2,
  },
  rfqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rfqText: {
    fontSize: 14,
    color: AppColors.lightBlack,
    fontFamily: AppFonts.NunitoSansRegular,
  },
  dateText: {
    fontSize: 12,
    color: AppColors.inputGrey,
    fontFamily: AppFonts.NunitoSansRegular,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: wp(22),
  },
  statusText: {
    color: AppColors.black,
    fontSize: 9,
    fontFamily: AppFonts.NunitoSansMedium,
    lineHeight: 11,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  actionText: {
    color: AppColors.red,
    fontSize: 14,
    fontFamily: AppFonts.NunitoSansRegular,
  },
  btnView: {
    padding: 10,
  },
  QuoteBtn: {
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: hp(4),
    color: AppColors.inputGrey,
    fontFamily: AppFonts.NunitoSansRegular,
  },
});
