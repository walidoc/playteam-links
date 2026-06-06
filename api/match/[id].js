const SUPABASE_URL = 'https://chuvddscyjgxmtypvlkp.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodXZkZHNjeWpneG10eXB2bGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzkyNDYsImV4cCI6MjA3MTYxNTI0Nn0.cSBwfUVQSmoDPx_8bSMSsfr7A2xvcxOW2mvaSnRTuew';

const SPORT_IMAGES = {
  Football: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1200',
  Soccer: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1200',
  Basketball: 'https://images.pexels.com/photos/945471/basketball-ball-823381-945471.jpeg?auto=compress&cs=tinysrgb&w=1200',
};
const DEFAULT_IMAGE = SPORT_IMAGES.Football;

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')}${ampm}`;
}

module.exports = async (req, res) => {
  const { id } = req.query;

  let title = 'PlayTeam – Join the Match';
  let description = 'Open PlayTeam to view match details and join.';
  let image = DEFAULT_IMAGE;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/matches?id=eq.${id}&select=sport_type,location_name,date,start_time,missing_players,is_public,image_url`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const matches = await response.json();
    const match = matches?.[0];

    if (match) {
      const sport = match.sport_type === 'Soccer' ? 'Football' : (match.sport_type || 'Sports');
      const location = match.location_name || '';
      const date = match.date
        ? new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        : '';
      const time = formatTime(match.start_time);
      const spots = match.missing_players > 0 ? `${match.missing_players} spot${match.missing_players > 1 ? 's' : ''} left` : 'Match is full';

      title = `${sport} at ${location}`;
      description = `${date}${time ? ` at ${time}` : ''} · ${spots} · Join on PlayTeam!`;
      image = match.image_url || SPORT_IMAGES[match.sport_type] || DEFAULT_IMAGE;
    }
  } catch (_) {
    // fall through to defaults
  }

  const pageUrl = `https://www.playteamapp.com/match/${id}?invite=true`;
  const deepLink = `playteam://match/${id}?invite=true`;

  const escaped = (s) => s.replace(/"/g, '&quot;').replace(/</g, '&lt;');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escaped(title)}</title>

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escaped(pageUrl)}" />
  <meta property="og:title" content="${escaped(title)}" />
  <meta property="og:description" content="${escaped(description)}" />
  <meta property="og:image" content="${escaped(image)}" />
  <meta property="og:site_name" content="PlayTeam" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escaped(title)}" />
  <meta name="twitter:description" content="${escaped(description)}" />
  <meta name="twitter:image" content="${escaped(image)}" />

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f0f;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #1c1c1e;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .logo { font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
    .logo span { color: #0A84FF; }
    .tagline { color: #8e8e93; font-size: 15px; margin-bottom: 40px; }
    .status { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
    .description { color: #8e8e93; font-size: 14px; line-height: 1.6; margin-bottom: 36px; }
    .btn-primary {
      display: block; background: #0A84FF; color: #fff; text-decoration: none;
      padding: 16px 24px; border-radius: 14px; font-size: 17px; font-weight: 600;
      margin-bottom: 12px; cursor: pointer; border: none; width: 100%;
    }
    .btn-primary:active { opacity: 0.85; }
    .btn-secondary {
      display: block; background: #2c2c2e; color: #8e8e93; text-decoration: none;
      padding: 16px 24px; border-radius: 14px; font-size: 15px; font-weight: 500;
      cursor: pointer; border: none; width: 100%;
    }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #2c2c2e;
      border-top-color: #0A84FF; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 24px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Play<span>Team</span></div>
    <div class="tagline">Find and join sports matches near you</div>

    <div id="state-opening">
      <div class="spinner"></div>
      <div class="status">Opening PlayTeam…</div>
      <div class="description">If the app doesn't open automatically, tap the button below.</div>
      <button class="btn-primary" id="btn-open">Open in PlayTeam</button>
    </div>

    <div id="state-not-installed" class="hidden">
      <div class="status">Get PlayTeam</div>
      <div class="description">
        You need the PlayTeam app to join this match.<br/>
        Download it to see what your friend invited you to.
      </div>
      <a class="btn-primary" href="https://apps.apple.com/app/playteam" id="btn-appstore">
        Download on the App Store
      </a>
      <button class="btn-secondary" id="btn-retry">Already installed? Try again</button>
    </div>
  </div>

  <script>
    const deepLink = '${deepLink}';
    function tryOpen() {
      window.location.href = deepLink;
      setTimeout(() => {
        document.getElementById('state-opening').classList.add('hidden');
        document.getElementById('state-not-installed').classList.remove('hidden');
      }, 2000);
    }
    document.getElementById('btn-open').addEventListener('click', tryOpen);
    document.getElementById('btn-retry').addEventListener('click', () => {
      document.getElementById('state-not-installed').classList.add('hidden');
      document.getElementById('state-opening').classList.remove('hidden');
      tryOpen();
    });
    tryOpen();
  </script>
</body>
</html>`);
};
