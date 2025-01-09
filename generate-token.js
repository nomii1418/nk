exports.handler = async (event) => {
  try {
    console.log("Request received");
    const ip = event.headers["x-forwarded-for"] || "unknown";
    console.log("IP Address:", ip);

    const token = generateToken();
    console.log("Generated Token:", token);

    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    console.log("Expires At:", expiresAt);

    const longUrl = `https://yourdomain.com/protected-page?token=${token}`;
    console.log("Long URL:", longUrl);

    const shortLinkResponse = await fetch(
      `https://shortxlinks.com/api?api=${process.env.SHORTXLINKS_API_KEY}&url=${encodeURIComponent(longUrl)}`
    );
    console.log("Short Link API Response Status:", shortLinkResponse.status);

    const shortLinkData = await shortLinkResponse.json();
    console.log("Short Link API Response Data:", shortLinkData);

    if (!shortLinkData || !shortLinkData.shortenedUrl) {
      throw new Error("Failed to generate short link");
    }

    const shortUrl = shortLinkData.shortenedUrl;
    console.log("Shortened URL:", shortUrl);

    const { error } = await supabase.from("tokens").insert([
      { token, ip, expires_at: expiresAt },
    ]);

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ shortUrl }),
    };
  } catch (err) {
    console.error("Error in generate-token function:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "An error occurred" }),
    };
  }
};
