const { sendMessage } = require('./whatsapp.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Notify Seller of new message
 */
async function notifySeller(sellerId, buyerName, productName, messagePreview) {
    try {
        const seller = await prisma.user.findUnique({
            where: { id: sellerId },
            select: { phone: true, whatsappOptIn: true, name: true }
        });

        if (!seller || !seller.phone || !seller.whatsappOptIn) {
            console.log(`[WhatsApp] Skipping notification for seller ${sellerId}: opt-out or no phone.`);
            return;
        }

        const body = `🔔 *New Message from Customer*

*From:* ${buyerName}
*Product:* ${productName}
*Message:* "${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}"

💬 Reply on Listup to maintain your seller rating!

🔗 https://listup.ng/messages`;

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

module.exports = {
    notifySeller
};
