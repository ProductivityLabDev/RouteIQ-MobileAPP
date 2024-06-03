import React from 'react';
import {Modal, Pressable, StyleSheet} from 'react-native';

interface AppCustomModalProps {
  visible?: boolean;
  setVisible?: any;
  style?: any;
  children: any;
}

const AppCustomModal: React.FC<AppCustomModalProps> = ({
  visible,
  setVisible,
  style,
  children,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <Pressable
        onPress={() => setVisible(!visible)}
        style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.7)'}]}
      />
      {children}
    </Modal>
  );
};

export default AppCustomModal;

const styles = StyleSheet.create({});
