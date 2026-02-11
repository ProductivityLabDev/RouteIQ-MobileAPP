import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  PressableAndroidRippleConfig,
  StyleProp,
  TextStyle,
  ViewStyle,
  Image,
  Pressable,
  Linking,
  ScrollView,
} from 'react-native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import AppButton from '../../components/AppButton';
import {hp, wp} from '../../utils/constants';
import {AppColors} from '../../utils/color';
import {size} from '../../utils/responsiveFonts';
import AppFonts from '../../utils/appFonts';
import AppInput from '../../components/AppInput';
import AppStyles from '../../styles/AppStyles';
import GlobalIcon from '../../components/GlobalIcon';
import {
  TabView,
  SceneMap,
  TabBar,
  NavigationState,
  Route,
  SceneRendererProps,
  TabBarIndicatorProps,
  TabBarItemProps,
} from 'react-native-tab-view';
import {Scene, Event} from 'react-native-tab-view/lib/typescript/src/types';
import {SelectList} from 'react-native-dropdown-select-list';
import {HighSchoolData, leaveDropdownData} from '../../utils/DummyData';
import AppBottomSheet from '../../components/AppBottomSheet';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import UploadDoc from '../../components/UploadDoc';
import AppDoc from '../../components/AppDoc';
import {Controller, useForm} from 'react-hook-form';
import CalendarPicker from '../../components/CalendarPicker';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  fetchQualifications,
  fetchEducationLevels,
  fetchEducationFields,
  addQualification,
} from '../../store/driver/driverSlices';
import DocumentPicker from 'react-native-document-picker';
import {getApiBaseUrl} from '../../utils/apiConfig';
import Toast from 'react-native-toast-message';

type PickedFile = { uri: string; name: string; type: string } | null;

export default function DriverQualifications() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.userSlices?.token);
  const qualifications = useAppSelector(
    state => state.driverSlices.qualifications,
  );
  const educationLevels = useAppSelector(
    state => state.driverSlices.educationLevels,
  );
  const educationFields = useAppSelector(
    state => state.driverSlices.educationFields,
  );
  const qualificationMutateStatus = useAppSelector(
    state => state.driverSlices.qualificationMutateStatus,
  );

  const [docUploaded, setDocUploaded] = useState(false);
  const [selectedCvFile, setSelectedCvFile] = useState<PickedFile>(null);
  const [selectedDocFile, setSelectedDocFile] = useState<PickedFile>(null);
  const [uploading, setUploading] = useState(false);
  const [isPickingFile, setIsPickingFile] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['34%', '90%'], []);
  const openSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const bottomSheetModalRef2 = useRef<BottomSheetModal>(null);
  const allowCloseSheet2Ref = useRef(false);
  const snapPoints2 = useMemo(() => ['90%'], []);
  const openSheet2 = useCallback(() => {
    allowCloseSheet2Ref.current = false;
    bottomSheetModalRef2.current?.present();
  }, []);
  const closeSheet2 = useCallback(() => {
    bottomSheetModalRef2.current?.close();
  }, []);
  const handleSheet2Changes = useCallback((index: number) => {
    if (index === -1 && !allowCloseSheet2Ref.current) {
      setTimeout(() => {
        bottomSheetModalRef2.current?.present();
      }, 60);
    }
  }, []);

  const bottomSheetModalRef3 = useRef<BottomSheetModal>(null);
  const snapPoints3 = useMemo(() => ['34%', '90%'], []);
  const openSheet3 = useCallback(() => {
    bottomSheetModalRef3.current?.present();
  }, []);
  const closeSheet3 = useCallback(() => {
    bottomSheetModalRef3.current?.close();
  }, []);

  const pickDocument = useCallback((forCv: boolean) => {
    setIsPickingFile(true);
    DocumentPicker.pick({
      type: (DocumentPicker as any).types?.allFiles ?? DocumentPicker.types.pdf,
      allowMultiSelection: false,
    })
      .then((res: any) => {
        const file = Array.isArray(res) ? res[0] : res;
        if (file?.uri && file?.name) {
          if (forCv) setSelectedCvFile({ uri: file.uri, name: file.name, type: file.type ?? '' });
          else setSelectedDocFile({ uri: file.uri, name: file.name, type: file.type ?? '' });
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsPickingFile(false);
        // Keep bottom sheet open after returning from picker.
        setTimeout(() => {
          if (forCv) {
            bottomSheetModalRef3.current?.present();
          } else {
            bottomSheetModalRef.current?.present();
          }
        }, 120);
      });
  }, []);

  const uploadDocument = useCallback(
    async (
      file: PickedFile,
      onSuccess: () => void,
      docType: 'education' | 'cv' = 'education',
    ) => {
      if (!file || !token) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Select a file first' });
        return;
      }
      setUploading(true);
      try {
        const levelIdFromState =
          selectedLevelIdRef.current != null &&
          !Number.isNaN(Number(selectedLevelIdRef.current))
            ? Number(selectedLevelIdRef.current)
            : null;
        const fieldIdFromState =
          selectedFieldIdRef.current != null &&
          !Number.isNaN(Number(selectedFieldIdRef.current))
            ? Number(selectedFieldIdRef.current)
            : null;

        const levelIdFromLabel = (() => {
          const opt = levelDropdownData.find(
            (x: {key: string; value: string}) =>
              x.value === selectedLevelLabelRef.current,
          );
          return opt?.key != null && !Number.isNaN(Number(opt.key))
            ? Number(opt.key)
            : null;
        })();
        const fieldIdFromLabel = (() => {
          const opt = fieldDropdownData.find(
            (x: {key: string; value: string}) =>
              x.value === selectedFieldLabelRef.current,
          );
          return opt?.key != null && !Number.isNaN(Number(opt.key))
            ? Number(opt.key)
            : null;
        })();

        const levelIdNum = levelIdFromState ?? levelIdFromLabel;
        const fieldIdNum = fieldIdFromState ?? fieldIdFromLabel;

        if (__DEV__) {
          console.log('🧭 Upload level/field resolution:', {
            selectedLevelId: selectedLevelIdRef.current,
            selectedFieldId: selectedFieldIdRef.current,
            selectedLevelLabel: selectedLevelLabelRef.current,
            selectedFieldLabel: selectedFieldLabelRef.current,
            levelIdFromState,
            fieldIdFromState,
            levelIdFromLabel,
            fieldIdFromLabel,
            finalLevelId: levelIdNum,
            finalFieldId: fieldIdNum,
          });
        }

        if (docType === 'education' && (levelIdNum == null || fieldIdNum == null)) {
          Toast.show({
            type: 'error',
            text1: 'Required',
            text2: 'Please select level and field first',
          });
          setUploading(false);
          return;
        }

        const formData = new FormData();
        const filePayload = {
          uri: file.uri,
          name: file.name,
          type: file.type || 'application/octet-stream',
        } as any;
        const baseUrl = getApiBaseUrl();

        // 1) Create qualification with JSON first (ensures numeric DTO validation passes).
        const createPayload = {
          qualificationType: docType === 'education' ? 'Educational' : 'Experience',
          qualificationLevel:
            selectedLevelLabel ||
            (docType === 'education' ? 'Educational' : 'Experience'),
          educationLevelId: levelIdNum != null ? Math.trunc(levelIdNum) : undefined,
          educationFieldId: fieldIdNum != null ? Math.trunc(fieldIdNum) : undefined,
          issueDate: new Date().toISOString(),
          expiryDate: null,
          issuingAuthority: docType === 'education' ? 'N/A' : null,
          status: 'Active',
          experienceDescription: null,
          yearsOfExperience: 0,
          companyName: null,
          jobTitle: docType === 'experience' ? 'Driver' : null,
          documentPath: null,
        };

        const createRes = await fetch(`${baseUrl}/driver/qualifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify(createPayload),
        });

        if (!createRes.ok) {
          const errorText = await createRes.text().catch(() => '');
          throw new Error(errorText || `Create qualification failed with status ${createRes.status}`);
        }

        const createData = await createRes.json().catch(() => null);
        const created =
          createData?.data && !Array.isArray(createData.data)
            ? createData.data
            : createData;
        let qualificationId =
          created?.QualificationId ??
          created?.qualificationId ??
          created?.id ??
          created?.Id ??
          null;

        // Some backend responses return only {ok, message}. Fallback: fetch list and resolve latest matching row.
        if (qualificationId == null) {
          const listRes = await fetch(`${baseUrl}/driver/qualifications`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });
          if (listRes.ok) {
            const listJson = await listRes.json().catch(() => null);
            const list = Array.isArray(listJson?.data)
              ? listJson.data
              : Array.isArray(listJson)
              ? listJson
              : [];

            const normalized = list
              .map((q: any) => ({
                raw: q,
                id:
                  q?.QualificationId ??
                  q?.qualificationId ??
                  q?.id ??
                  q?.Id ??
                  null,
                levelId:
                  q?.educationLevelId ??
                  q?.EducationLevelId ??
                  q?.levelId ??
                  q?.LevelId ??
                  null,
                fieldId:
                  q?.educationFieldId ??
                  q?.EducationFieldId ??
                  q?.fieldId ??
                  q?.FieldId ??
                  null,
                createdAt:
                  q?.createdAt ??
                  q?.CreatedAt ??
                  q?.created_at ??
                  q?.updatedAt ??
                  q?.UpdatedAt ??
                  null,
              }))
              .filter((x: any) => x.id != null);

            const matched = normalized.filter(
              (x: any) =>
                Number(x.levelId) === Number(levelIdNum) &&
                Number(x.fieldId) === Number(fieldIdNum),
            );

            const sorted = (matched.length ? matched : normalized).sort(
              (a: any, b: any) => {
                const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                if (tb !== ta) return tb - ta;
                return Number(b.id) - Number(a.id);
              },
            );

            qualificationId = sorted[0]?.id ?? null;
          }
        }

        // 2) Upload document on created qualification (PATCH multipart)
        if (qualificationId == null) {
          throw new Error('Qualification created but id missing in response');
        }

        formData.append('document', filePayload);
        const uploadRes = await fetch(
          `${baseUrl}/driver/qualifications/${qualificationId}`,
          {
            method: 'PATCH',
            headers: {Authorization: `Bearer ${token}`},
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text().catch(() => '');
          if (__DEV__) {
            console.warn(
              '❌ Qualification document upload failed:',
              uploadRes.status,
              errorText,
            );
          }
          throw new Error(errorText || `Upload failed with status ${uploadRes.status}`);
        }
        const successData = await uploadRes.json().catch(() => null);
        if (__DEV__) {
          console.log('✅ Qualification document upload success:', successData);
        }
        Toast.show({
          type: 'success',
          text1: 'Done',
          text2: 'Qualification + document uploaded',
        });
        onSuccess();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Upload failed. Try again.';
        if (__DEV__) {
          console.warn('❌ Qualification upload toast message:', msg);
        }
        Toast.show({ type: 'error', text1: 'Upload Error', text2: msg });
      } finally {
        setUploading(false);
      }
    },
    [
      token,
      selectedLevelId,
      selectedFieldId,
      selectedLevelLabel,
      selectedFieldLabel,
      levelDropdownData,
      fieldDropdownData,
    ],
  );

  const [selectAbsence, setSelectAbsence] = useState('');

  const [selected, setSelected] = useState(false);
  const [selected1, setSelected1] = useState(false);
  const [selected2, setSelected2] = useState(false);
  // Level & Field for qualification (Level dropdown → levelId → Field dropdown)
  const [selectedLevelId, setSelectedLevelId] = useState<number | string | null>(
    null,
  );
  const [selectedLevelLabel, setSelectedLevelLabel] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState<number | string | null>(
    null,
  );
  const [selectedFieldLabel, setSelectedFieldLabel] = useState('');
  const [showLevelOptions, setShowLevelOptions] = useState(false);
  const [showFieldOptions, setShowFieldOptions] = useState(false);
  const selectedLevelIdRef = useRef<number | string | null>(null);
  const selectedFieldIdRef = useRef<number | string | null>(null);
  const selectedLevelLabelRef = useRef('');
  const selectedFieldLabelRef = useRef('');

  React.useEffect(() => {
    dispatch(fetchQualifications());
    dispatch(fetchEducationLevels());
  }, [dispatch]);

  const qualificationDropdownData = useMemo(() => {
    const list = Array.isArray(qualifications) ? qualifications : [];
    return list.map((q: any) => {
      const id = q?.QualificationId ?? q?.qualificationId ?? q?.id ?? q?.Id ?? '';
      const label =
        q?.Name ??
        q?.name ??
        q?.QualificationName ??
        q?.qualificationName ??
        q?.Title ??
        q?.title ??
        q?.Degree ??
        q?.degree ??
        `Qualification ${id}`;
      return {key: String(id), value: String(label)};
    });
  }, [qualifications]);

  const uploadedDocs = useMemo(() => {
    const list = Array.isArray(qualifications) ? qualifications : [];
    return list
      .map((q: any) => {
        const rawPath =
          q?.documentPath ??
          q?.DocumentPath ??
          q?.document_url ??
          q?.DocumentURL ??
          '';
        const title =
          q?.qualificationLevel ??
          q?.QualificationLevel ??
          q?.qualificationType ??
          q?.QualificationType ??
          q?.FieldName ??
          q?.fieldName ??
          'Uploaded Document';
        const safePath = rawPath ? String(rawPath).trim() : '';
        const lowerPath = safePath.toLowerCase();
        const isValidDocumentPath =
          !!safePath &&
          safePath !== 'null' &&
          safePath !== 'undefined' &&
          safePath !== '-' &&
          safePath !== 'N/A' &&
          safePath !== 'n/a' &&
          (safePath.startsWith('http://') ||
            safePath.startsWith('https://') ||
            safePath.startsWith('file://') ||
            safePath.startsWith('content://'));
        const lower = lowerPath;
        const isImage =
          lower.endsWith('.png') ||
          lower.endsWith('.jpg') ||
          lower.endsWith('.jpeg') ||
          lower.endsWith('.webp');
        return {title: String(title), path: safePath, isImage, isValidDocumentPath};
      })
      .filter((x: any) => x?.isValidDocumentPath === true);
  }, [qualifications]);

  const experienceQualifications = useMemo(() => {
    const list = Array.isArray(qualifications) ? qualifications : [];
    return list.filter((q: any) => {
      const t = String(
        q?.qualificationType ?? q?.QualificationType ?? '',
      ).toLowerCase();
      return t === 'experience';
    });
  }, [qualifications]);

  React.useEffect(() => {
    if (!__DEV__) return;
    console.log('📋 qualifications list (screen):', qualifications);
    console.log('📎 uploadedDocs (mapped for UI):', uploadedDocs);
  }, [qualifications, uploadedDocs]);

  const levelDropdownData = useMemo(() => {
    const list = Array.isArray(educationLevels) ? educationLevels : [];
    return list.map((l: any, index: number) => {
      if (l != null && typeof l === 'string') {
        return {key: String(index), value: l};
      }
      const id = l?.LevelId ?? l?.levelId ?? l?.id ?? l?.Id ?? index;
      const label =
        l?.Name ??
        l?.name ??
        l?.LevelName ??
        l?.levelName ??
        l?.level_name ??
        l?.Title ??
        l?.title ??
        l?.label ??
        l?.text ??
        '';
      return {key: String(id), value: label ? String(label) : `Level ${id}`};
    });
  }, [educationLevels]);

  const fieldDropdownData = useMemo(() => {
    const list = Array.isArray(educationFields) ? educationFields : [];
    return list.map((f: any, index: number) => {
      if (f != null && typeof f === 'string') {
        return {key: String(index), value: f};
      }
      const id = f?.FieldId ?? f?.fieldId ?? f?.id ?? f?.Id ?? index;
      const label =
        f?.Name ??
        f?.name ??
        f?.FieldName ??
        f?.fieldName ??
        f?.field_name ??
        f?.Title ??
        f?.title ??
        f?.label ??
        f?.text ??
        '';
      return {key: String(id), value: label ? String(label) : `Field ${id}`};
    });
  }, [educationFields]);

  const onLevelSelect = useCallback(
    (value: string) => {
      setSelectedLevelLabel(value);
      selectedLevelLabelRef.current = value;
      setSelectedFieldId(null);
      selectedFieldIdRef.current = null;
      setSelectedFieldLabel('');
      selectedFieldLabelRef.current = '';
      const selectedOption = levelDropdownData.find(
        (opt: {key: string; value: string}) => opt.value === value,
      );
      const levelId =
        selectedOption?.key != null && !Number.isNaN(Number(selectedOption.key))
          ? Number(selectedOption.key)
          : selectedOption?.key ?? null;
      if (levelId != null) {
        setSelectedLevelId(levelId);
        selectedLevelIdRef.current = levelId;
        dispatch(fetchEducationFields(levelId));
      } else if (__DEV__) {
        console.warn('⚠️ Level selected but ID not resolved:', value);
      }
    },
    [levelDropdownData, dispatch],
  );

  const onFieldSelect = useCallback(
    (value: string) => {
      setSelectedFieldLabel(value);
      selectedFieldLabelRef.current = value;
      const selectedOption = fieldDropdownData.find(
        (opt: {key: string; value: string}) => opt.value === value,
      );
      const fieldId =
        selectedOption?.key != null && !Number.isNaN(Number(selectedOption.key))
          ? Number(selectedOption.key)
          : selectedOption?.key ?? null;
      setSelectedFieldId(fieldId);
      selectedFieldIdRef.current = fieldId;
      if (__DEV__ && fieldId == null) {
        console.warn('⚠️ Field selected but ID not resolved:', value);
      }
    },
    [fieldDropdownData],
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm({
    defaultValues: {
      jobtitle: '',
      startdate: '',
      enddate: '',
      description: '',
    },
  });

  const onSubmit = (data: {
    jobtitle: string;
    startdate: string;
    enddate: string;
    description: string;
  }) => {
    const levelIdNum =
      selectedLevelId != null && !Number.isNaN(Number(selectedLevelId))
        ? Number(selectedLevelId)
        : null;
    const fieldIdNum =
      selectedFieldId != null && !Number.isNaN(Number(selectedFieldId))
        ? Number(selectedFieldId)
        : null;

    if (levelIdNum == null || fieldIdNum == null) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please select level and field first',
      });
      return;
    }
    dispatch(
      addQualification({
        qualificationType: 'Experience',
        qualificationLevel: selectedLevelLabel || 'Experience',
        educationLevelId: Math.trunc(levelIdNum),
        educationFieldId: Math.trunc(fieldIdNum),
        issueDate: data.startdate ? new Date(data.startdate).toISOString() : null,
        expiryDate: data.enddate ? new Date(data.enddate).toISOString() : null,
        issuingAuthority: null,
        documentPath: null,
        status: 'Active',
        experienceDescription: data.description || null,
        yearsOfExperience: 0,
        companyName: null,
        jobTitle: data.jobtitle || null,
      }),
    )
      .unwrap()
      .then((res: any) => {
        if (__DEV__) {
          console.log('✅ Qualification save success response:', res);
        }
        allowCloseSheet2Ref.current = true;
        closeSheet2();
        dispatch(fetchQualifications());
      })
      .catch((err: any) => {
        if (__DEV__) {
          console.warn('❌ Qualification save error response:', err);
        }
        Toast.show({
          type: 'error',
          text1: 'Save Error',
          text2: typeof err === 'string' ? err : 'Could not save qualification',
        });
      });
  };

  const SecondRoute = () => (
    <View style={{justifyContent: 'space-between', flex: 1}}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={[styles.subContainer, {paddingBottom: hp(2)}]}
        showsVerticalScrollIndicator={true}>
        {experienceQualifications.length === 0 ? (
          <Text style={[AppStyles.title, {color: AppColors.textLightGrey}]}>
            No experience records yet.
          </Text>
        ) : (
          experienceQualifications.map((item: any, index: number) => {
            const title =
              item?.jobTitle ??
              item?.JobTitle ??
              item?.companyName ??
              item?.CompanyName ??
              'Experience';
            const desc =
              item?.experienceDescription ??
              item?.ExperienceDescription ??
              item?.description ??
              '';
            const issueDate = item?.issueDate ?? item?.IssueDate ?? '';
            return (
              <View style={styles.experienceContainer} key={`exp-${index}`}>
                <View style={styles.dotnDashContainer}>
                  <View style={styles.circle}>
                    <View style={styles.innerCircle}></View>
                  </View>
                  {index < experienceQualifications.length - 1 && (
                    <View style={styles.dashedLine}></View>
                  )}
                </View>

                <View style={styles.experienceInfoContainer}>
                  <Text
                    style={[
                      AppStyles.titleHead,
                      {fontSize: size.lg, alignSelf: 'flex-start'},
                    ]}>
                    {title}
                  </Text>
                  {desc ? (
                    <Text
                      style={[
                        AppStyles.title,
                        {fontFamily: AppFonts.NunitoSansLight, fontSize: size.default},
                      ]}>
                      {desc}
                    </Text>
                  ) : null}
                  <Text
                    style={[
                      AppStyles.title,
                      {
                        fontFamily: AppFonts.NunitoSansLight,
                        fontSize: size.s,
                        color: AppColors.dimGray,
                      },
                    ]}>
                    {issueDate ? String(issueDate).split('T')[0] : '—'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <AppButton
        title="Upload CV"
        onPress={() => openSheet3()}
        style={{
          width: '90%',
          backgroundColor: AppColors.red,
          height: hp(6),
          marginHorizontal: wp(7),
          alignSelf: 'center',
          marginTop: hp(1.5),
          marginBottom: hp(1.2),
        }}
        titleStyle={{
          fontSize: size.md,
        }}
      />

      <AppButton
        title="Add Experience"
        onPress={() => openSheet2()}
        style={{
          width: '90%',
          backgroundColor: AppColors.red,
          height: hp(6),
          marginHorizontal: wp(7),
          alignSelf: 'center',
          marginBottom: hp(1.5),
        }}
        titleStyle={{
          fontSize: size.md,
        }}
      />

      <AppBottomSheet
        bottomSheetModalRef={bottomSheetModalRef2}
        snapPoints={snapPoints2}
        handleSheetChanges={handleSheet2Changes}
        enablePanDownToClose={false}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={false}
        backdropComponent={({style}) => (
          <Pressable
            // Keep Add Experience sheet open while selecting dropdown values.
            onPress={() => {}}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}
          />
        )}>
        <View
          style={{
            backgroundColor: AppColors.white,
            paddingHorizontal: hp(2),
            paddingVertical: hp(2),
            borderTopRightRadius: hp(2),
            borderTopLeftRadius: hp(2),
          }}>
          <Text
            style={[
              AppStyles.titleHead,
              {fontSize: size.lg, marginBottom: hp(1.5)},
            ]}>
            Level
          </Text>
          <Pressable
            style={[styles.boxStyle, {marginBottom: hp(1)}]}
            onPress={() => {
              setShowFieldOptions(false);
              setShowLevelOptions(prev => !prev);
            }}>
            <Text style={styles.dropdownInputTxtStyle}>
              {selectedLevelLabel || 'Select your level'}
            </Text>
          </Pressable>
          {showLevelOptions && (
            <View style={styles.optionsBox}>
              <ScrollView nestedScrollEnabled style={{maxHeight: hp(22)}}>
                {levelDropdownData.map((opt: {key: string; value: string}) => (
                  <Pressable
                    key={`lvl-${opt.key}`}
                    style={styles.optionRow}
                    onPress={() => {
                      setSelectedLevelLabel(opt.value);
                      onLevelSelect(opt.value);
                      setShowLevelOptions(false);
                    }}>
                    <Text style={styles.optionText}>{opt.value}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          <Text
            style={[
              AppStyles.titleHead,
              {fontSize: size.lg, marginBottom: hp(1.5)},
            ]}>
            Field
          </Text>
          <Pressable
            style={[styles.boxStyle, {marginBottom: hp(1)}]}
            onPress={() => {
              setShowLevelOptions(false);
              setShowFieldOptions(prev => !prev);
            }}>
            <Text style={styles.dropdownInputTxtStyle}>
              {selectedFieldLabel || 'Select your field'}
            </Text>
          </Pressable>
          {showFieldOptions && (
            <View style={styles.optionsBox}>
              <ScrollView nestedScrollEnabled style={{maxHeight: hp(22)}}>
                {fieldDropdownData.map((opt: {key: string; value: string}) => (
                  <Pressable
                    key={`fld-${opt.key}`}
                    style={styles.optionRow}
                    onPress={() => {
                      setSelectedFieldLabel(opt.value);
                      onFieldSelect(opt.value);
                      setShowFieldOptions(false);
                    }}>
                    <Text style={styles.optionText}>{opt.value}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          <Controller
            name="jobtitle"
            control={control}
            rules={{required: 'Job Title is required'}}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <AppInput
                value={value}
                container={{
                  height: hp(6),
                  borderRadius: hp(0.5),
                  marginBottom: hp(2),
                }}
                label="Job Title"
                placeholder="Enter Job Title"
                onChangeText={(text: string) => onChange(text)}
                error={errors.jobtitle?.message}
                labelStyle={{
                  marginBottom: hp(2),
                  fontFamily: AppFonts.NunitoSansBold,
                }}
              />
            )}
          />

          <Controller
            name="startdate"
            control={control}
            rules={{required: 'Start Date is required'}}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <CalendarPicker
                selectedDate={value}
                setDates={(date: string) => onChange(date)}
                error={error?.message}
                label="Select Start Date"
              />
            )}
          />

          <Controller
            name="enddate"
            control={control}
            rules={{required: 'End Date is required'}}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <CalendarPicker
                selectedDate={value}
                setDates={(date: string) => onChange(date)}
                error={error?.message}
                label="Select End Date"
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{required: 'Description is required'}}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <AppInput
                multiline
                numberOfLines={7}
                container={{
                  height: hp(12),
                  borderRadius: hp(0.5),
                  marginBottom: hp(2),
                }}
                value={value}
                label="Description"
                placeholder="Descripton"
                onChangeText={(text: string) => onChange(text)}
                error={errors.description?.message}
                labelStyle={{
                  marginBottom: hp(2),
                  fontFamily: AppFonts.NunitoSansBold,
                }}
              />
            )}
          />

          <View style={[AppStyles.rowBetween, {width: '100%'}]}>
            <AppButton
              title="Cancel"
              onPress={() => {
                allowCloseSheet2Ref.current = true;
                closeSheet2();
              }}
              style={styles.backButton}
              titleStyle={{color: AppColors.textLightGrey}}
            />
            <AppButton
              title="Submit"
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
              loading={qualificationMutateStatus === 'loading'}
            />
          </View>
        </View>
      </AppBottomSheet>
    </View>
  );

  const FirstRoute = () => (
    <View style={{justifyContent: 'space-between', flex: 1}}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={[styles.subContainer, {paddingBottom: hp(2)}]}
        showsVerticalScrollIndicator={true}>
        <View
          style={{
            flexDirection: selectedLevelLabel ? 'row' : 'column',
            justifyContent: 'space-between',
            gap: hp(2),
          }}>
          <Text
            style={[
              AppStyles.titleHead,
              {fontSize: size.lg, alignSelf: 'flex-start'},
            ]}>
            Level
          </Text>

          {selectedLevelLabel ? (
            <Text
              style={[
                AppStyles.title,
                AppStyles.halfWidth,
                {verticalAlign: 'bottom'},
              ]}>
              {selectedLevelLabel}
            </Text>
          ) : (
            <SelectList
              search={false}
              setSelected={(val: string) => {
                setSelected1(val);
                onLevelSelect(val);
              }}
              data={levelDropdownData}
              save="value"
              placeholder="Select your level"
              boxStyles={styles.boxStyle}
              inputStyles={styles.dropdownInputTxtStyle}
              dropdownStyles={styles.dropdownMenuStyle}
              dropdownItemStyles={styles.dropdownItemStyle}
              dropdownTextStyles={styles.dropdownItemTxtStyle}
            />
          )}
        </View>

        <View
          style={{
            flexDirection: selectedFieldLabel ? 'row' : 'column',
            justifyContent: 'space-between',
            gap: hp(2),
          }}>
          <Text
            style={[
              AppStyles.titleHead,
              {fontSize: size.lg, alignSelf: 'flex-start'},
            ]}>
            Field
          </Text>

          {selectedFieldLabel ? (
            <Text
              style={[
                AppStyles.title,
                AppStyles.halfWidth,
                {verticalAlign: 'bottom'},
              ]}>
              {selectedFieldLabel}
            </Text>
          ) : (
            <SelectList
              search={false}
              setSelected={(val: string) => {
                setSelected2(val);
                onFieldSelect(val);
              }}
              data={fieldDropdownData}
              save="value"
              placeholder="Select your field"
              boxStyles={styles.boxStyle}
              inputStyles={styles.dropdownInputTxtStyle}
              dropdownStyles={styles.dropdownMenuStyle}
              dropdownItemStyles={styles.dropdownItemStyle}
              dropdownTextStyles={styles.dropdownItemTxtStyle}
            />
          )}
        </View>

        {uploadedDocs.length > 0 && (
          <>
            {uploadedDocs.length > 0 ? (
              uploadedDocs.map((doc: any, idx: number) => (
                <View key={`${doc.path || doc.title}-${idx}`}>
                  {doc.isImage && doc.path ? (
                    <View style={styles.previewCard}>
                      <Text style={styles.previewTitle}>{doc.title}</Text>
                      <Image
                        source={{uri: doc.path}}
                        resizeMode="cover"
                        style={styles.previewImage}
                      />
                    </View>
                  ) : null}
                  <AppDoc
                    containerStyle={{width: '100%'}}
                    title={doc.title}
                    showAttachment={!!doc.path}
                    onPress={
                      doc.path
                        ? () => {
                            Linking.openURL(doc.path).catch(() => {
                              Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Could not open document link',
                              });
                            });
                          }
                        : undefined
                    }
                  />
                </View>
              ))
            ) : null}
          </>
        )}
      </ScrollView>

      <AppButton
        title="Upload Documents"
        onPress={() => openSheet()}
        style={{
          // width: '100%',
          width: '90%',
          backgroundColor: AppColors.red,
          height: hp(6),
          marginHorizontal: wp(7),
          alignSelf: 'center',
          position: 'relative',
          top: -10,
        }}
        titleStyle={{
          fontSize: size.md,
        }}
      />

      <AppBottomSheet
        bottomSheetModalRef={bottomSheetModalRef3}
        snapPoints={snapPoints3}
        backdropComponent={({style}) => (
          <Pressable
            onPress={() => {
              if (isPickingFile) return;
              closeSheet3();
            }}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}
          />
        )}>
        <View style={AppStyles.center}>
          <View style={{width: '90%'}}>
            <Text
              style={[
                AppStyles.titleHead,
                {fontSize: size.lg, alignSelf: 'flex-start'},
              ]}>
              Upload CV
            </Text>

            <UploadDoc
              title="Tap and Upload Files"
              containerStyle={{
                marginHorizontal: hp(2),
                alignSelf: 'center',
                borderRadius: 15,
                backgroundColor: 'transparent',
              }}
              textStyle={{fontSize: size.default}}
              onPress={() => pickDocument(true)}
              selectedFileName={selectedCvFile?.name ?? null}
            />
          </View>

          <View style={[AppStyles.rowBetween, AppStyles.widthFullPercent]}>
            <AppButton
              title="Cancel"
              style={styles.backButton}
              titleStyle={{color: AppColors.textLightGrey}}
              onPress={() => {
                setSelectedCvFile(null);
                closeSheet3();
              }}
            />
            <AppButton
              title="Upload"
              style={styles.submitButton}
              onPress={() => {
                uploadDocument(selectedCvFile, () => {
                  setSelectedCvFile(null);
                  closeSheet3();
                  setDocUploaded(true);
                }, 'cv');
              }}
              loading={uploading}
            />
          </View>
        </View>
      </AppBottomSheet>

      <AppBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={({style}) => (
          <Pressable
            onPress={() => {
              if (isPickingFile) return;
              closeSheet();
            }}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}
          />
        )}>
        <View style={AppStyles.center}>
          <View style={{width: '90%'}}>
            <Text
              style={[
                AppStyles.titleHead,
                {fontSize: size.lg, alignSelf: 'flex-start'},
              ]}>
              Upload Documents
            </Text>

            <UploadDoc
              title="Tap and Upload Files"
              containerStyle={{
                marginHorizontal: hp(2),
                alignSelf: 'center',
                borderRadius: 15,
                backgroundColor: 'transparent',
              }}
              textStyle={{fontSize: size.default}}
              onPress={() => pickDocument(false)}
              selectedFileName={selectedDocFile?.name ?? null}
            />
          </View>

          <View style={[AppStyles.rowBetween, AppStyles.widthFullPercent]}>
            <AppButton
              title="Cancel"
              style={styles.backButton}
              titleStyle={{color: AppColors.textLightGrey}}
              onPress={() => {
                setSelectedDocFile(null);
                closeSheet();
              }}
            />
            <AppButton
              title="Upload"
              style={styles.submitButton}
              onPress={() => {
                uploadDocument(selectedDocFile, () => {
                  setSelectedDocFile(null);
                  closeSheet();
                  setDocUploaded(true);
                }, 'education');
              }}
              loading={uploading}
            />
          </View>
        </View>
      </AppBottomSheet>
    </View>
  );

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'Education'},
    {key: 'second', title: 'Experience'},
  ]);

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  const renderTabBar = (
    props: React.JSX.IntrinsicAttributes &
      SceneRendererProps & {
        navigationState: NavigationState<Route>;
        scrollEnabled?: boolean | undefined;
        bounces?: boolean | undefined;
        activeColor?: string | undefined;
        inactiveColor?: string | undefined;
        pressColor?: string | undefined;
        pressOpacity?: number | undefined;
        getLabelText?:
          | ((scene: Scene<Route>) => string | undefined)
          | undefined;
        getAccessible?:
          | ((scene: Scene<Route>) => boolean | undefined)
          | undefined;
        getAccessibilityLabel?:
          | ((scene: Scene<Route>) => string | undefined)
          | undefined;
        getTestID?: ((scene: Scene<Route>) => string | undefined) | undefined;
        renderLabel?:
          | ((
              scene: Scene<Route> & {focused: boolean; color: string},
            ) => React.ReactNode)
          | undefined;
        renderIcon?:
          | ((
              scene: Scene<Route> & {focused: boolean; color: string},
            ) => React.ReactNode)
          | undefined;
        renderBadge?: ((scene: Scene<Route>) => React.ReactNode) | undefined;
        renderIndicator?:
          | ((props: TabBarIndicatorProps<Route>) => React.ReactNode)
          | undefined;
        renderTabBarItem?:
          | ((
              props: TabBarItemProps<Route> & {key: string},
            ) => React.ReactElement<
              any,
              string | React.JSXElementConstructor<any>
            >)
          | undefined;
        onTabPress?: ((scene: Scene<Route> & Event) => void) | undefined;
        onTabLongPress?: ((scene: Scene<Route>) => void) | undefined;
        tabStyle?: StyleProp<ViewStyle>;
        indicatorStyle?: StyleProp<ViewStyle>;
        indicatorContainerStyle?: StyleProp<ViewStyle>;
        labelStyle?: StyleProp<TextStyle>;
        contentContainerStyle?: StyleProp<ViewStyle>;
        style?: StyleProp<ViewStyle>;
        gap?: number | undefined;
        testID?: string | undefined;
        android_ripple?: PressableAndroidRippleConfig | undefined;
      },
  ) => (
    <TabBar
      {...props}
      // pressColor={colors.blue}
      indicatorStyle={{backgroundColor: AppColors.red}}
      style={{
        paddingVertical: 0,
        backgroundColor: AppColors.white,
        height: hp(6),
        //  width: wp(100),
        margin: 0,
      }}
      labelStyle={[styles.subTitle]}
      activeColor={AppColors.red}
      inactiveColor="#666"
      renderLabel={({route, focused, color}) => (
        <Text
          style={[
            styles.subTitle,
            {
              padding: 0,
              backgroundColor: 'transparent',
              //  fontFamily: focused? AppFonts.NunitoSansBold : AppFonts.NunitoSansSemiBold,
              fontFamily: AppFonts.NunitoSansBold,
              color: focused ? AppColors.red : AppColors.black,
            },
          ]}>
          {route.title}
          {/* {route.title.split(' ').map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase()).join(' ')} */}
        </Text>
      )}
    />
  );

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.veryLightGrey}}>
      <AppHeader
        role="Driver"
        title={'Qualification'}
        enableBack={true}
        rightIcon={false}
      />

      <View style={styles.container}>
        <TabView
          style={{width: '100%'}}
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
          renderTabBar={renderTabBar}
        />
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  backButton: {width: '36%', backgroundColor: AppColors.screenColor},
  submitButton: {width: '60%'},
  dropdownButtonStyle: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: 12,
    marginVertical: hp(2),
    backgroundColor: AppColors.white,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: AppColors.grey,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#B1BDC8',
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
    textAlign: 'center',
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
    textAlign: 'center',
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    height: 150,
  },
  title: {
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.black,
    fontSize: size.default,
  },
  subTitle: {
    backgroundColor: AppColors.yellow,
    padding: hp(0.5),
    borderRadius: hp(1),
    color: AppColors.black,
    fontSize: size.s,
    fontFamily: AppFonts.NunitoSansMedium,
  },

  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
  },
  subContainer: {
    width: '100%',
    justifyContent: 'center',
    marginTop: hp(3),
    gap: hp(2),
    paddingHorizontal: wp(5),
  },
  uploadDocBox: {
    width: '100%',
    marginVertical: hp(3),
    marginTop: hp(2),
    height: hp(15),
    gap: hp(1),
    borderRadius: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: AppColors.red,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.veryLightPink,
  },

  tapText: {
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: size.s,
    lineHeight: 20,
    color: AppColors.red,
    alignSelf: 'center',
  },
  notifEach: {
    fontSize: size.default,
    fontFamily: AppFonts.NunitoSansSemiBold,
    padding: wp(0),
    height: hp(4),
    // width: wp(20),
    // borderBottomWidth: 1,
    textAlign: 'center',
    // color: colors.black,
    borderBottomColor: AppColors.red,
  },

  boxStyle: {
    width: '100%',
    marginBottom: hp(1.6),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    borderColor: AppColors.black,
    height: hp(6),
    borderRadius: hp(0.5),
    borderBottomColor: AppColors.black,
    borderWidth: 1,
  },
  dropdownMenuStyle: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.black,
    borderWidth: 1,
  },
  dropdownItemStyle: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  dropdownItemTxtStyle: {
    color: AppColors.black,
    fontSize: size.default,
  },
  dropdownInputTxtStyle: {
    color: AppColors.black,
    fontSize: size.default,
  },
  optionsBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: AppColors.lightGrey,
    borderRadius: hp(1),
    backgroundColor: AppColors.white,
    marginBottom: hp(2),
  },
  optionRow: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGrey,
  },
  optionText: {
    color: AppColors.black,
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: size.default,
  },
  circle: {
    width: hp(3),
    height: hp(3),
    borderWidth: 1,
    borderColor: AppColors.red,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerCircle: {
    width: hp(1.5),
    height: hp(1.5),
    backgroundColor: AppColors.red,
    borderRadius: 100,
  },
  dotnDashContainer: {
    marginTop: hp(0.2),
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dashedLine: {
    borderStyle: 'dashed',
    // height: '20%',
    flexGrow: 1,
    marginTop: hp(1.5),
    borderColor: AppColors.grey,
    borderWidth: 2,
    width: 0,
    // paddingBottom: hp(8),
    // marginBottom: hp(2)
  },
  experienceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: wp(6),
  },
  experienceInfoContainer: {
    width: wp(83),
    gap: hp(1),
    paddingBottom: hp(3),
  },
  previewCard: {
    width: '100%',
    backgroundColor: AppColors.white,
    borderRadius: hp(1),
    padding: hp(1.5),
    marginBottom: hp(1),
    elevation: 6,
  },
  previewTitle: {
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.black,
    marginBottom: hp(1),
  },
  previewImage: {
    width: '100%',
    height: hp(20),
    borderRadius: hp(1),
    backgroundColor: AppColors.lightGrey,
  },
});
