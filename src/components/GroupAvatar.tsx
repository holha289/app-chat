import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Avatar from './Avatar';

interface GroupAvatarProps {
  /** Danh sách thành viên trong group */
  members: Array<{
    uri?: string;
    name: string;
  }>;
  /** Kích thước avatar */
  size?: 'small' | 'medium' | 'large' | number;
  /** Số lượng avatar tối đa hiển thị */
  maxAvatars?: number;
  /** Style tùy chỉnh */
  style?: ViewStyle;
}

const GroupAvatar: React.FC<GroupAvatarProps> = ({
  members,
  size = 'medium',
  maxAvatars = 4,
  style,
}) => {
  // Xác định kích thước
  const getSize = (): number => {
    if (typeof size === 'number') return size;
    
    switch (size) {
      case 'small': return 32;
      case 'medium': return 48;
      case 'large': return 64;
      default: return 48;
    }
  };

  const containerSize = getSize();
  const avatarSize = Math.floor(containerSize * 0.6);
  
  // Lấy danh sách thành viên để hiển thị
  const displayMembers = members.slice(0, maxAvatars);
  const remainingCount = Math.max(0, members.length - maxAvatars);

  // Tính toán vị trí cho từng avatar
  const getAvatarPosition = (index: number, total: number) => {
    const radius = containerSize * 0.2;
    const angle = (2 * Math.PI * index) / total;
    
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    return {
      left: containerSize / 2 + x - avatarSize / 2,
      top: containerSize / 2 + y - avatarSize / 2,
    };
  };

  const containerStyle: ViewStyle = {
    width: containerSize,
    height: containerSize,
    position: 'relative',
    ...style,
  };

  return (
    <View style={containerStyle}>
      {displayMembers.map((member, index) => {
        const position = getAvatarPosition(index, displayMembers.length);
        
        return (
          <View
            key={`${member.name}-${index}`}
            style={[
              styles.avatarWrapper,
              {
                position: 'absolute',
                ...position,
              },
            ]}
          >
            <Avatar
              uri={member.uri}
              name={member.name}
              size={avatarSize}
              style={styles.groupAvatar}
            />
          </View>
        );
      })}
      
      {remainingCount > 0 && (
        <View
          style={[
            styles.remainingWrapper,
            {
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: avatarSize * 0.6,
              height: avatarSize * 0.6,
            },
          ]}
        >
          <Avatar
            name={`+${remainingCount}`}
            size={avatarSize * 0.6}
            backgroundColor="#8E8E93"
            style={styles.remainingAvatar}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarWrapper: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  groupAvatar: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  remainingWrapper: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  remainingAvatar: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default GroupAvatar;
