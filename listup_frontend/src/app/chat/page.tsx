"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { MessageSquare, Settings, Search } from 'lucide-react';
import ConversationList from '@/components/chat/ConversationList';
import axios from '@/utils/axios';
import { useChat } from '@/context/ChatContext';

const ChatPage = () => {
    const { user, isInitialized } = useAuth();
    const { socket, refreshUnreadCount } = useChat();
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('/chat/conversations');
            if (response.data.success) {
                setConversations(response.data.conversations);
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isInitialized && !user) {
            router.push('/login?redirect=/chat');
            return;
        }

        if (user) {
            fetchConversations();
            refreshUnreadCount();
        }
    }, [user, isInitialized, router, refreshUnreadCount]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleUpdate = () => {
            fetchConversations();
            refreshUnreadCount();
        };

        socket.on('notification:message', handleUpdate);
        socket.on('message:new', handleUpdate);

        return () => {
            socket.off('notification:message', handleUpdate);
            socket.off('message:new', handleUpdate);
        };
    }, [socket, user, refreshUnreadCount]);

    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading your messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col md:flex-row max-w-7xl mx-auto shadow-sm">
            {/* Sidebar / List */}
            <div className="w-full md:w-80 lg:w-96 bg-white border-r flex flex-col h-[calc(100vh-64px)]">
                <div className="p-4 border-b flex items-center justify-between bg-white shrink-0">
                    <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Settings className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-3 bg-white shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            placeholder="Search messages..."
                            className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <ConversationList
                        conversations={conversations}
                        currentUserId={user?.id || ''}
                    />
                </div>
            </div>

            {/* Empty State / Welcome (Desktop Only) */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 flex-col p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Inbox</h2>
                <p className="text-gray-500 max-w-sm">
                    Select a conversation from the list to view messages and contact sellers about listings.
                </p>
            </div>
        </div>
    );
};

export default ChatPage;
