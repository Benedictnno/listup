"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, MoreVertical, Flag, Trash2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useChat } from '@/context/ChatContext';
import axios from '@/utils/axios';
import UserAvatar from './UserAvatar';

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
}

const ChatWindow = ({ conversationId, currentUserId }: ChatWindowProps) => {
    const router = useRouter();
    const { socket, refreshUnreadCount } = useChat();
    const [conversation, setConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get(`/chat/conversations/${conversationId}`);
                if (response.data.success) {
                    setConversation(response.data.conversation);
                }
            } catch (err) {
                console.error('Failed to fetch conversation details:', err);
            }
        };

        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/chat/conversations/${conversationId}/messages`);
                if (response.data.success) {
                    setMessages(response.data.messages);
                    setIsLoading(false);

                    // Mark all as read when opening conversation
                    await axios.put(`/chat/conversations/${conversationId}/read-all`);
                    refreshUnreadCount();
                }
            } catch (err) {
                console.error('Failed to fetch messages:', err);
                setIsLoading(false);
            }
        };

        fetchDetails();
        fetchMessages();
    }, [conversationId, refreshUnreadCount]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('join:conversation', conversationId);

        socket.on('message:new', (message: any) => {
            // Prevent duplicate message if it's our own (already added optimistically)
            setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });

            if (message.senderId !== currentUserId) {
                // Mark as read if user is looking at the window
                axios.put(`/chat/messages/${message.id}/read`);
                refreshUnreadCount();
            }
        });

        socket.on('typing:start', ({ userId }: { userId: string }) => {
            if (userId !== currentUserId) setIsTyping(true);
        });

        socket.on('typing:stop', ({ userId }: { userId: string }) => {
            if (userId !== currentUserId) setIsTyping(false);
        });

        return () => {
            socket.emit('leave:conversation', conversationId);
            socket.off('message:new');
            socket.off('typing:start');
            socket.off('typing:stop');
        };
    }, [socket, conversationId, currentUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    if (isLoading) {
        return <div className="flex-1 flex items-center justify-center">Loading chat...</div>;
    }

    if (!conversation) {
        return <div className="flex-1 flex items-center justify-center text-red-500">Conversation not found.</div>;
    }

    const otherUser = currentUserId === conversation.buyerId ? conversation.seller : conversation.buyer;
    const otherUserName = (otherUser as any).vendorProfile?.storeName || otherUser.name;
    const otherUserImage = (otherUser as any).vendorProfile?.logo || otherUser.profileImage || '/placeholder-avatar.png';

    const handleReport = async () => {
        if (!window.confirm('Are you sure you want to report this conversation for moderation?')) return;

        try {
            await axios.post('/chat/reports', {
                conversationId,
                reason: 'User reported via chat interface'
            });
            alert('Conversation reported. Our moderators will review it.');
        } catch (err) {
            console.error('Failed to report conversation:', err);
            alert('Failed to report. Please try again.');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b p-3 flex items-center gap-3 shrink-0">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <UserAvatar
                    name={otherUserName}
                    image={otherUserImage}
                    size={48}
                    className="shrink-0"
                />

                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-sm truncate">{otherUserName}</h2>
                    <p className="text-[10px] text-gray-500">
                        {isTyping ? <span className="text-blue-600 animate-pulse">typing...</span> : 'Online'}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                        onClick={handleReport}
                        title="Report Conversation"
                    >
                        <Flag className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Listing Context (Mini Info) */}
            {conversation.listing && (
                <div className="bg-blue-50/80 backdrop-blur-sm px-4 py-2 border-b flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded border overflow-hidden relative shrink-0">
                            <Image
                                src={conversation.listing.images?.[0] || '/placeholder-listing.png'}
                                alt={conversation.listing.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[11px] font-semibold truncate leading-tight">{conversation.listing.title}</h3>
                            <p className="text-[10px] text-blue-600 font-bold">₦{conversation.listing.price.toLocaleString()}</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="text-[10px] h-7 px-2 border border-blue-200 text-blue-600 hover:bg-blue-100 bg-white/50" onClick={() => router.push(`/listings/${conversation.listing?.id}`)}>
                        <Info className="h-3 w-3 mr-1" /> View Listing
                    </Button>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                <div className="mt-auto">
                    {messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.senderId === currentUserId}
                        />
                    ))}
                    {isTyping && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 px-4 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <MessageInput
                conversationId={conversationId}
                onMessageSent={(msg) => {
                    setMessages(prev => [...prev, msg]);
                }}
                socket={socket}
            />
        </div>
    );
};

export default ChatWindow;
