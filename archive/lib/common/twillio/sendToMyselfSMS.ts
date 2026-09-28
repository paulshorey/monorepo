const myHeaders = new Headers();
const authHeader = `Basic ${Buffer.from(process.env.TWILLIO_USERNAME_PASSWORD || "").toString("base64")}`;
myHeaders.append("Authorization", authHeader);

/**
 * Utility function to send a single SMS message via Twilio API
 * Returns a promise that resolves to true on success, false on failure
 */
const sendSingleSMS = (messageBody: string): Promise<boolean> => {
  const formdata = new FormData();
  formdata.append("To", "13857706789");
  formdata.append("From", "19133649396");
  formdata.append("Body", messageBody);

  return new Promise<boolean>((resolve) => {
    if (!process.env.TWILLIO_USERNAME_PASSWORD) {
      resolve(true);
      return;
    }

    fetch("https://api.twilio.com/2010-04-01/Accounts/AC258697f0ec08c434f11a2f19de0ce74b/Messages.json", {
      method: "POST",
      headers: myHeaders,
      body: formdata,
    })
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        console.error("Twillio POST failed!", error);
        resolve(false);
      });
  });
};

/**
 * Creates a timeout promise that rejects after the specified milliseconds
 */
const createTimeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
};

/**
 * Creates a delay promise that resolves after the specified milliseconds
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

/**
 * Sends an SMS message, chunking into multiple messages if necessary
 * Each request waits for the previous one to complete
 * Requests timeout after 60 seconds
 * Minimum 10 second delay between requests to respect rate limits
 */
export const sendToMyselfSMS = async (message: string) => {
  const MAX_LENGTH = 1500;
  const TIMEOUT_MS = 60000; // 60 seconds
  const MIN_DELAY_MS = 10000; // 10 seconds minimum between requests

  // Break message into chunks of max 1500 characters
  const chunks: string[] = [];
  if (message.length <= MAX_LENGTH) {
    chunks.push(message);
  } else {
    for (let i = 0; i < message.length; i += MAX_LENGTH) {
      chunks.push(message.slice(i, i + MAX_LENGTH));
    }
  }

  // Send each chunk sequentially with timeout protection
  const results = [];
  for (let i = 0; i < Math.min(10, chunks.length); i++) {
    let messageBody = chunks[i];
    if (!messageBody) continue;
    // Show page numbers if multiple chunks
    if (chunks.length > 1) {
      messageBody += `\n[Page: ${i + 1} of ${chunks.length}]`;
    }

    const startTime = Date.now();

    try {
      // Wait for the current request to complete or timeout
      const result = await Promise.race([sendSingleSMS(messageBody), createTimeout(TIMEOUT_MS)]);
      results.push(result);

      // Ensure minimum delay between requests (except for the last one)
      if (i < Math.min(10, chunks.length) - 1) {
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = MIN_DELAY_MS - elapsedTime;

        if (remainingDelay > 0) {
          await delay(remainingDelay);
        }
      }
    } catch (error) {
      // Timeout occurred - log error and stop sending more messages
      console.error("SMS send timeout or error:", error);
      break;
    }
  }

  // Return true if all chunks were sent successfully
  return results.length > 0 && results.every((r) => r === true);
};
