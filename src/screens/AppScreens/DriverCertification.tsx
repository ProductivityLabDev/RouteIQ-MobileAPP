import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import AppLayout from '../../layout/AppLayout';
import {AppColors} from '../../utils/color';
import AppHeader from '../../components/AppHeader';
import {hp, wp} from '../../utils/constants';
import AppStyles from '../../styles/AppStyles';
import AppFonts from '../../utils/appFonts';
import {size} from '../../utils/responsiveFonts';
import AppDoc from '../../components/AppDoc';
import AppButton from '../../components/AppButton';
import AppBottomSheet from '../../components/AppBottomSheet';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import UploadDoc from '../../components/UploadDoc';
import AppInput from '../../components/AppInput';
import CalendarPicker from '../../components/CalendarPicker';
import DocumentPicker from 'react-native-document-picker';
import {getApiBaseUrl} from '../../utils/apiConfig';
import {showErrorToast, showSuccessToast} from '../../utils/toast';
import {useAppSelector} from '../../store/hooks';

type PickedFile = {uri: string; name: string; type: string} | null;

export default function DriverCertification() {
  const token = useAppSelector(state => state.userSlices.token);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PickedFile>(null);

  const [certificationType, setCertificationType] = useState('');
  const [certificationNumber, setCertificationNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['90%'], []);
  const openSheet = useCallback(() => bottomSheetModalRef.current?.present(), []);
  const closeSheet = useCallback(() => bottomSheetModalRef.current?.close(), []);

  const fetchCertifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/driver/certifications`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        showErrorToast('Error', errorText || 'Failed to load certifications');
        return;
      }
      const data = await response.json().catch(() => null);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setCertifications(list);
    } catch (e) {
      showErrorToast('Error', 'Network error while loading certifications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  const pickDocument = useCallback(() => {
    DocumentPicker.pick({
      type: (DocumentPicker as any).types?.allFiles ?? DocumentPicker.types.pdf,
      allowMultiSelection: false,
    })
      .then((res: any) => {
        const file = Array.isArray(res) ? res[0] : res;
        if (file?.uri && file?.name) {
          setSelectedFile({uri: file.uri, name: file.name, type: file.type ?? ''});
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateCertification = useCallback(async () => {
    if (!token) {
      showErrorToast('Error', 'Not authenticated');
      return;
    }
    if (!certificationType.trim() || !certificationNumber.trim() || !issueDate.trim()) {
      showErrorToast('Required', 'Type, Number and Issue Date are required');
      return;
    }
    setSaving(true);
    try {
      const baseUrl = getApiBaseUrl();
      const endpoint = `${baseUrl}/driver/certifications`;
      let response: Response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append(
          'document',
          {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: selectedFile.type || 'application/octet-stream',
          } as any,
        );
        formData.append('certificationType', certificationType.trim());
        formData.append('certificationNumber', certificationNumber.trim());
        formData.append('issueDate', issueDate.trim());
        if (expiryDate.trim()) formData.append('expiryDate', expiryDate.trim());
        if (issuingAuthority.trim())
          formData.append('issuingAuthority', issuingAuthority.trim());
        formData.append('status', 'Active');

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {Authorization: `Bearer ${token}`},
          body: formData,
        });
      } else {
        const body: any = {
          certificationType: certificationType.trim(),
          certificationNumber: certificationNumber.trim(),
          issueDate: issueDate.trim(),
          status: 'Active',
        };
        if (expiryDate.trim()) body.expiryDate = expiryDate.trim();
        if (issuingAuthority.trim()) body.issuingAuthority = issuingAuthority.trim();
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        });
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        showErrorToast('Create Failed', errorText || 'Could not create certification');
        return;
      }

      showSuccessToast('Added', 'Certification added');
      setCertificationType('');
      setCertificationNumber('');
      setIssueDate('');
      setExpiryDate('');
      setIssuingAuthority('');
      setSelectedFile(null);
      closeSheet();
      fetchCertifications();
    } catch (e) {
      showErrorToast('Error', 'Network error while creating certification');
    } finally {
      setSaving(false);
    }
  }, [
    token,
    certificationType,
    certificationNumber,
    issueDate,
    expiryDate,
    issuingAuthority,
    selectedFile,
    closeSheet,
    fetchCertifications,
  ]);

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.profileBg}}>
      <AppHeader
        role="Driver"
        title="Certification"
        enableBack={true}
        rightIcon={false}
      />

      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{paddingVertical: hp(2), gap: hp(2)}}>
          {loading ? (
            <ActivityIndicator size="large" color={AppColors.red} />
          ) : certifications.length === 0 ? (
            <Text style={[AppStyles.title, {textAlign: 'center'}]}>
              No certifications yet.
            </Text>
          ) : (
            certifications.map((item: any, idx: number) => {
              const title =
                item?.CertificationType ??
                item?.certificationType ??
                `Certification ${idx + 1}`;
              const path = item?.DocumentPath ?? item?.documentPath ?? '';
              return (
                <AppDoc
                  key={String(item?.CertificationId ?? item?.id ?? idx)}
                  title={String(title)}
                  containerStyle={{width: '90%', alignSelf: 'center'}}
                  showAttachment={!!path}
                  onPress={
                    path
                      ? () => {
                          Linking.openURL(String(path)).catch(() =>
                            showErrorToast(
                              'Error',
                              'Could not open certification document',
                            ),
                          );
                        }
                      : undefined
                  }
                />
              );
            })
          )}
        </ScrollView>

        <AppButton
          title="Upload Documents"
          onPress={openSheet}
          style={{
            width: '90%',
            backgroundColor: AppColors.red,
            height: hp(6),
            marginHorizontal: wp(7),
            alignSelf: 'center',
            marginBottom: hp(1.5),
          }}
          titleStyle={{fontSize: size.md}}
        />
      </View>

      <AppBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backdropComponent={({style}) => (
          <Pressable
            onPress={() => {}}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}
          />
        )}>
        <View style={{paddingHorizontal: hp(2), paddingVertical: hp(2)}}>
          <Text style={[AppStyles.titleHead, {fontSize: size.lg}]}>
            Add Certification
          </Text>

          <AppInput
            value={certificationType}
            onChangeText={setCertificationType}
            placeholder="Certification Type"
            container={styles.inputContainer}
            inputStyle={styles.inputStyle}
          />
          <AppInput
            value={certificationNumber}
            onChangeText={setCertificationNumber}
            placeholder="Certification Number"
            container={styles.inputContainer}
            inputStyle={styles.inputStyle}
          />
          <CalendarPicker
            selectedDate={issueDate}
            setDates={(d: string) => setIssueDate(d)}
            label="Issue Date"
          />
          <CalendarPicker
            selectedDate={expiryDate}
            setDates={(d: string) => setExpiryDate(d)}
            label="Expiry Date (optional)"
          />
          <AppInput
            value={issuingAuthority}
            onChangeText={setIssuingAuthority}
            placeholder="Issuing Authority"
            container={styles.inputContainer}
            inputStyle={styles.inputStyle}
          />

          <UploadDoc
            title="Tap and Upload Files"
            onPress={pickDocument}
            selectedFileName={selectedFile?.name ?? null}
            containerStyle={styles.uploadDocBox}
            textStyle={styles.tapText}
          />

          <View style={[AppStyles.rowBetween, AppStyles.widthFullPercent]}>
            <AppButton
              title="Cancel"
              style={styles.backButton}
              titleStyle={{color: AppColors.textLightGrey}}
              onPress={() => {
                setSelectedFile(null);
                closeSheet();
              }}
            />
            <AppButton
              title={saving ? 'Saving...' : 'Upload'}
              style={styles.submitButton}
              onPress={handleCreateCertification}
              loading={saving}
            />
          </View>
        </View>
      </AppBottomSheet>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  uploadDocBox: {
    width: '100%',
    marginVertical: hp(2),
    height: hp(14),
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: AppColors.red,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  tapText: {
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: size.s,
    color: AppColors.red,
    alignSelf: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: AppColors.graySuit,
    borderRadius: 8,
    marginTop: hp(1.2),
  },
  inputStyle: {
    color: AppColors.black,
  },
  backButton: {width: '36%', backgroundColor: AppColors.screenColor},
  submitButton: {width: '60%'},
});