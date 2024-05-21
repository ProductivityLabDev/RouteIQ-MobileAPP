import { View, Text } from 'react-native'
import React from 'react'
import AuthLayout from '../../layout/AuthLayout'
import AppLayout from '../../layout/AppLayout'
import AppHeader from '../../components/AppHeader'
import GlobalIcon from '../../components/GlobalIcon'
import { useNavigation } from '@react-navigation/native'

export default function HomeSreen() {
    const navigation = useNavigation();
  return (
<AppLayout>
    <AppHeader title='Mark Tommay' rightIcon={true} onPressLeftIcon={()=>{
        navigation.navigate('Settings')
    }} onPressRightIcon={()=> navigation.navigate('Notification')} />

      {/* <Text>HomeSreen</Text> */}
    
</AppLayout>
  )
}