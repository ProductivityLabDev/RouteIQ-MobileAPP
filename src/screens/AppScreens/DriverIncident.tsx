import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  PressableAndroidRippleConfig,
  StyleProp,
  TextStyle,
  ViewStyle,
  ScrollView,
  Pressable,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
  TabBar,
  NavigationState,
  Route,
  SceneRendererProps,
  TabBarIndicatorProps,
  TabBarItemProps,
} from 'react-native-tab-view';
import {useNavigation} from '@react-navigation/native';
import AppDropdown from '../../components/AppDropDown';
import UploadDoc from '../../components/UploadDoc';
import DocumentPicker from 'react-native-document-picker';
import {useAppSelector} from '../../store/hooks';
import {getApiBaseUrl} from '../../utils/apiConfig';
import {showErrorToast, showSuccessToast} from '../../utils/toast';
import moment from 'moment';

const sentToData = [
  {label: 'School', value: 'school'},
  {label: 'Vendor', value: 'vendor'},
  {label: 'Parent', value: 'parent'},
  {label: 'All', value: 'all'},
];

// --- Routes ---
const FirstRoute = ({
  sentTo,
  setSentTo,
  description,
  setDescription,
  selectedFileName,
  onPickAttachment,
  incidents,
}: {
  sentTo: string;
  setSentTo: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  selectedFileName: string | null;
  onPickAttachment: () => void;
  incidents: any[];
}) => (
  <ScrollView contentContainerStyle={styles.subContainer}>
    <AppDropdown
      label="Sent To"
      labelStyle={AppStyles.title}
      placeholder="Select"
      data={sentToData}
      value={sentTo}
      onChangeText={setSentTo}
      style={styles.dropdown}
    />
    <AppInput
      value={description}
      multiline
      numberOfLines={11}
      container={{
        height: hp(25),
        borderRadius: hp(0.5),
        marginBottom: hp(2),
        borderColor: AppColors.grey,
      }}
      label="Description"
      placeholder="Report Accident Details here..."
      placeholderTextColor={AppColors.black}
      onChangeText={setDescription}
      labelStyle={{
        marginBottom: hp(2),
        fontFamily: AppFonts.NunitoSansBold,
      }}
    />
    <View style={{width: '100%', alignSelf: 'center', marginBottom: hp(2)}}>
      <Text
        style={[
          AppStyles.titleHead,
          {fontSize: size.lg, alignSelf: 'flex-start'},
        ]}>
        Attachments
      </Text>
      <UploadDoc
        title="Tap and Upload Files/Picture"
        selectedFileName={selectedFileName}
        onPress={onPickAttachment}
        containerStyle={styles.uploadDocBox}
        textStyle={styles.tapText}
      />
    </View>

    <View style={{width: '100%', marginTop: hp(1), marginBottom: hp(2)}}>
      <Text style={[AppStyles.titleHead, {fontSize: size.lg}]}>
        Recent Incidents
      </Text>
      {incidents.length === 0 ? (
        <Text style={[AppStyles.title, {color: AppColors.textLightGrey}]}>
          No incidents reported yet.
        </Text>
      ) : (
        incidents.slice(0, 5).map((item: any, idx: number) => (
          <View key={`acc-${idx}`} style={styles.incidentCard}>
            <Text style={styles.incidentTitle}>
              {item?.IncidentType ?? item?.incidentType ?? 'accident'}
            </Text>
            <Text style={styles.incidentDesc}>
              {item?.Description ?? item?.description ?? '—'}
            </Text>
          </View>
        ))
      )}
    </View>
  </ScrollView>
);

const SecondRoute = ({
  sentTo,
  setSentTo,
  selectStudent,
  setSelectStudent,
  studentOptions,
  description,
  setDescription,
  selectedFileName,
  onPickAttachment,
  incidents,
}: {
  sentTo: string;
  setSentTo: React.Dispatch<React.SetStateAction<string>>;
  selectStudent: string;
  setSelectStudent: React.Dispatch<React.SetStateAction<string>>;
  studentOptions: {label: string; value: string}[];
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  selectedFileName: string | null;
  onPickAttachment: () => void;
  incidents: any[];
}) => (
  <ScrollView contentContainerStyle={styles.subContainer}>
    <AppDropdown
      label="Select Student"
      labelStyle={AppStyles.title}
      placeholder="Select"
      data={studentOptions}
      value={selectStudent}
      onChangeText={setSelectStudent}
      style={styles.dropdown}
    />
    <AppDropdown
      label="Sent To"
      labelStyle={AppStyles.title}
      placeholder="Select"
      data={sentToData}
      value={sentTo}
      onChangeText={setSentTo}
      style={styles.dropdown}
    />
    <AppInput
      value={description}
      multiline
      numberOfLines={11}
      container={{
        height: hp(25),
        borderRadius: hp(0.5),
        marginBottom: hp(4),
        borderColor: AppColors.grey,
      }}
      label="Description"
      placeholder="Report Accident Details here..."
      inputStyle={{fontFamily: AppFonts.NunitoSansMedium}}
      onChangeText={setDescription}
      labelStyle={{
        marginBottom: hp(2),
        fontFamily: AppFonts.NunitoSansBold,
      }}
    />
    <View style={{width: '100%', alignSelf: 'center', marginBottom: hp(2)}}>
      <Text
        style={[
          AppStyles.titleHead,
          {fontSize: size.lg, alignSelf: 'flex-start'},
        ]}>
        Attachments
      </Text>
      <UploadDoc
        title="Tap and Upload Files/Picture"
        selectedFileName={selectedFileName}
        onPress={onPickAttachment}
        containerStyle={styles.uploadDocBox}
        textStyle={styles.tapText}
      />
    </View>

    <View style={{width: '100%', marginTop: hp(1), marginBottom: hp(2)}}>
      <Text style={[AppStyles.titleHead, {fontSize: size.lg}]}>
        Recent Disciplinary Reports
      </Text>
      {incidents.length === 0 ? (
        <Text style={[AppStyles.title, {color: AppColors.textLightGrey}]}>
          No disciplinary reports yet.
        </Text>
      ) : (
        incidents.slice(0, 5).map((item: any, idx: number) => (
          <View key={`disc-${idx}`} style={styles.incidentCard}>
            <Text style={styles.incidentTitle}>
              {item?.StudentName ?? item?.studentName ?? 'Student'}
            </Text>
            <Text style={styles.incidentDesc}>
              {item?.Description ?? item?.description ?? '—'}
            </Text>
          </View>
        ))
      )}
    </View>
  </ScrollView>
);

// --- Main Component ---
export default function DriverIncident() {
  const navigation = useNavigation();
  const token = useAppSelector(state => state.userSlices.token);
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'Report Accident'},
    {key: 'second', title: 'Disciplinary Issues'},
  ]);

  const [sentTo, setSentTo] = useState('');
  const [selectStudent, setSelectStudent] = useState('');
  const [accidentDescription, setAccidentDescription] = useState('');
  const [disciplinaryDescription, setDisciplinaryDescription] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [studentOptions, setStudentOptions] = useState<
    {label: string; value: string}[]
  >([]);

  const fetchIncidents = useCallback(async () => {
    if (!token) return;
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/driver/incidents`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        showErrorToast('Error', errorText || 'Failed to fetch incidents');
        return;
      }
      const data = await res.json().catch(() => null);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setIncidents(list);
    } catch (e) {
      showErrorToast('Error', 'Network error while fetching incidents');
    }
  }, [token]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const fetchDriverStudents = useCallback(async () => {
    if (!token) return;
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/driver/students`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        showErrorToast('Error', errorText || 'Failed to fetch students');
        return;
      }
      const data = await res.json().catch(() => null);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      const mapped = list
        .map((s: any) => ({
          label: String(s?.name ?? s?.Name ?? ''),
          value: String(s?.studentId ?? s?.StudentId ?? ''),
        }))
        .filter((x: {label: string; value: string}) => x.label && x.value);
      setStudentOptions(mapped);
    } catch (e) {
      showErrorToast('Error', 'Network error while fetching students');
    }
  }, [token]);

  useEffect(() => {
    fetchDriverStudents();
  }, [fetchDriverStudents]);

  const pickAttachment = useCallback(() => {
    DocumentPicker.pick({
      type: (DocumentPicker as any).types?.allFiles ?? DocumentPicker.types.pdf,
      allowMultiSelection: false,
    })
      .then((res: any) => {
        const file = Array.isArray(res) ? res[0] : res;
        if (file?.uri && file?.name) {
          setSelectedAttachment({
            uri: file.uri,
            name: file.name,
            type: file.type ?? 'application/octet-stream',
          });
        }
      })
      .catch(() => {});
  }, []);

  const submitIncident = useCallback(async () => {
    if (!token) {
      showErrorToast('Error', 'Not authenticated');
      return;
    }
    const isDisciplinary = index === 1;
    const description = isDisciplinary
      ? disciplinaryDescription.trim()
      : accidentDescription.trim();
    const sendToValue = sentTo || 'all';
    const parsedStudentId =
      selectStudent && !Number.isNaN(Number(selectStudent))
        ? Number(selectStudent)
        : null;
    if (!description) {
      showErrorToast('Required', 'Description is required');
      return;
    }
    if (isDisciplinary && parsedStudentId == null) {
      showErrorToast('Required', 'Please select a valid student');
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = getApiBaseUrl();
      const endpoint = `${baseUrl}/driver/incidents`;
      const incidentType = isDisciplinary ? 'disciplinary' : 'accident';
      const basePayload = {
        incidentType,
        sentTo: sendToValue,
        description,
        incidentDate: moment().format('YYYY-MM-DD'),
        ...(isDisciplinary && parsedStudentId != null
          ? {studentId: parsedStudentId}
          : {}),
      };

      if (__DEV__) {
        console.log('📡 POST /driver/incidents URL:', endpoint);
        console.log('🧑‍🎓 selected student dropdown value:', selectStudent);
        console.log('📦 incident base payload:', basePayload);
      }

      // Use multipart whenever file is selected.
      if (selectedAttachment) {
        const formData = new FormData();
        formData.append('incidentType', incidentType);
        formData.append('sentTo', sendToValue);
        formData.append('description', description);
        formData.append('incidentDate', moment().format('YYYY-MM-DD'));
        if (parsedStudentId != null) {
          formData.append('studentId', String(parsedStudentId));
        }
        formData.append(
          'attachment',
          {
            uri: selectedAttachment.uri,
            name: selectedAttachment.name,
            type: selectedAttachment.type,
          } as any,
        );
        if (__DEV__) {
          console.log('📎 incident submit mode: multipart/form-data');
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {Authorization: `Bearer ${token}`},
          body: formData,
        });
        if (!res.ok) {
          const errorText = await res.text().catch(() => '');
          if (__DEV__) {
            console.warn('❌ POST /driver/incidents failed (multipart):', errorText);
          }
          showErrorToast('Create Failed', errorText || 'Could not report incident');
          return;
        }
        if (__DEV__) {
          const success = await res.json().catch(() => null);
          console.log('✅ POST /driver/incidents success (multipart):', success);
        }
      } else {
        const body: any = {
          incidentType,
          sentTo: sendToValue,
          description,
          incidentDate: moment().format('YYYY-MM-DD'),
        };
        if (isDisciplinary && parsedStudentId != null) {
          body.studentId = parsedStudentId;
        }
        if (__DEV__) {
          console.log('📎 incident submit mode: application/json');
          console.log('📤 incident json body:', body);
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errorText = await res.text().catch(() => '');
          if (__DEV__) {
            console.warn('❌ POST /driver/incidents failed (json):', errorText);
          }
          showErrorToast('Create Failed', errorText || 'Could not report incident');
          return;
        }
        if (__DEV__) {
          const success = await res.json().catch(() => null);
          console.log('✅ POST /driver/incidents success (json):', success);
        }
      }

      showSuccessToast('Reported', 'Incident reported successfully');
      setAccidentDescription('');
      setDisciplinaryDescription('');
      setSentTo('');
      setSelectStudent('');
      setSelectedAttachment(null);
      fetchIncidents();
    } catch (e) {
      showErrorToast('Error', 'Network error while reporting incident');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    token,
    index,
    sentTo,
    disciplinaryDescription,
    accidentDescription,
    selectStudent,
    selectedAttachment,
    fetchIncidents,
  ]);

  const accidentIncidents = useMemo(
    () =>
      incidents.filter(
        (x: any) =>
          String(x?.IncidentType ?? x?.incidentType ?? '').toLowerCase() ===
          'accident',
      ),
    [incidents],
  );
  const disciplinaryIncidents = useMemo(
    () =>
      incidents.filter(
        (x: any) =>
          String(x?.IncidentType ?? x?.incidentType ?? '').toLowerCase() ===
          'disciplinary',
      ),
    [incidents],
  );

  const renderScene = ({route}: {route: Route}) => {
    if (route.key === 'first') {
      return (
        <FirstRoute
          sentTo={sentTo}
          setSentTo={setSentTo}
          description={accidentDescription}
          setDescription={setAccidentDescription}
          selectedFileName={selectedAttachment?.name ?? null}
          onPickAttachment={pickAttachment}
          incidents={accidentIncidents}
        />
      );
    }
    return (
      <SecondRoute
        sentTo={sentTo}
        setSentTo={setSentTo}
        selectStudent={selectStudent}
        setSelectStudent={setSelectStudent}
        studentOptions={studentOptions}
        description={disciplinaryDescription}
        setDescription={setDisciplinaryDescription}
        selectedFileName={selectedAttachment?.name ?? null}
        onPickAttachment={pickAttachment}
        incidents={disciplinaryIncidents}
      />
    );
  };

  const renderTabBar = (
    props: SceneRendererProps & {navigationState: NavigationState<Route>},
  ) => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: AppColors.red}}
      style={{
        paddingVertical: 0,
        backgroundColor: AppColors.white,
        height: hp(6),
        width: wp(100),
      }}
      labelStyle={styles.subTitle}
      activeColor={AppColors.red}
      inactiveColor="#666"
      renderLabel={({route, focused}) => (
        <Text
          style={[
            styles.subTitle,
            {
              fontFamily: AppFonts.NunitoSansBold,
              color: focused ? AppColors.red : AppColors.black,
            },
          ]}>
          {route.title}
        </Text>
      )}
    />
  );

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.profileBg}}>
      <AppHeader
        role="Driver"
        title={'Incident'}
        enableBack={true}
        rightIcon={false}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <TabView
          style={{width: '100%'}}
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
          renderTabBar={renderTabBar}
        />
        <AppButton
          title={isSubmitting ? 'Sending...' : 'Send'}
          onPress={submitIncident}
          disabled={isSubmitting}
          style={{
            width: '92%',
            backgroundColor: AppColors.red,
            height: hp(6),
            marginHorizontal: wp(7),
            alignSelf: 'center',
            bottom: 5,
          }}
          titleStyle={{fontSize: size.md}}
        />
      </ScrollView>
    </AppLayout>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
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
  dropdown: {
    marginBottom: hp(2),
  },
  uploadDocBox: {
    width: '100%',
    marginVertical: hp(3),
    height: hp(20),
    backgroundColor: '#f5f5f5',
    borderRadius: hp(1),
    borderWidth: 1,
    borderColor: AppColors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapText: {
    marginTop: hp(1),
    fontSize: size.s,
    fontFamily: AppFonts.NunitoSansMedium,
    color: AppColors.black,
  },
  incidentCard: {
    width: '100%',
    backgroundColor: AppColors.white,
    borderRadius: hp(1),
    padding: hp(1.3),
    borderWidth: 1,
    borderColor: AppColors.lightGrey,
    marginTop: hp(1),
  },
  incidentTitle: {
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.black,
    marginBottom: hp(0.5),
  },
  incidentDesc: {
    fontFamily: AppFonts.NunitoSansRegular,
    color: AppColors.black,
  },
  subTitle: {
    color: AppColors.black,
    fontSize: size.s,
    fontFamily: AppFonts.NunitoSansMedium,
  },
});
