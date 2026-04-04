const fs = require('fs');

const path = 'src/services/whatsappService.js';
let content = fs.readFileSync(path, 'utf8');

// Global parameter & generic replacements
content = content.replace(/async checkRateLimit\(userId\)/g, 'async checkRateLimit(botContactId)');
content = content.replace(/where: { id: userId }/g, 'where: { id: botContactId }');
content = content.replace(/if \(!userId\)/g, 'if (!botContactId)');
content = content.replace(/await prisma\.user\.findUnique/g, 'await prisma.botContact.findUnique');
content = content.replace(/await prisma\.user\.update/g, 'await prisma.botContact.update');
content = content.replace(/await prisma\.user\.create/g, 'await prisma.botContact.create');
content = content.replace(/await prisma\.user\.updateMany/g, 'await prisma.botContact.updateMany');
content = content.replace(/async incrementMessageCount\(userId\)/g, 'async incrementMessageCount(botContactId)');
content = content.replace(/async updateEngagementScore\(userId/g, 'async updateEngagementScore(botContactId');
content = content.replace(/user\.whatsappEngagementScore/g, 'contact.whatsappEngagementScore');
content = content.replace(/async canSendMessage\(userId\)/g, 'async canSendMessage(botContactId)');
content = content.replace(/user\.whatsappStopRequested/g, 'contact.whatsappStopRequested');
content = content.replace(/async handleStopCommand\(userId/g, 'async handleStopCommand(botContactId');

// Find variable issues
content = content.replace(/const user = await prisma\.botContact\.findUnique/g, 'const contact = await prisma.botContact.findUnique');
content = content.replace(/if \(!contact\) return/g, "if (!contact) return"); 

// registerNewContact
content = content.replace(/const email = `wa_\$\{phone\}@listup\.bot`;\s+const newUser = await prisma\.botContact\.create\(\{\s+data: \{\s+name: pushname \|\| 'WhatsApp Customer',\s+email: email,\s+password: hashedPassword,\s+phone: phone,\s+whatsappOptIn: true,\s+whatsappEngagementScore: 100,\s+\}\s+\}\);/g, 
`const newUser = await prisma.botContact.create({
                data: {
                    name: pushname || 'WhatsApp Customer',
                    phone: phone,
                    whatsappOptIn: true,
                    whatsappEngagementScore: 100,
                }
            });`);

content = content.replace(/const randomPassword = crypto\.randomBytes\(16\)\.toString\('hex'\);\s+const hashedPassword = await bcrypt\.hash\(randomPassword, 10\);/g, '');

// handleIncomingMessage user -> contact
content = content.replace(/let user = await prisma\.botContact\.findUnique/g, 'let contact = await prisma.botContact.findUnique');
content = content.replace(/if \(\!user\)/g, 'if (!contact)');
content = content.replace(/user = await this\.registerNewContact/g, 'contact = await this.registerNewContact');
content = content.replace(/const userId = user\?\.id;/g, 'const botContactId = contact?.id;');
content = content.replace(/user \? user\.name : pushname;/g, 'contact ? contact.name : pushname;');
content = content.replace(/const userName = (.*);/g, 'const contactName = $1;');
content = content.replace(/if \(userId\) \{/g, 'if (botContactId) {');
content = content.replace(/userId: userId/g, 'botContactId: botContactId');
content = content.replace(/where: \{ userId: userId \}/g, 'where: { botContactId: botContactId }');
content = content.replace(/User \$\{userId\}/g, 'Contact ${botContactId}');
content = content.replace(/user \$\{userId\}/g, 'contact ${botContactId}');
content = content.replace(/user\.whatsappMessageCount/g, 'contact.whatsappMessageCount');
content = content.replace(/user\.whatsappLastMessageDate/g, 'contact.whatsappLastMessageDate');
content = content.replace(/user \? user\.name : pushname/g, 'contact ? contact.name : pushname');
content = content.replace(/user\.whatsappContactReminderCount/g, 'contact.whatsappContactReminderCount');
content = content.replace(/user\.lastContactReminderDate/g, 'contact.lastContactReminderDate');
content = content.replace(/Hi \$\{userName\}/g, 'Hi ${contactName}');
content = content.replace(/\(userName,/g, '(contactName,');

// Remaining broken references in handleIncomingMessage
content = content.replace(/await this\.handleStopCommand\(userId, cleanPhone\);/g, 'await this.handleStopCommand(botContactId, cleanPhone);');
content = content.replace(/const rateLimit = await this\.checkRateLimit\(userId\);/g, 'const rateLimit = await this.checkRateLimit(botContactId);');
content = content.replace(/const canSend = await this\.canSendMessage\(userId\);/g, 'const canSend = await this.canSendMessage(botContactId);');
content = content.replace(/if \(userId && user\.whatsappContactReminderCount/g, 'if (botContactId && contact.whatsappContactReminderCount');
content = content.replace(/if \(\!data\.userId\)/g, 'if (!data.botContactId)');
content = content.replace(/userId: data\.userId/g, 'botContactId: data.botContactId');

// Special register fix
content = content.replace(/const email = `wa_\$\{phone\}@listup\.bot`;\s*/, '');
content = content.replace(/newUser\.name/g, 'newContact.name');
content = content.replace(/newUser\.email/g, "''");
content = content.replace(/newUser\.phone/g, 'newContact.phone');
content = content.replace(/newUser/g, 'newContact');


fs.writeFileSync(path, content, 'utf8');
console.log("Refactoring complete");
