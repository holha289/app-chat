import { JSX } from 'react';
import { Modal, ActivityIndicator, View } from 'react-native';

type LoadingOverlayProps = {
    visible: boolean;
};

const LoadingOverlay = ({ visible }: LoadingOverlayProps): JSX.Element => {
    return (
        <Modal transparent animationType="none" visible={visible}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        </Modal>
    );
};

export default LoadingOverlay;
