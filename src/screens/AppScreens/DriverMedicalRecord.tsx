import {BottomSheetModal} from '@gorhom/bottom-sheet';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Linking, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import AppBottomSheet from '../../components/AppBottomSheet';
import AppButton from '../../components/AppButton';
import AppDoc from '../../components/AppDoc';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import UploadDoc from '../../components/UploadDoc';
import AppLayout from '../../layout/AppLayout';
import {useAppSelector} from '../../store/hooks';
import AppStyles from '../../styles/AppStyles';
import AppFonts from '../../utils/appFonts';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {size} from '../../utils/responsiveFonts';
import {getApiBaseUrl} from '../../utils/apiConfig';
import {showErrorToast, showSuccessToast} from '../../utils/toast';
import CalendarPicker from '../../components/CalendarPicker';

type PickedFile = {uri: string; name: string; type: string} | null;

export default function DriverMedicalRecord() {
  const token = useAppSelector(state => state.userSlices.token);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['90%'], []);
  const openSheet = useCallback(() => bottomSheetModalRef.current?.present(), []);
  const closeSheet = useCallback(() => bottomSheetModalRef.current?.close(), []);

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [recordType, setRecordType] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<PickedFile>(null);

  const fetchMedicalRecords = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/driver/medical-records`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        showErrorToast('Error', errorText || 'Failed to fetch medical records');
        return;
      }
      const data = await response.json().catch(() => null);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setRecords(list);
    } catch (e) {
      showErrorToast('Error', 'Network error while fetching medical records');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMedicalRecords();
  }, [fetchMedicalRecords]);

  const pickDocument = useCallback(() => {
    DocumentPicker.pick({
      type: (DocumentPicker as any).types?.allFiles ?? DocumentPicker.types.pdf,
      allowMultiSelection: false,
    })
      .then((res: any) => {
        const file = Array.isArray(res) ? res[0] : res;
        if (file?.uri && file?.name) {
          setSelectedFile({
            uri: file.uri,
            name: file.name,
            type: file.type ?? 'application/octet-stream',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateMedicalRecord = useCallback(async () => {
    if (!token) {
      showErrorToast('Error', 'Not authenticated');
      return;
    }
    if (!recordType.trim() || !recordDate.trim()) {
      showErrorToast('Required', 'Record Type and Record Date are required');
      return;
    }
    setSaving(true);
    try {
      const baseUrl = getApiBaseUrl();
      const endpoint = `${baseUrl}/driver/medical-records`;
      let response: Response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('recordType', recordType.trim());
        formData.append('recordDate', recordDate.trim());
        if (expiryDate.trim()) formData.append('expiryDate', expiryDate.trim());
        if (doctorName.trim()) formData.append('doctorName', doctorName.trim());
        if (clinicName.trim()) formData.append('clinicName', clinicName.trim());
        if (notes.trim()) formData.append('notes', notes.trim());
        formData.append('status', 'Active');
        formData.append(
          'document',
          {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: selectedFile.type,
          } as any,
        );

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {Authorization: `Bearer ${token}`},
          body: formData,
        });
      } else {
        const body: any = {
          recordType: recordType.trim(),
          recordDate: recordDate.trim(),
          status: 'Active',
        };
        if (expiryDate.trim()) body.expiryDate = expiryDate.trim();
        if (doctorName.trim()) body.doctorName = doctorName.trim();
        if (clinicName.trim()) body.clinicName = clinicName.trim();
        if (notes.trim()) body.notes = notes.trim();

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
        showErrorToast('Create Failed', errorText || 'Could not add medical record');
        return;
      }

      showSuccessToast('Added', 'Medical record added');
      setRecordType('');
      setRecordDate('');
      setExpiryDate('');
      setDoctorName('');
      setClinicName('');
      setNotes('');
      setSelectedFile(null);
      closeSheet();
      fetchMedicalRecords();
    } catch (e) {
      showErrorToast('Error', 'Network error while adding medical record');
    } finally {
      setSaving(false);
    }
  }, [
    token,
    recordType,
    recordDate,
    expiryDate,
    doctorName,
    clinicName,
    notes,
    selectedFile,
    closeSheet,
    fetchMedicalRecords,
  ]);

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.profileBg}}>
      <AppHeader
        role="Driver"
        title={'Medical Record'}
        enableBack={true}
        rightIcon={false}
      />

      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <ScrollView contentContainerStyle={styles.listContainer}>
          {loading ? (
            <Text style={[AppStyles.title, {textAlign: 'center'}]}>Loading...</Text>
          ) : records.length === 0 ? (
            <Text style={[AppStyles.title, {textAlign: 'center'}]}>
              No medical records yet.
            </Text>
          ) : (
            records.map((item: any, idx: number) => {
              const title =
                item?.RecordType ?? item?.recordType ?? `Medical Record ${idx + 1}`;
              const path = item?.DocumentPath ?? item?.documentPath ?? '';
              return (
                <AppDoc
                  key={String(item?.MedicalRecordId ?? item?.id ?? idx)}
                  title={String(title)}
                  containerStyle={{width: '90%', alignSelf: 'center'}}
                  showAttachment={!!path}
                  onPress={
                    path
                      ? () =>
                          Linking.openURL(String(path)).catch(() =>
                            showErrorToast(
                              'Error',
                              'Could not open medical document',
                            ),
                          )
                      : undefined
                  }
                />
              );
            })
          )}
        </ScrollView>

        <AppButton
          title={'Add Details'}
          style={{width: '90%', alignSelf: 'center', marginBottom: hp(2)}}
          onPress={openSheet}
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.sheetContent}>
          <AppInput
            value={recordType}
            onChangeText={setRecordType}
            container={{height: hp(6), borderRadius: hp(0.5), marginBottom: hp(2)}}
            label="Record Type"
            placeholder="Example: Annual Checkup"
            labelStyle={{marginBottom: hp(2), fontFamily: AppFonts.NunitoSansBold}}
          />

          <CalendarPicker
            selectedDate={recordDate}
            setDates={(d: string) => setRecordDate(d)}
            label="Record Date"
          />
          <CalendarPicker
            selectedDate={expiryDate}
            setDates={(d: string) => setExpiryDate(d)}
            label="Expiry Date (optional)"
          />

          <AppInput
            value={doctorName}
            onChangeText={setDoctorName}
            container={{height: hp(6), borderRadius: hp(0.5), marginBottom: hp(2)}}
            label="Doctor Name"
            placeholder="Dr. Ahmed"
            labelStyle={{marginBottom: hp(2), fontFamily: AppFonts.NunitoSansBold}}
          />

          <AppInput
            value={clinicName}
            onChangeText={setClinicName}
            container={{height: hp(6), borderRadius: hp(0.5), marginBottom: hp(2)}}
            label="Clinic Name"
            placeholder="City Clinic"
            labelStyle={{marginBottom: hp(2), fontFamily: AppFonts.NunitoSansBold}}
          />

          <AppInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            container={{
              height: hp(12),
              borderRadius: hp(0.5),
              marginBottom: hp(2),
            }}
            label="Notes"
            placeholder="Notes"
            labelStyle={{marginBottom: hp(2), fontFamily: AppFonts.NunitoSansBold}}
          />

          <UploadDoc
            title="Tap and Upload Files"
            selectedFileName={selectedFile?.name ?? null}
            onPress={pickDocument}
            containerStyle={styles.uploadDocBox}
            textStyle={styles.tapText}
          />

          <View style={[AppStyles.rowBetween, {width: '100%', marginTop: hp(0.5)}]}>
            <AppButton
              title="Cancel"
              onPress={() => closeSheet()}
              style={styles.cancelButton}
              titleStyle={{color: AppColors.textLightGrey}}
            />
            <AppButton
              title={saving ? 'Submitting...' : 'Submit'}
              onPress={handleCreateMedicalRecord}
              style={styles.submitButton}
              loading={saving}
            />
          </View>
        </ScrollView>
      </AppBottomSheet>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: hp(2),
    gap: hp(2),
  },
  uploadDocBox: {
    width: '100%',
    marginVertical: hp(1.5),
    height: hp(12),
    borderRadius: hp(1),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: AppColors.red,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.white,
  },
  sheetContent: {
    backgroundColor: AppColors.white,
    paddingHorizontal: hp(2),
    paddingVertical: hp(2),
    borderTopRightRadius: hp(2),
    borderTopLeftRadius: hp(2),
    paddingBottom: hp(5),
  },
  tapText: {
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: size.s,
    color: AppColors.red,
  },
  cancelButton: {width: '35%', backgroundColor: AppColors.lightGrey},
  submitButton: {width: '60%', backgroundColor: AppColors.red},
});