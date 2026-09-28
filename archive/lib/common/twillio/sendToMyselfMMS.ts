const myHeaders = new Headers();
const authHeader = `Basic ${Buffer.from(process.env.TWILLIO_USERNAME_PASSWORD || "").toString("base64")}`;
myHeaders.append("Authorization", authHeader);

/**
 * Sends an MMS message with an image to my phone number via Twilio API
 *
 * @param mediaUrl - The publicly accessible URL of the image to send.
 *                   Supported formats: jpeg, jpg, gif, png (fully supported, up to 5MB)
 *                   Other formats accepted but may have limitations (up to 500KB)
 *                   The URL must be publicly accessible so Twilio can fetch it
 * @param bodyText - Optional text message to accompany the image
 * @returns Promise that resolves to true on success, false on failure
 *
 * @example
 * // Send just an image
 * await sendToMyselfMMS('https://example.com/chart.png');
 *
 * @example
 * // Send an image with text
 * await sendToMyselfMMS('https://example.com/chart.png', 'Here is the chart you requested');
 */
export const sendToMyselfMMS = async (mediaUrl: string, bodyText?: string): Promise<boolean> => {
  const TIMEOUT_MS = 60000; // 60 seconds

  // Validate that we have credentials
  if (!process.env.TWILLIO_USERNAME_PASSWORD) {
    console.warn("TWILLIO_USERNAME_PASSWORD not set, skipping MMS send");
    return true;
  }

  // Validate mediaUrl is provided
  if (!mediaUrl || !mediaUrl.trim()) {
    console.error("mediaUrl is required to send MMS");
    return false;
  }

  // Create form data with required parameters
  const formdata = new FormData();
  formdata.append("To", "13857706789");
  formdata.append("From", "19133649396");
  formdata.append("MediaUrl", mediaUrl);

  // Add optional body text if provided
  if (bodyText && bodyText.trim()) {
    formdata.append("Body", bodyText);
  }

  try {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`MMS request timed out after ${TIMEOUT_MS}ms`));
      }, TIMEOUT_MS);
    });

    // Create fetch promise
    const fetchPromise = fetch("https://api.twilio.com/2010-04-01/Accounts/AC258697f0ec08c434f11a2f19de0ce74b/Messages.json", {
      method: "POST",
      headers: myHeaders,
      body: formdata,
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Twilio MMS API error: ${response.status} - ${errorText}`);
      return false;
    }

    // Successfully sent
    const result = await response.json();
    console.log(`MMS sent successfully. SID: ${result.sid}, Status: ${result.status}`);
    return true;
  } catch (error) {
    console.error("Twilio MMS POST failed!", error);
    return false;
  }
};
