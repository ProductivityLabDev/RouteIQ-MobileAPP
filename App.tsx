import React, {useEffect} from 'react';
import Navigation from './src/navigation/Navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persister, store} from './src/store/store';
import {MenuProvider} from 'react-native-popup-menu';
import Toast from 'react-native-toast-message';
import {toastConfig} from './src/utils/toastConfig';
import {hp} from './src/utils/constants';
import {setApiFetchStoreRef} from './src/utils/apiFetch';
import {setupFcmListeners} from './src/services/fcmService';
import {ChatSocketProvider} from './src/providers/ChatSocketProvider';

// Register store for apiFetch 401 auto-logout
setApiFetchStoreRef(store);

const App = () => {
  useEffect(() => {
    const unsubscribe = setupFcmListeners();
    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persister}>
        <ChatSocketProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <MenuProvider>
              <BottomSheetModalProvider>
                <Navigation />
              </BottomSheetModalProvider>
            </MenuProvider>
            <Toast config={toastConfig} position="bottom" bottomOffset={hp(10)} />
          </GestureHandlerRootView>
        </ChatSocketProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
