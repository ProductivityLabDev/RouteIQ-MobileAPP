import React from 'react';
import Navigation from './src/navigation/Navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persister, store} from './src/store/store';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persister}>
        <GestureHandlerRootView style={{flex: 1}}>
          <BottomSheetModalProvider>
            <Navigation />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
};

export default App;
