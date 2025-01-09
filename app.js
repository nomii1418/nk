// Initialize Supabase client
const supabaseUrl = 'https://avsmzgicpdyosmmiwigu.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2c216Z2ljcGR5b3NtbWl3aWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MTgyODMsImV4cCI6MjA1MTk5NDI4M30.W3iE6rNG0gXHU1h3xz7VeHm9WVCifrcSh0j6CGPtoJE'; // Replace with your Supabase Anon key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById("generateTokenButton").addEventListener("click", async () => {
  const button = document.getElementById("generateTokenButton");
  const redirectLink = document.getElementById("redirectLink");
  const tokenLink = document.getElementById("tokenLink");

  button.textContent = "Generating...";
  button.disabled = true;

  try {
    // Generate a random token
    const token = generateToken();

    // Calculate expiration time (1 hour from now)
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    // Insert the token into Supabase
    const { data, error } = await supabase.from('tokens').insert([
      { token, ip: 'user-ip', expires_at: expiresAt }
    ]);

    if (error) {
      throw new Error(error.message);
    }

    // Generate the link (you can replace this with the actual link you want to redirect to)
    const longUrl = `https://nomii1418.github.io/nk/protected-page?token=${token}`;

    // Shorten the link using a URL shortening service (optional)
    const shortLink = await shortenLink(longUrl);

    // Show the generated short link to the user
    tokenLink.href = shortLink;
    redirectLink.style.display = "block";
    button.style.display = "none";

  } catch (err) {
    alert(`Error: ${err.message}`);
    button.textContent = "Generate Token";
    button.disabled = false;
  }
});

// Function to generate a random token
function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Function to shorten URL (optional)
async function shortenLink(longUrl) {
  const response = await fetch(`https://shortxlinks.com/api?api=af0701d2e65d26495fb8ee53c8b566b8640aea35&url=${encodeURIComponent(longUrl)}`);
  const data = await response.json();
  return data.shortenedUrl;
}
