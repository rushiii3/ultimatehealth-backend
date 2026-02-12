

const expressAsyncHandler = require("express-async-handler");
const Article = require("../models/Articles");
const Podcast = require("../models/Podcast");
const { statusEnum } = require("../utils/StatusEnum");

module.exports.shareArticle = expressAsyncHandler(async (req, res) => {
    const { articleId, authorId, recordId } = req.query;

    if(!articleId) {
        return res.status(400).json({ message: "Article ID is required" });
    }

    try{

        const article = await Article.findById(articleId);

        if(!article || article.status !== statusEnum.statusEnum.PUBLISHED) {
            return res.status(404).json({ message: "Article not found" });
        }
        const dynamicLink = `https://ultimatehealth.page.link/article?articleId=${article._id}&authorId=${authorId}&recordId=${recordId}`;

        const htmlContent = generateProfessionalHTML(article, dynamicLink);
        res.setHeader("Content-Type", "text/html");
        res.send(htmlContent);
    }catch(error){
        console.error("Error sharing article:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports.sharePodcast = expressAsyncHandler(async (req, res) => {
    const { trackId, audioUrl } = req.query;

    if(!trackId) {
        return res.status(400).json({ message: "Track ID is required" });
    }

    try{

        const podcast = await Podcast.findById(trackId);

        if(!podcast || podcast.status !== statusEnum.statusEnum.PUBLISHED) {
            return res.status(404).json({ message: "Podcast not found" });
        }
        const dynamicLink = `https://ultimatehealth.page.link/podcast?trackId=${podcast._id}&audioUrl=${audioUrl}`;

        const htmlContent = generatePodcastHTML(podcast, dynamicLink);
        res.setHeader("Content-Type", "text/html");
        res.send(htmlContent);
    }catch(error){
        console.error("Error sharing podcast:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


function generateProfessionalHTML(article, dynamicLink) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>${article.title}</title>

    <!-- Open Graph -->
    <meta property="og:title" content="${article.title}" />
    <meta property="og:description" content="${article.description}" />
    <meta property="og:image" content="${article.thumbnail}" />
    <meta property="og:type" content="article" />

    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        background: #f5f7fa;
        color: #222;
      }

      .container {
        max-width: 720px;
        margin: auto;
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border-radius: 16px;
        overflow: hidden;
      }

      .hero img {
        width: 100%;
        height: auto;
        display: block;
      }

      .content {
        padding: 24px;
      }

      h1 {
        margin: 0 0 16px;
        font-size: 26px;
      }

      p {
        color: #555;
        line-height: 1.6;
      }

      .btn {
        display: inline-block;
        padding: 14px 24px;
        margin-top: 20px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
      }

      .primary {
        background: #111;
        color: white;
      }

      .secondary {
        background: #e9ecef;
        color: #111;
        margin-left: 10px;
      }

      .footer {
        text-align: center;
        padding: 20px;
        font-size: 14px;
        color: #888;
      }
    </style>
  </head>

  <body>

    <div class="container">

      <div class="hero">
        <img src="${article.thumbnail}" alt="Article Image" />
      </div>

      <div class="content">
        <h1>${article.title}</h1>
        <p>${article.description}</p>

        <a href="${dynamicLink}" class="btn primary">
          Open in UltimateHealth App
        </a>

        <a href="https://play.google.com/store/apps/details?id=com.anonymous.UltimateHealth"
           class="btn secondary">
          Download App
        </a>
      </div>

      <div class="footer">
        For the best experience, open this article inside the UltimateHealth app.
      </div>

    </div>

  </body>
  </html>
  `;
}

function generatePodcastHTML(podcast, dynamicLink) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>${podcast.title}</title>

    <!-- Open Graph -->
    <meta property="og:title" content="${podcast.title}" />
    <meta property="og:description" content="${podcast.description}" />
    <meta property="og:image" content="${podcast.audio_url}" />
    <meta property="og:type" content="voice" />

    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        background: #f4f6f9;
        color: #222;
      }

      .container {
        max-width: 720px;
        margin: auto;
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border-radius: 16px;
        overflow: hidden;
      }

      .hero img {
        width: 100%;
        display: block;
      }

      .content {
        padding: 24px;
      }

      h1 {
        margin: 0 0 16px;
        font-size: 26px;
      }

      p {
        color: #555;
        line-height: 1.6;
      }

      .btn {
        display: inline-block;
        padding: 14px 24px;
        margin-top: 20px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
      }

      .primary {
        background: #111;
        color: white;
      }

      .secondary {
        background: #e9ecef;
        color: #111;
        margin-left: 10px;
      }

      .footer {
        text-align: center;
        padding: 20px;
        font-size: 14px;
        color: #888;
      }
    </style>
  </head>

  <body>

    <div class="container">

      <div class="hero">
        <img src="${podcast.audio_url}" alt="Podcast Cover" />
      </div>

      <div class="content">
        <h1>${podcast.title}</h1>
        <p>${podcast.description}</p>

        <a href="${dynamicLink}" class="btn primary">
          Listen in UltimateHealth App
        </a>

        <a href="https://play.google.com/store/apps/details?id=com.anonymous.UltimateHealth"
           class="btn secondary">
          Download App
        </a>
      </div>

      <div class="footer">
        For the best experience, listen inside the UltimateHealth app.
      </div>

    </div>

  </body>
  </html>
  `;
}
