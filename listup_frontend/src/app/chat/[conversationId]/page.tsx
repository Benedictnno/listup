"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/store/authStore';
import ChatWindow from '@/components/chat/ChatWindow';
import ConversationList from '@/components/chat/ConversationList';
import axios from '@/utils/axios';
import { Search, ArrowLeft } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

const ConversationPage = () => {
    const { conversationId } = useParams();
    const { user, isInitialized } = useAuth();
    const { refreshUnreadCount } = useChat();
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
            router.push(`/login?redirect=/chat/${conversationId}`);
            return;
        }

        if (user) {
            fetchConversations();
            refreshUnreadCount();
        }
    }, [user, isInitialized, router, conversationId, refreshUnreadCount]);

    const { socket } = useChat();

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
                    <p className="text-gray-500 font-medium">Opening chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col md:flex-row max-w-7xl mx-auto shadow-sm">
            {/* Sidebar (Desktop Only) */}
            <div className="hidden md:flex md:w-80 lg:w-96 bg-white border-r flex-col h-[calc(100vh-64px)] overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                </div>

                <div className="p-3 shrink-0">
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
                        activeId={conversationId as string}
                    />
                </div>
            </div>

            {/* Main Chat Window */}
            <div className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)]">
                <ChatWindow
                    conversationId={conversationId as string}
                    currentUserId={user?.id || ''}
                />
            </div>
        </div>
    );
};

export default ConversationPage;
