const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SHORTXLINKS_API_KEY = process.env.SHORTXLINKS_API_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event) => {
  try {
    // Debug: Log headers for IP
    console.log("Headers:", event.headers);

    // Get IP address
    const ip = event.headers["x-forwarded-for"] || "unknown";

    // Generate a token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour from now

    // Create a long URL
    const longUrl = `https://yourdomain.com/protected-page?token=${token}`;
    console.log("Long URL:", longUrl);

    // Call the short link API
    const shortLinkResponse = await fetch(
      `https://shortxlinks.com/api?api=${SHORTXLINKS_API_KEY}&url=${encodeURIComponent(longUrl)}`
    );
    const shortLinkData = await shortLinkResponse.json();
    console.log("Short Link Response:", shortLinkData);

    if (!shortLinkData || !shortLinkData.shortenedUrl) {
      throw new Error("Failed to generate short link");
    }

    const shortUrl = shortLinkData.shortenedUrl;

    // Insert token into Supabase
    const { error } = await supabase.from("tokens").insert([
      { token, ip, expires_at: expiresAt },
    ]);

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    // Return the short URL
    return {
      statusCode: 200,
      body: JSON.stringify({ shortUrl }),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate token and short link" }),
    };
  }
};

// Generate a random token
function generateToken() {
  return Array(4)
    .fill(null)
    .map(() => Math.random().toString(36).substring(2, 8))
    .join("-");
}
