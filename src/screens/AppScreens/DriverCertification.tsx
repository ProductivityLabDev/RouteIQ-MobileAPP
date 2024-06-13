import { View, Text, StyleSheet, Image, Pressable } from 'react-native'
import React, { useState } from 'react'
import AppLayout from '../../layout/AppLayout'
import { AppColors } from '../../utils/color'
import AppHeader from '../../components/AppHeader'
import { hp, wp } from '../../utils/constants'
import AppStyles from '../../styles/AppStyles'
import AppFonts from '../../utils/appFonts'
import { size } from '../../utils/responsiveFonts'
import GlobalIcon from '../../components/GlobalIcon'
import AppDoc from '../../components/AppDoc'
import AppButton from '../../components/AppButton'
import { useNavigation } from '@react-navigation/native'

export default function DriverCertification() {

    const [showDriverLicense, setShowDriverLicense] = useState(false);

    const navigation = useNavigation();

    return (
        <AppLayout
            statusbackgroundColor={AppColors.red}
            style={{ backgroundColor: AppColors.profileBg }}>

            <AppHeader
                role="Driver"
                title={showDriverLicense ? "Driver's License" : "Certification"}
                enableBack={true}
                rightIcon={false}
            />

            {showDriverLicense === false ?
                <Pressable style={{ justifyContent: 'space-between', flex: 1 }} onPress={() => { setShowDriverLicense(true) }}>

                    <View style={{ gap: hp(4), justifyContent: 'center', alignItems: 'center' }}>



                        <View style={styles.mainContainer}>
                            <Text
                                style={[
                                    AppStyles.subHeading,
                                    {

                                        width: '100%',
                                        textAlign: 'center',
                                        paddingVertical: hp(2),
                                        backgroundColor: AppColors.darkBrown,
                                        color: AppColors.white,
                                        fontFamily: AppFonts.NunitoSansBold,
                                        alignSelf: 'center',
                                        fontSize: size.default,

                                    },
                                ]}>
                                Commercial Driver’s License
                            </Text>


                            <View style={styles.boxContainer}>
                                <View style={styles.imageContainer}>
                                    <Image source={require('../../assets/images/driverlicensepic.png')} resizeMode='cover' style={styles.image} />
                                </View>
                                <View style={styles.infoContainer}>
                                    <View style={styles.row1}>
                                        <Text style={styles.headerSubTitle}>ID: B456788 </Text>
                                        <Text style={styles.headerSubTitle}>Class B</Text>
                                    </View>
                                    <Text style={styles.nameText}>Mark Tommay</Text>
                                    <Text style={styles.headerSubTitle}>Exp Date: <Text style={[styles.headerSubTitle, styles.highlight]}>  7.8.2027  </Text> </Text>
                                    <Text style={styles.headerSubTitle}>Renewal Date: <Text style={[styles.headerSubTitle, styles.highlight]}>  7.8.2027  </Text> </Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '80%' }}>
                                        <Text style={[styles.headerSubTitle, { color: AppColors.green }]}>Verified</Text>
                                        <GlobalIcon library='CustomIcon' name={'account_circle'} color={AppColors.red} />
                                    </View>
                                </View>
                            </View>

                        </View>

                        <AppDoc title={'Fed Med Card'} />
                        <AppDoc title={'Endorsements'} />

                    </View>

                    <AppButton
                        title="Upload Documents"
                        onPress={() => navigation.navigate('Settings')}
                        style={{
                            // width: '100%',
                            width: '90%',
                            backgroundColor: AppColors.red,
                            height: hp(6),
                            marginHorizontal: wp(7),
                            alignSelf: 'center',
                            position: 'relative',
                            top: -10
                        }}
                        titleStyle={{
                            fontSize: size.md
                        }}
                    />


                </Pressable>

                :
                <>

                    <Text style={styles.text2}>Front Card</Text>
                    <View style={[styles.mainContainer, { marginTop: 0 }]}>
                        <Text
                            style={[
                                AppStyles.subHeading,
                                {

                                    width: '100%',
                                    textAlign: 'center',
                                    paddingVertical: hp(2),
                                    backgroundColor: AppColors.darkBrown,
                                    color: AppColors.white,
                                    fontFamily: AppFonts.NunitoSansBold,
                                    alignSelf: 'center',
                                    fontSize: size.default,

                                },
                            ]}>
                            Commercial Driver’s License
                        </Text>


                        <View style={styles.boxContainer}>
                            <View style={styles.imageContainer}>
                                <Image source={require('../../assets/images/driverlicensepic.png')} resizeMode='cover' style={styles.image} />
                            </View>
                            <View style={styles.infoContainer}>
                                <View style={styles.row1}>
                                    <Text style={styles.headerSubTitle}>ID: B456788 </Text>
                                    <Text style={styles.headerSubTitle}>Class B</Text>
                                </View>
                                <Text style={styles.nameText}>Mark Tommay</Text>
                                <Text style={styles.headerSubTitle}>Exp Date: <Text style={[styles.headerSubTitle, styles.highlight]}>  7.8.2027  </Text> </Text>
                                <Text style={styles.headerSubTitle}>Renewal Date: <Text style={[styles.headerSubTitle, styles.highlight]}>  7.8.2027  </Text> </Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '80%' }}>
                                    <Text style={[styles.headerSubTitle, { color: AppColors.green, fontSize: size.md }]}>Verified</Text>
                                    {/* <GlobalIcon library='CustomIcon' name={'account_circle'} color={AppColors.red} /> */}
                                </View>
                            </View>
                        </View>

                    </View>

                    <Text style={styles.text2}>Back Card</Text>

                    <View style={[styles.mainContainer3]}>
                        <View style={styles.row}>
                            <Text style={styles.backCardSubText}>Restrictions</Text>
                            <Text style={styles.backCardSubText}>ID: B456788 </Text>
                        </View>
                        <Text style={styles.backCardText}>●  Lorem ipsum dolor sit amet, consectetur adipiscing{'\n'}
                            ●  elit, sed do eiusmod tempor incididunt{'\n'}
                            ●  ut labore et dolore magna aliqua. Ut enim ad minim{'\n'}
                            ●  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex </Text>
                    </View>

                </>


            }


        </AppLayout>
    )
}

const styles = StyleSheet.create({

    backCardSubText: {
        fontFamily: AppFonts.NunitoSansMedium,
        fontSize: size.default,
        lineHeight: 20,
        color: AppColors.black,
        alignSelf: 'center',

    },


    backCardText: {
        fontFamily: AppFonts.NunitoSansRegular,
        fontSize: size.s,
        lineHeight: 20,
        color: AppColors.black,
        alignSelf: 'center',
    },

    text2: {
        fontFamily: AppFonts.NunitoSansMedium,
        fontSize: size.default,
        lineHeight: 20,
        color: AppColors.black,
        alignSelf: 'center',
        marginTop: hp(5),
        marginBottom: hp(1)
    },
    highlight: {
        backgroundColor: AppColors.lightGrey,
    },
    mainContainer: {
        width: '90%',
        marginTop: hp(3),
        alignSelf: 'center',
        backgroundColor: AppColors.white,
        borderRadius: 10,
        overflow: 'hidden'
    },
    mainContainer3: {
        paddingVertical: hp(6),
        paddingBottom: hp(8),
        justifyContent: 'center', alignItems: 'center', padding: hp(2),
        paddingHorizontal: wp(5),
        gap: hp(1),
        width: '90%',
        marginTop: hp(0),
        alignSelf: 'center',
        backgroundColor: AppColors.white,
        borderRadius: 10,
        overflow: 'hidden'
    },
    boxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(3),
        padding: wp(3),
        backgroundColor: AppColors.white

    },
    headerSubTitle: {
        fontFamily: AppFonts.NunitoSansMedium,
        fontSize: size.s,
        lineHeight: 20,
        color: AppColors.black,
    },
    image: {
        // width: '100%',
        // height: '100%',
        // borderRadius: hp(10),
        position: 'static',
        borderColor: AppColors.white,
        borderWidth: 1,
    },
    imageContainer: {
        // height: hp(18),
        // width: hp(13),
        alignSelf: 'center'
    },
    infoContainer: {
        justifyContent: 'space-between',
        alignItems: 'flex-start',

    },
    row1: {
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        // gap: wp(10)
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        // gap: wp(10)
    },
    nameText: {
        color: AppColors.black,
        fontFamily: AppFonts.NunitoSansSemiBold,
        fontSize: size.xlg,
        textAlign: 'left',
    },
})