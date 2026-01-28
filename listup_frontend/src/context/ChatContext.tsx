"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import axios from '@/utils/axios';

interface ChatContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({
    socket: null,
    isConnected: false,
    unreadCount: 0,
    refreshUnreadCount: async () => { },
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuthStore();

    const refreshUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const response = await axios.get('/chat/stats');
            if (response.data.success) {
                setUnreadCount(response.data.stats.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch chat stats:', error);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            setUnreadCount(0);
            return;
        }

        // Initialize socket connection
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const newSocket = io(socketUrl, {
            withCredentials: true, // Important for cookie-based auth
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('✅ Chat Socket Connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Chat Socket Disconnected');
            setIsConnected(false);
        });

        newSocket.on('notification:message', () => {
            // New message received while not looking at it
            // Instead of prev => prev + 1, refetch to be accurate
            refreshUnreadCount();
        });

        // Also listen for unread count refresh events (e.g. from other tabs marking as read)
        newSocket.on('unread:refresh', () => {
            refreshUnreadCount();
        });

        setSocket(newSocket);
        refreshUnreadCount();

        return () => {
            newSocket.disconnect();
        };
    }, [user, refreshUnreadCount]);

    return (
        <ChatContext.Provider value={{ socket, isConnected, unreadCount, refreshUnreadCount }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
