"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import UserAvatar from './UserAvatar';

interface Conversation {
    id: string;
    lastMessageAt: string;
    lastMessagePreview: string | null;
    buyerId: string;
    sellerId: string;
    buyer: { id: string; name: string; profileImage: string | null };
    seller: {
        id: string;
        name: string;
        profileImage: string | null;
        vendorProfile: { storeName: string; logo: string | null } | null
    };
    listing: { id: string; title: string; price: number; images: string[] } | null;
    _count: { messages: number };
}

interface ConversationListProps {
    conversations: Conversation[];
    activeId?: string;
    currentUserId: string;
}

const ConversationList = ({ conversations, activeId, currentUserId }: ConversationListProps) => {
    const router = useRouter();

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>No messages yet.</p>
                <p className="text-sm">When you contact a seller, your chat will appear here.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {conversations.map((conv) => {
                const isSeller = conv.sellerId === currentUserId; // Note: Need to add sellerId to Conversation interface or check vs currentUserId
                const otherUser = currentUserId === conv.buyerId ? conv.seller : conv.buyer;
                const otherUserName = (otherUser as any).vendorProfile?.storeName || otherUser.name;
                const otherUserImage = (otherUser as any).vendorProfile?.logo || otherUser.profileImage || '/placeholder-avatar.png';
                const hasUnread = conv._count.messages > 0;

                return (
                    <div
                        key={conv.id}
                        onClick={() => router.push(`/chat/${conv.id}`)}
                        className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-gray-50 ${activeId === conv.id ? 'bg-blue-50/50' : ''
                            }`}
                    >
                        <div className="relative shrink-0">
                            <UserAvatar
                                name={otherUserName}
                                image={otherUserImage}
                                size={56}
                            />
                            {hasUnread && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-semibold text-sm truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {otherUserName}
                                </h3>
                                <span className="text-[10px] text-gray-400 shrink-0">
                                    {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                                </span>
                            </div>

                            {conv.listing && (
                                <div className="text-[11px] text-blue-600 font-medium truncate mb-1">
                                    {conv.listing.title}
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <p className={`text-xs truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                    {conv.lastMessagePreview || 'New conversation'}
                                </p>
                                {hasUnread && (
                                    <Badge variant="default" className="bg-red-500 h-4 px-1.5 text-[10px] scale-90">
                                        {conv._count.messages}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;
