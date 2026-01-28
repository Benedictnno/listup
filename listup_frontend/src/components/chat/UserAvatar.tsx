"use client";

import React from 'react';
import Image from 'next/image';

interface UserAvatarProps {
    name: string;
    image?: string | null;
    size?: number;
    className?: string;
}

const UserAvatar = ({ name, image, size = 40, className = "" }: UserAvatarProps) => {
    const initials = name
        ? name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    // Generate a consistent background color based on the name
    const colors = [
        'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500',
        'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = name ? name.length % colors.length : 0;
    const bgColor = colors[colorIndex];

    return (
        <div
            className={`rounded-full overflow-hidden relative border shrink-0 flex items-center justify-center text-white font-medium ${bgColor} ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {image && image !== '/placeholder-avatar.png' ? (
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover"
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
};

export default UserAvatar;
