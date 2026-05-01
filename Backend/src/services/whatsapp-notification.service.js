const { sendMessage } = require('./whatsappService');
const prisma = require('../lib/prisma');
const { getFrontendUrl } = require('../utils/url');

/**
 * Notify Seller of new message
 */
async function notifySeller(sellerId, buyerName, productName, messagePreview, conversationId) {
    try {
        const seller = await prisma.user.findUnique({
            where: { id: sellerId },
            select: { phone: true, whatsappOptIn: true, name: true }
        });

        if (!seller) {
            console.log(`[WhatsApp] Skipping notification: Seller ${sellerId} not found.`);
            return;
        }

        if (!seller.phone) {
            console.log(`[WhatsApp] Skipping notification for ${seller.name}: No phone number registered.`);
            return;
        }

        if (!seller.whatsappOptIn) {
            console.log(`[WhatsApp] Skipping notification for ${seller.name}: WhatsApp opt-in is DISABLED.`);
            return;
        }

        console.log(`[WhatsApp] Preparing notification for seller: ${seller.name} (${seller.phone})`);

        const body = `🔔 *New Message from Customer*

*From:* ${buyerName}
*Product:* ${productName}
*Message:* "${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}"

💬 Reply on Listup to maintain your seller rating!

🔗 ${getFrontendUrl()}/chat/${conversationId}`;

        await sendMessage(seller.phone, body);

        // Log notification
        await prisma.botNotification.create({
            data: {
                userId: sellerId,
                type: 'new_message',
                title: 'New Message from Customer',
                message: body,
                sentVia: 'whatsapp'
            }
        });

    } catch (error) {
        console.error('Failed to notify seller via WhatsApp:', error);
    }
}

/**
 * Notify Buyer of vendor response
 */
async function notifyBuyer(buyerId, vendorName, productName, messagePreview, conversationId) {
    try {
        const buyer = await prisma.user.findUnique({
            where: { id: buyerId },
            select: { phone: true, whatsappOptIn: true, name: true }
        });

        if (!buyer || !buyer.phone || !buyer.whatsappOptIn) {
            console.log(`[WhatsApp] Skipping notification for buyer ${buyerId}: opt-out or no phone.`);
            return;
        }

        const body = `✅ *Vendor Response Received*

Hi ${buyer.name}, *${vendorName}* has responded to your inquiry about *${productName}*.

*Message:* "${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}"

🔗 View and reply here: ${getFrontendUrl()}/chat/${conversationId}`;

        await sendMessage(buyer.phone, body);

        // Log notification
        await prisma.botNotification.create({
            data: {
                userId: buyerId,
                type: 'vendor_response',
                title: 'Vendor Response Received',
                message: body,
                sentVia: 'whatsapp'
            }
        });

    } catch (error) {
        console.error('Failed to notify buyer via WhatsApp:', error);
    }
}

module.exports = {
    notifySeller,
    notifyBuyer
};
