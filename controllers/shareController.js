

const expressAsyncHandler = require("express-async-handler");
const Article = require("../models/Articles");
const Podcast = require("../models/Podcast");
const { statusEnum } = require("../utils/StatusEnum");
const { getHTMLFileContent } = require('../utils/pocketbaseUtil');
const moment = require("moment");

module.exports.shareArticle = expressAsyncHandler(async (req, res) => {
  const { articleId, authorId, recordId } = req.query;

  if (!articleId) {
    return res.status(400).json({ message: "Article ID is required" });
  }

  try {

    const article = await Article.findById(articleId);

    if (!article || article.status !== statusEnum.PUBLISHED) {
      return res.status(404).json({ message: "Article not found" });
    }
    const dynamicLink = `https://ultimatehealth.page.link/article?articleId=${article._id}&authorId=${authorId}&recordId=${recordId}`;

    const htmlContent = generateProfessionalHTML(article, dynamicLink);
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error sharing article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports.sharePodcast = expressAsyncHandler(async (req, res) => {
  const { trackId, audioUrl } = req.query;

  if (!trackId) {
    return res.status(400).json({ message: "Track ID is required" });
  }

  try {

    const podcast = await Podcast.findById(trackId);

    if (!podcast || podcast.status !== statusEnum.PUBLISHED) {
      return res.status(404).json({ message: "Podcast not found" });
    }
    const dynamicLink = `https://ultimatehealth.page.link/podcast?trackId=${podcast._id}&audioUrl=${audioUrl}`;

    const htmlContent = generatePodcastHTML(podcast, dynamicLink);
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error sharing podcast:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports.generateBlogPage = expressAsyncHandler(async (req, res) => {

  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ message: "Slug is required" });
  }

  try {

    const article = await Article.findOne({ pb_recordId: slug }).populate("authorId", "Profile_image user_name").exec();

    if (!article || article.status !== statusEnum.PUBLISHED || article.isRemoved) {
      return res.status(404).json({ message: "Article not found" });
    }

    
    const profileImageUrl = article.authorId.Profile_image && article.authorId.Profile_image.startsWith("https") ? article.authorId.Profile_image : `https://uhsocial.in/api/getfile/${article.authorId.Profile_image}`;
    const htmlRes = await getHTMLFileContent("content", slug);

    const htmlContent = generateBlogContent(htmlRes.htmlContent, article, profileImageUrl);

    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error generating blog page:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


function generateBlogContent(htmlContent, article, profileImageUrl) {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${article.title} | UltimateHealth</title>
  <meta name="description" content="${article.title}" />

  <style>

    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(to bottom, #f7fbff, #ffffff);
      color: #2c2c2c;
    }

    .container {
      max-width: 900px;
      margin: 40px auto;
      padding: 40px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    }

    h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #0a3d62;
    }

    .publish-date {
      color: #777;
      font-size: 14px;
      margin-bottom: 30px;
    }

    /* Article Preview */
    .article-preview-wrapper {
      position: relative;
      max-height: 600px;
      overflow: hidden;
    }

    .article-content {
      line-height: 1.8;
      font-size: 17px;
      color: #444;
    }

    .fade-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 220px;
      background: linear-gradient(to bottom, rgba(255,255,255,0), #ffffff);
    }

    /* Footer */
    .preview-footer {
      margin-top: 60px;
      padding: 50px 30px;
      background: #f4f9fc;
      border-radius: 14px;
      text-align: center;
    }

    /* Contributor */
    .contributor-box {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .contributor-img {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #00698f;
    }

    .contributor-info {
      max-width: 400px;
      text-align: left;
    }

    .contributor-info h4 {
      margin: 0 0 6px 0;
      font-size: 18px;
      color: #0a3d62;
    }

    .contributor-info p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    /* CTA Section */
    .cta-section h3 {
      font-size: 22px;
      margin-bottom: 12px;
      color: #0a3d62;
    }

    .cta-section p {
      margin-bottom: 25px;
      color: #555;
      font-size: 15px;
    }

    .btn {
      display: inline-block;
      padding: 14px 28px;
      margin: 10px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #00698f;
      color: #fff;
      box-shadow: 0 6px 16px rgba(0,105,143,0.25);
    }

    .btn-primary:hover {
      background: #005374;
      transform: translateY(-2px);
    }

    .btn-dark {
      background: #000;
      color: #fff;
    }

    .btn-dark:hover {
      background: #222;
      transform: translateY(-2px);
    }

    /* Bigger Copyright Section */
    .copyright-section {
      margin-top: 60px;
      padding: 30px;
      background: #0a3d62;
      color: #ffffff;
      border-radius: 12px;
    }

    .copyright-section h4 {
      margin: 0 0 10px 0;
      font-size: 18px;
    }

    .copyright-section p {
      margin: 0;
      font-size: 14px;
      opacity: 0.85;
    }

  </style>
</head>

<body>

  <div class="container">

    <h1>${article.title}</h1>
    <p class="publish-date">
      Published on ${moment(article.lastUpdated).format("MMMM D, YYYY")}
    </p>

    <div class="article-preview-wrapper">

      <div class="article-content">
        ${htmlContent}
      </div>

      <div class="fade-overlay"></div>

    </div>

    <footer class="preview-footer">

      <div class="contributor-box">
        <img src="${profileImageUrl}" 
             alt="${article.authorId.user_name}" 
             class="contributor-img" />

        <div class="contributor-info">
          <h4>${article.authorId.user_name}</h4>
          <p>Health Enthusiast | UltimateHealth Contributor</p>
        </div>
      </div>

      <div class="cta-section">
        <h3>Continue Reading Inside UltimateHealth App</h3>
        <p>
          Unlock full articles, multilingual health insights,
          and complete contributor profiles inside the app.
        </p>

        <a href="https://play.google.com/store/apps/details?id=com.anonymous.UltimateHealth"
           target="_blank"
           class="btn btn-primary">
           Download on Play Store
        </a>

        <a href="#"
           target="_blank"
           class="btn btn-dark">
           Download on App Store
        </a>
      </div>

      <div class="copyright-section">
        <h4>UltimateHealth © 2026</h4>
        <p>
          All rights reserved. This preview content is protected under
          applicable copyright laws. Unauthorized reproduction or distribution
          is strictly prohibited.
        </p>
      </div>

    </footer>

  </div>

</body>
</html>
  `;
}


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
