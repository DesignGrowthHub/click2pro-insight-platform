import { getBlogPopupScriptConfig } from "@/lib/blog-popup/mappings";
import type { BlogPopupScriptConfig } from "@/lib/blog-popup/types";

export function buildBlogPopupEmbedScript(
  config: BlogPopupScriptConfig = getBlogPopupScriptConfig()
) {
  return `(() => {
  const baseConfig = ${JSON.stringify(config)};

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function normalizeBaseUrl(value) {
    return String(value || "").replace(/\\/+$/, "");
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/%20/g, " ")
      .replace(/[-_/]+/g, " ")
      .replace(/[^a-z0-9\\s]/g, " ")
      .replace(/\\s+/g, " ")
      .trim();
  }

  function extractPathname(url) {
    try {
      return new URL(url, window.location.origin).pathname.toLowerCase();
    } catch (error) {
      return window.location.pathname.toLowerCase();
    }
  }

  function getScriptElement() {
    return (
      document.currentScript ||
      Array.from(document.scripts).find((script) =>
        script.src && script.src.indexOf("click2pro-insight-popup") !== -1
      )
    );
  }

  function parseHints(rawHints, fallbackHints) {
    if (!rawHints) {
      return fallbackHints;
    }

    const parsed = String(rawHints)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return parsed.length ? parsed : fallbackHints;
  }

  function createRuntimeConfig(config) {
    const script = getScriptElement();
    const dataset = script && script.dataset ? script.dataset : {};
    const insightBaseUrl = normalizeBaseUrl(
      dataset.insightBaseUrl || config.insightBaseUrl
    );
    const delayMs = Number.parseInt(dataset.delayMs || String(config.delayMs), 10);

    return {
      ...config,
      insightBaseUrl,
      delayMs: Number.isFinite(delayMs) && delayMs > 0 ? delayMs : config.delayMs,
      sessionKey: dataset.sessionKey || config.sessionKey,
      articlePathHints: parseHints(dataset.articlePathHints, config.articlePathHints),
      fallback: {
        ...config.fallback,
        href: insightBaseUrl + config.fallback.routePath
      },
      mappings: config.mappings.map((mapping) => ({
        ...mapping,
        href: insightBaseUrl + mapping.routePath
      }))
    };
  }

  function getSessionFlag(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setSessionFlag(key) {
    try {
      window.sessionStorage.setItem(key, "1");
    } catch (error) {
      return;
    }
  }

  function isLikelyArticlePage(config) {
    const pathname = window.location.pathname.toLowerCase();

    if (
      config.articlePathHints.some((hint) =>
        pathname.indexOf(String(hint).toLowerCase()) !== -1
      )
    ) {
      return true;
    }

    if (document.querySelector("article")) {
      return true;
    }

    const ogType = document.querySelector('meta[property="og:type"]');
    if (
      ogType &&
      ogType.getAttribute("content") &&
      ogType.getAttribute("content").toLowerCase() === "article"
    ) {
      return true;
    }

    const segments = pathname.split("/").filter(Boolean);
    return segments.length >= 2 && pathname.indexOf("-") !== -1;
  }

  function collectSignals() {
    const metaKeywords =
      document.querySelector('meta[name="keywords"]')?.getAttribute("content") || "";
    const metaDescription =
      document
        .querySelector('meta[name="description"], meta[property="og:description"]')
        ?.getAttribute("content") || "";

    return {
      pathname: extractPathname(window.location.href),
      haystack: normalizeText(
        [
          window.location.href,
          document.title || "",
          metaKeywords,
          metaDescription
        ].join(" ")
      )
    };
  }

  function scoreMapping(mapping, signals) {
    const normalizedPath = normalizeText(signals.pathname);
    const haystack = signals.haystack;
    let score = 0;
    let slugHits = 0;
    let keywordHits = 0;
    let matchedBy = "keyword";
    const matchedTerms = [];

    [mapping.assessmentSlug, ...mapping.urlFragments].forEach((fragment) => {
      const token = normalizeText(fragment);

      if (!token) {
        return;
      }

      if (
        normalizedPath.indexOf(token) !== -1 ||
        haystack.indexOf(token) !== -1
      ) {
        score += fragment === mapping.assessmentSlug ? 9 : 6;
        slugHits += 1;
        matchedBy = "slug";
        matchedTerms.push(fragment);
      }
    });

    mapping.keywords.forEach((keyword) => {
      const token = normalizeText(keyword);

      if (!token || haystack.indexOf(token) === -1) {
        return;
      }

      score += token.indexOf(" ") !== -1 ? 4 : 2;
      keywordHits += 1;
      matchedTerms.push(keyword);
    });

    return {
      mapping,
      score,
      slugHits,
      keywordHits,
      matchedBy,
      matchedTerms: Array.from(new Set(matchedTerms))
    };
  }

  function resolveRecommendation(config) {
    const signals = collectSignals();
    const bestMatch = config.mappings
      .map((mapping) => scoreMapping(mapping, signals))
      .filter((match) => match.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (right.slugHits !== left.slugHits) {
          return right.slugHits - left.slugHits;
        }

        if ((right.mapping.priority || 0) !== (left.mapping.priority || 0)) {
          return (right.mapping.priority || 0) - (left.mapping.priority || 0);
        }

        return right.keywordHits - left.keywordHits;
      })[0];

    if (!bestMatch || bestMatch.score < 2) {
      return {
        kind: "fallback",
        matchedBy: "fallback",
        title: config.fallback.title,
        topicLabel: config.fallback.topicLabel,
        message: config.fallback.message,
        ctaLabel: config.fallback.ctaLabel,
        badgeLabel: config.fallback.badgeLabel,
        href: config.fallback.href,
        matchedTerms: [],
        score: 0
      };
    }

    return {
      kind: "assessment",
      matchedBy: bestMatch.matchedBy,
      title: bestMatch.mapping.assessmentTitle,
      topicLabel: bestMatch.mapping.topicLabel,
      message: bestMatch.mapping.contextualMessage,
      ctaLabel: bestMatch.mapping.ctaLabel,
      badgeLabel: bestMatch.mapping.badgeLabel,
      href: bestMatch.mapping.href,
      matchedTerms: bestMatch.matchedTerms,
      score: bestMatch.score,
      assessmentSlug: bestMatch.mapping.assessmentSlug,
      timeEstimate: bestMatch.mapping.timeEstimate,
      privacyNote: bestMatch.mapping.privacyNote,
      reportLabel: bestMatch.mapping.reportLabel
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function injectStyles() {
    if (document.getElementById("c2p-insight-popup-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "c2p-insight-popup-styles";
    style.textContent = [
      ".c2p-insight-popup{position:fixed;right:18px;bottom:18px;left:auto;z-index:2147483000;width:min(420px,calc(100vw - 24px));font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;opacity:0;transform:translateY(20px);transition:opacity .22s ease,transform .22s ease;}",
      ".c2p-insight-popup.is-visible{opacity:1;transform:translateY(0);}",
      ".c2p-insight-popup__panel{position:relative;overflow:hidden;border:1px solid rgba(148,163,184,.18);border-radius:24px;background:linear-gradient(180deg,rgba(17,24,39,.98),rgba(15,23,42,.98));box-shadow:0 26px 80px rgba(2,6,23,.45),inset 0 1px 0 rgba(255,255,255,.04);padding:22px;}",
      ".c2p-insight-popup__panel::before{content:'';position:absolute;inset:0 auto auto 0;height:1px;width:100%;background:linear-gradient(90deg,transparent,rgba(96,165,250,.45),transparent);pointer-events:none;}",
      ".c2p-insight-popup__eyebrow{font-size:11px;line-height:1.3;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#93C5FD;}",
      ".c2p-insight-popup__title{margin:12px 0 0;font-size:24px;line-height:1.12;font-weight:650;letter-spacing:-.03em;color:#F8FAFC;}",
      ".c2p-insight-popup__message{margin:12px 0 0;font-size:16px;line-height:1.7;color:#CBD5E1;}",
      ".c2p-insight-popup__meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}",
      ".c2p-insight-popup__meta-item{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(148,163,184,.12);border-radius:999px;background:rgba(255,255,255,.04);padding:8px 12px;font-size:12px;line-height:1.4;color:#CBD5E1;}",
      ".c2p-insight-popup__actions{display:flex;align-items:center;gap:12px;margin-top:18px;}",
      ".c2p-insight-popup__cta{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:16px;border:1px solid rgba(59,130,246,.45);background:linear-gradient(180deg,rgba(96,165,250,.98),rgba(59,130,246,.92));box-shadow:0 18px 40px rgba(59,130,246,.26);font-size:15px;font-weight:650;line-height:1;color:#F8FAFC;text-decoration:none;}",
      ".c2p-insight-popup__cta:hover{filter:brightness(1.04);}",
      ".c2p-insight-popup__dismiss{padding:0;border:none;background:none;font-size:14px;line-height:1.4;color:#94A3B8;cursor:pointer;}",
      ".c2p-insight-popup__dismiss:hover{color:#F8FAFC;}",
      ".c2p-insight-popup__footnote{margin-top:14px;font-size:12px;line-height:1.6;color:#64748B;}",
      "@media (max-width: 720px){.c2p-insight-popup{right:12px;left:12px;bottom:12px;width:auto;}.c2p-insight-popup__panel{padding:18px;}.c2p-insight-popup__title{font-size:21px;}.c2p-insight-popup__actions{flex-wrap:wrap;}.c2p-insight-popup__cta{width:100%;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function dismissPopup(root) {
    root.classList.remove("is-visible");
    window.setTimeout(() => {
      if (root.parentNode) {
        root.parentNode.removeChild(root);
      }
    }, 180);
  }

  function renderPopup(recommendation, config) {
    if (!document.body || document.querySelector(".c2p-insight-popup")) {
      return;
    }

    injectStyles();

    const root = document.createElement("aside");
    root.className = "c2p-insight-popup";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-label", "Insight assessment suggestion");

    const metaItems = [
      recommendation.timeEstimate || "",
      recommendation.privacyNote || ""
    ]
      .filter(Boolean)
      .map(
        (item) =>
          '<span class="c2p-insight-popup__meta-item">' + escapeHtml(item) + "</span>"
      )
      .join("");

    root.innerHTML =
      '<div class="c2p-insight-popup__panel">' +
      '<div class="c2p-insight-popup__eyebrow">' +
      escapeHtml(recommendation.badgeLabel) +
      "</div>" +
      '<h2 class="c2p-insight-popup__title">' +
      escapeHtml(recommendation.title) +
      "</h2>" +
      '<p class="c2p-insight-popup__message">' +
      escapeHtml(recommendation.message) +
      "</p>" +
      (metaItems ? '<div class="c2p-insight-popup__meta">' + metaItems + "</div>" : "") +
      '<div class="c2p-insight-popup__actions">' +
      '<a class="c2p-insight-popup__cta" href="' +
      escapeHtml(recommendation.href) +
      '">' +
      escapeHtml(recommendation.ctaLabel) +
      "</a>" +
      '<button type="button" class="c2p-insight-popup__dismiss" data-c2p-dismiss="true">Dismiss</button>' +
      "</div>" +
      '<p class="c2p-insight-popup__footnote">Structured insight, not diagnosis.</p>' +
      "</div>";

    const dismissButton = root.querySelector("[data-c2p-dismiss='true']");
    const ctaLink = root.querySelector(".c2p-insight-popup__cta");

    dismissButton?.addEventListener("click", () => dismissPopup(root));
    ctaLink?.addEventListener("click", () => setSessionFlag(config.sessionKey));

    document.body.appendChild(root);
    window.requestAnimationFrame(() => {
      root.classList.add("is-visible");
    });
    setSessionFlag(config.sessionKey);
  }

  function schedulePopup(recommendation, config) {
    window.setTimeout(() => {
      if (getSessionFlag(config.sessionKey) === "1") {
        return;
      }

      const show = () => renderPopup(recommendation, config);

      if (document.visibilityState === "hidden") {
        const onVisible = () => {
          if (document.visibilityState !== "visible") {
            return;
          }

          document.removeEventListener("visibilitychange", onVisible);
          show();
        };

        document.addEventListener("visibilitychange", onVisible);
        return;
      }

      show();
    }, config.delayMs);
  }

  onReady(() => {
    const runtimeConfig = createRuntimeConfig(baseConfig);

    if (getSessionFlag(runtimeConfig.sessionKey) === "1") {
      return;
    }

    if (!isLikelyArticlePage(runtimeConfig)) {
      return;
    }

    const recommendation = resolveRecommendation(runtimeConfig);
    schedulePopup(recommendation, runtimeConfig);
  });
})();`;
}
