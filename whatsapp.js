const fs = require("fs");

// Function to parse the WhatsApp chat from text file and calculate message statistics
function analyzeWhatsAppChat(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const messages = data.split("\n");

    let totalMessages = 0;
    let messageCount = {};
    let startDate = null;
    let lastDate = null;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      // Regex pattern to match date and time
      const dateTimePattern =
        /^(\d{1,2}\/\d{1,2}\/\d{2}), (\d{1,2}:\d{2})\s?(AM|PM)? - (.*)/;

      const match = message.match(dateTimePattern);

      if (match) {
        const date = new Date(match[1]);

        // Set start date if not set yet
        if (!startDate) {
          startDate = date;
        }

        // Update last date on every iteration
        lastDate = date;

        const senderAndMessage = match[4];

        // Filter out non-personal messages and events like someone leaving the chat
        if (!isNonPersonalOrEventMessage(senderAndMessage)) {
          const senderAndMessageParts = senderAndMessage.split(":");
          const sender = senderAndMessageParts[0].trim();

          // Count messages for each sender
          if (!messageCount[sender]) {
            messageCount[sender] = 0;
          }
          messageCount[sender]++;
          totalMessages++;
        }
      }
    }

    // Find most texted and least texted sender
    let mostTexted = { sender: null, count: -1 };
    let leastTexted = { sender: null, count: Infinity };

    for (const sender in messageCount) {
      if (messageCount.hasOwnProperty(sender)) {
        if (messageCount[sender] > mostTexted.count) {
          mostTexted.sender = sender;
          mostTexted.count = messageCount[sender];
        }
        if (messageCount[sender] < leastTexted.count) {
          leastTexted.sender = sender;
          leastTexted.count = messageCount[sender];
        }
      }
    }

    return {
      totalMessages: totalMessages,
      messageCount: messageCount,
      mostTexted: mostTexted,
      leastTexted: leastTexted,
      startDate: startDate.toLocaleDateString(),
      lastDate: lastDate.toLocaleDateString(),
    };
  } catch (err) {
    console.error("Error reading the file:", err);
    return null;
  }
}

// Function to check if a message is non-personal or an event message
function isNonPersonalOrEventMessage(message) {
  // Check if the message contains specific patterns indicating it's non-personal or an event
  const nonPersonalOrEventPatterns = [
    // /<Media omitted>/i, // Media omitted message
    /Messages and calls are end-to-end encrypted\./i, // Encrypted message
    /You (blocked|unblocked) this contact\./i, // Blocked or unblocked contact message
    /created group/i, // Group creation message
    /added you/i, // Added to group message
    /You're now an admin/i, // Admin status message
    /added .* and/i, // Adding participants to group message
    /changed the group name/i, // Changing group name message
    /changed (this )?group.*icon/i, // Changing group icon message
    /\b(left|added)\b/i, // Event message (e.g., someone left or was added to the chat)
    /(\bstarted a (video|voice) call\b)|(\bremoved\b)/i, // Ignore video call, voice call, or removal messages
    /changed their phone number/i, // Ignore phone number change messages
    /updated the message timer/i, // Ignore message timer update messages
    /turned off disappearing messages/i, // Ignore disappearing messages turned off
    /You started a call/i,
  ];

  // Check if the message matches any of the non-personal or event patterns
  for (const pattern of nonPersonalOrEventPatterns) {
    if (pattern.test(message)) {
      return true;
    }
  }

  // If no non-personal or event pattern matches, assume it's a personal message
  return false;
}

const filePath = "encrypt.txt"; // Replace with the path to your file
const chatStats = analyzeWhatsAppChat(filePath);
console.log("Total Messages:", chatStats.totalMessages);
console.log("Message Counts by Sender:", chatStats.messageCount);
console.log("Most Texted:", chatStats.mostTexted);
console.log("Least Texted:", chatStats.leastTexted);
console.log("Start Date:", chatStats.startDate);
console.log("Last Date:", chatStats.lastDate);
