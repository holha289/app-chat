import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface AvatarProps {
  /** URL của avatar */
  uri?: string;
  /** Tên để hiển thị initials khi không có avatar */
  name?: string;
  /** Kích thước avatar */
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number;
  /** Hiển thị status indicator */
  showStatus?: boolean;
  /** Trạng thái online */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /** Style tùy chỉnh cho container */
  style?: ViewStyle;
  /** Màu nền tùy chỉnh */
  backgroundColor?: string;
  /** Màu chữ tùy chỉnh */
  textColor?: string;
  /** Border radius tùy chỉnh */
  borderRadius?: number;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = '',
  size = 'medium',
  showStatus = false,
  status = 'offline',
  style,
  backgroundColor,
  textColor,
  borderRadius,
}) => {
  const [imageError, setImageError] = useState(false);

  // Xác định kích thước
  const getSize = (): number => {
    if (typeof size === 'number') return size;
    
    switch (size) {
      case 'small': return 32;
      case 'medium': return 48;
      case 'large': return 64;
      case 'xlarge': return 80;
      default: return 48;
    }
  };

  const avatarSize = getSize();
  const statusSize = Math.max(avatarSize * 0.25, 8);

  // Tạo initials từ tên
  const getInitials = (fullName: string): string => {
    if (!fullName) return '?';
    
    const words = fullName.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Màu nền mặc định dựa trên tên
  const getDefaultBackgroundColor = (name: string): string => {
    if (backgroundColor) return backgroundColor;
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Màu status
  const getStatusColor = (): string => {
    switch (status) {
      case 'online': return '#34C759';
      case 'away': return '#FF9500';
      case 'busy': return '#FF3B30';
      case 'offline':
      default: return '#8E8E93';
    }
  };

  // Styles
  const containerStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: borderRadius ?? avatarSize / 2,
    backgroundColor: getDefaultBackgroundColor(name),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...style,
  };

  const imageStyle: ImageStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: borderRadius ?? avatarSize / 2,
  };

  const textStyle: TextStyle = {
    fontSize: avatarSize * 0.4,
    fontWeight: '600',
    color: textColor || '#FFFFFF',
  };

  const statusIndicatorStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: statusSize,
    height: statusSize,
    borderRadius: statusSize / 2,
    backgroundColor: getStatusColor(),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  };

  // Render avatar content
  const renderAvatarContent = () => {
    if (uri && !imageError) {
      return (
        <Image
          source={{ uri }}
          style={imageStyle}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      );
    }

    return (
      <Text style={textStyle}>
        {getInitials(name)}
      </Text>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={containerStyle}>
        {renderAvatarContent()}
      </View>
      
      {showStatus && (
        <View style={statusIndicatorStyle} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
});

export default Avatar;
