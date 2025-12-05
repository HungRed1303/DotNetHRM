/**
 * Avatar.tsx - Component avatar thống nhất (chỉ hiển thị)
 * Hiển thị ảnh avatar có sẵn hoặc fallback chữ cái đầu tên
 * Không hỗ trợ upload/thay đổi avatar
 */

import React from 'react';
import { THEME_COLORS } from './THEME_COLORS';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showBorder?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '', 
  onClick,
  showBorder = false 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl'
  };

  const borderClass = showBorder ? 'border-2' : '';
  const sizeClass = sizeClasses[size];
  const clickableClass = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  
  // Lấy chữ cái đầu từ tên
  const getInitials = (fullName: string): string => {
    if (!fullName) return 'NV';
    return fullName.charAt(0).toUpperCase();
  };

  // Xử lý đường dẫn avatar (chỉ đọc)
  const getAvatarSrc = (avatarSrc?: string | null): string | null => {
    if (!avatarSrc) return null;
    
    // Nếu là URL đầy đủ
    if (avatarSrc.startsWith('http') || avatarSrc.startsWith('data:')) {
      return avatarSrc;
    }
    
    // Nếu là filename, tìm trong assets/images
    if (!avatarSrc.includes('/')) {
      return `/src/assets/images/${avatarSrc}`;
    }
    
    return avatarSrc;
  };

  const avatarSrc = getAvatarSrc(src);

  return (
    <div 
      className={`relative ${sizeClass} rounded-full flex items-center justify-center font-medium ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={`Avatar ${name}`}
          className={`${sizeClass} rounded-full object-cover ${borderClass}`}
          style={{ borderColor: showBorder ? THEME_COLORS.primary[300] : undefined }}
          onError={(e) => {
            // Fallback nếu không load được avatar
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentNode?.querySelector('.avatar-fallback');
            if (fallback) {
              (fallback as HTMLElement).style.display = 'flex';
            }
          }}
        />
      ) : null}
      
      {/* Fallback text */}
      <div 
        className={`avatar-fallback ${sizeClass} rounded-full items-center justify-center text-white font-medium ${borderClass} ${avatarSrc ? 'hidden' : 'flex'}`}
        style={{ 
          backgroundColor: THEME_COLORS.primary[500],
          borderColor: showBorder ? THEME_COLORS.primary[300] : undefined 
        }}
      >
        {getInitials(name)}
      </div>
    </div>
  );
};

export default Avatar;