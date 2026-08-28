(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatLastSharingExcessDistribution(timestamp) {
    if (timestamp == null || timestamp === "") return null;
    var value = Number(timestamp);
    if (!Number.isFinite(value)) return null;
    return new Date(value * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  window.formatLastSharingExcessDistribution = formatLastSharingExcessDistribution;

  function formatLastDistributionSubtitle(timestamp) {
    var formatted = formatLastSharingExcessDistribution(timestamp);
    return formatted
      ? "Last Sharing Excess delivery: " + formatted
      : "Last Sharing Excess delivery: —";
  }

  window.formatLastDistributionSubtitle = formatLastDistributionSubtitle;

  var lastDistributionByPlaceIdCache = null;
  var lastDistributionFetchPromise = null;

  function fetchLastDistributionByPlaceId() {
    if (lastDistributionByPlaceIdCache) {
      return Promise.resolve(lastDistributionByPlaceIdCache);
    }
    if (lastDistributionFetchPromise) {
      return lastDistributionFetchPromise;
    }

    var profileElements = document.querySelectorAll("[data-last-distribution-place-id]");
    var singlePlaceId =
      profileElements.length === 1
        ? profileElements[0].getAttribute("data-last-distribution-place-id")
        : null;

    if (singlePlaceId) {
      lastDistributionFetchPromise = fetch(
        getApiOrigin() +
          "/public/find_food/profiles/" +
          encodeURIComponent(singlePlaceId),
      )
        .then(function (res) {
          if (!res.ok) {
            throw new Error("Find food profile failed (" + res.status + ")");
          }
          return res.json();
        })
        .then(function (profile) {
          var byPlaceId = {};
          if (profile && profile.googlePlaceId) {
            byPlaceId[profile.googlePlaceId] =
              profile.lastSharingExcessDistribution ?? null;
          }
          lastDistributionByPlaceIdCache = byPlaceId;
          return byPlaceId;
        })
        .catch(function (error) {
          lastDistributionFetchPromise = null;
          throw error;
        });

      return lastDistributionFetchPromise;
    }

    lastDistributionFetchPromise = fetch(getApiOrigin() + "/public/find_food/profiles")
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Find food profiles failed (" + res.status + ")");
        }
        return res.json();
      })
      .then(function (data) {
        var byPlaceId = {};
        (data.profiles || []).forEach(function (profile) {
          if (profile && profile.googlePlaceId) {
            byPlaceId[profile.googlePlaceId] =
              profile.lastSharingExcessDistribution ?? null;
          }
        });
        lastDistributionByPlaceIdCache = byPlaceId;
        return byPlaceId;
      })
      .catch(function (error) {
        lastDistributionFetchPromise = null;
        throw error;
      });

    return lastDistributionFetchPromise;
  }

  window.fetchLastDistributionByPlaceId = fetchLastDistributionByPlaceId;

  function hydrateLastDistributionElements() {
    var elements = document.querySelectorAll("[data-last-distribution-place-id]");
    if (elements.length === 0) return;

    fetchLastDistributionByPlaceId()
      .then(function (byPlaceId) {
        elements.forEach(function (element) {
          var placeId = element.getAttribute("data-last-distribution-place-id");
          if (!placeId) return;
          element.textContent = formatLastDistributionSubtitle(byPlaceId[placeId]);
        });
      })
      .catch(function () {
        /* Keep build-time placeholder on failure. */
      });
  }

  function formatHours(hours) {
    if (!hours || !hours.weekdayDescriptions || hours.weekdayDescriptions.length === 0) {
      return "";
    }
    return hours.weekdayDescriptions.map(escapeHtml).join("<br>");
  }

  function formatPhone(details) {
    return details.nationalPhoneNumber || details.internationalPhoneNumber || "";
  }

  function formatAddress(details) {
    return details.formattedAddress || "";
  }

  function formatAccessibility(options) {
    if (!options) return "";

    var items = [];
    if (options.wheelchairAccessibleParking) {
      items.push("Wheelchair accessible parking");
    }
    if (options.wheelchairAccessibleEntrance) {
      items.push("Wheelchair accessible entrance");
    }
    if (options.wheelchairAccessibleRestroom) {
      items.push("Wheelchair accessible restroom");
    }
    if (options.wheelchairAccessibleSeating) {
      items.push("Wheelchair accessible seating");
    }

    return items.map(escapeHtml).join(", ");
  }

  function renderPhotoAttributions(attributions) {
    if (!attributions || attributions.length === 0) return "";

    return attributions
      .map(function (attr) {
        var name = attr.displayName ? escapeHtml(attr.displayName) : "Contributor";
        if (attr.uri) {
          return (
            '<a href="' +
            escapeHtml(attr.uri) +
            '" target="_blank" rel="noopener noreferrer">' +
            name +
            "</a>"
          );
        }
        return name;
      })
      .join(", ");
  }

  function renderPhotoHtml(photo, compact) {
    if (!photo || !photo.uri) return "";

    var attributions = renderPhotoAttributions(photo.attributions);
    var html =
      '<figure class="find-food-photo' +
      (compact ? " find-food-photo-compact" : "") +
      '">' +
      '<img src="' +
      escapeHtml(photo.uri) +
      '" alt="" loading="lazy" />';

    if (attributions) {
      html +=
        '<figcaption class="find-food-photo-attribution">Photo: ' +
        attributions +
        "</figcaption>";
    }

    html += "</figure>";
    return html;
  }

  function renderDirectionsButton(googleMapsUri, className) {
    if (!googleMapsUri) return "";
    return (
      '<a href="' +
      escapeHtml(googleMapsUri) +
      '" class="' +
      (className || "find-food-directions-link") +
      '" target="_blank" rel="noopener noreferrer">Get directions</a>'
    );
  }

  function renderPreviewHtml(details) {
    var parts = [];

    if (details.primaryTypeDisplayName) {
      parts.push(escapeHtml(details.primaryTypeDisplayName));
    }

    var address = formatAddress(details);
    if (address) {
      parts.push(escapeHtml(address));
    }

    if (details.photos && details.photos.length > 0) {
      parts.push(renderPhotoHtml(details.photos[0], true));
    }

    if (details.googleMapsUri) {
      parts.push(renderDirectionsButton(details.googleMapsUri, "find-food-popup-directions"));
    }

    return parts.join("");
  }

  var MAP_PIN_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';

  function phoneTelHref(phone) {
    return "tel:" + String(phone).replace(/[^\d+]/g, "");
  }

  function renderMapPanelCoverAttributionOverlay(details) {
    if (!details || !details.photos || details.photos.length === 0) return "";
    var attributions = renderPhotoAttributions(details.photos[0].attributions);
    if (!attributions) return "";
    return (
      '<p class="find-food-map-panel-cover-attribution">' +
      "<span>Photo: " +
      attributions +
      "</span></p>"
    );
  }

  function renderMapPanelCoverHtml(details) {
    var inner;
    if (details && details.photos && details.photos.length > 0) {
      inner =
        '<img src="' +
        escapeHtml(details.photos[0].uri) +
        '" alt="" loading="lazy" />';
    } else {
      inner =
        '<div class="find-food-map-panel-cover-placeholder" aria-hidden="true"></div>';
    }
    return inner + renderMapPanelCoverAttributionOverlay(details);
  }

  function renderGoogleAttribution(googleMapsUri) {
    if (!googleMapsUri) return "";
    return (
      '<p class="find-food-map-panel-google-attribution">' +
      "Information provided by " +
      '<a href="' +
      escapeHtml(googleMapsUri) +
      '" target="_blank" rel="noopener noreferrer">Google</a>' +
      "</p>"
    );
  }

  function renderMapPanelDetailsHtml(details) {
    if (!details) return "";

    var parts = [];
    var address = formatAddress(details);

    if (address) {
      parts.push(
        '<p class="find-food-map-panel-detail">' + escapeHtml(address) + "</p>",
      );
    }

    var phone = formatPhone(details);
    if (phone) {
      parts.push(
        '<a class="find-food-map-panel-phone" href="' +
          escapeHtml(phoneTelHref(phone)) +
          '">' +
          escapeHtml(phone) +
          "</a>",
      );
    }

    if (details.googleMapsUri) {
      parts.push(renderGoogleAttribution(details.googleMapsUri));
    }

    return parts.join("");
  }

  function buildFindFoodMapPanelHtml(props, detailsPayload) {
    var details =
      detailsPayload && detailsPayload.__details ? detailsPayload.__details : null;
    var detailsSection = renderMapPanelDetailsHtml(details);

    var lastDelivery = "";
    if (typeof window.formatLastSharingExcessDistribution === "function") {
      var formatted = window.formatLastSharingExcessDistribution(
        props.lastSharingExcessDistribution,
      );
      if (formatted) {
        lastDelivery = formatted;
      }
    }

    var badgeLabel = [props.city, props.state].filter(Boolean).join(", ");
    var coverHtml = renderMapPanelCoverHtml(details);

    var headerHtml = "";
    if (badgeLabel) {
      headerHtml =
        '<div class="find-food-map-panel-header">' +
        '<span class="find-food-map-panel-badge">' +
        MAP_PIN_ICON +
        escapeHtml(badgeLabel) +
        "</span>" +
        "</div>";
    }

    var actionsHtml = '<div class="find-food-map-panel-actions">';
    if (props.profileUrl) {
      actionsHtml +=
        '<a class="find-food-map-panel-link" href="' +
        escapeHtml(props.profileUrl) +
        '">View location details</a>';
    }
    if (details && details.googleMapsUri) {
      actionsHtml +=
        '<a class="find-food-map-panel-directions" href="' +
        escapeHtml(details.googleMapsUri) +
        '" target="_blank" rel="noopener noreferrer">Get directions</a>';
    }
    actionsHtml += "</div>";

    var html =
      '<button type="button" class="find-food-map-panel-close" aria-label="Close location details">&times;</button>' +
      '<div class="find-food-map-panel-cover">' +
      coverHtml +
      "</div>" +
      headerHtml +
      '<div class="find-food-map-panel-body">';

    html +=
      '<h3 class="find-food-map-panel-title">' +
      escapeHtml(props.name) +
      "</h3>" +
      '<p class="find-food-map-panel-subtitle">' +
      (lastDelivery
        ? "Last Sharing Excess delivery: " + escapeHtml(lastDelivery)
        : "Last Sharing Excess delivery: —") +
      "</p>";

    if (detailsSection) {
      html += '<div class="find-food-map-panel-details">' + detailsSection + "</div>";
    }

    html += actionsHtml + "</div>";
    return html;
  }

  window.buildFindFoodMapPanelHtml = buildFindFoodMapPanelHtml;

  function renderProfilePhotoAttributionOverlay(photo) {
    if (!photo) return "";
    var attributions = renderPhotoAttributions(photo.attributions);
    if (!attributions) return "";
    return (
      '<p class="find-food-profile-photo-attribution">' +
      "<span>Photo: " +
      attributions +
      "</span></p>"
    );
  }

  function renderProfilePhotoGridHtml(details) {
    if (!details.photos || details.photos.length <= 1) return "";

    var extraPhotos = details.photos.slice(1, 5);
    if (extraPhotos.length === 0) return "";

    var cells = extraPhotos
      .map(function (photo) {
        if (!photo || !photo.uri) return "";
        return (
          '<figure class="find-food-profile-photo-cell">' +
          '<img src="' +
          escapeHtml(photo.uri) +
          '" alt="" loading="lazy" />' +
          renderProfilePhotoAttributionOverlay(photo) +
          "</figure>"
        );
      })
      .filter(Boolean);

    if (cells.length === 0) return "";

    return '<div class="find-food-profile-photo-grid">' + cells.join("") + "</div>";
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + "\u2026";
  }

  function formatWebsiteHostname(websiteUri) {
    try {
      var host = new URL(websiteUri).hostname.replace(/^www\./i, "");
      return truncateText(host, 32);
    } catch (_error) {
      return truncateText(String(websiteUri), 32);
    }
  }

  function renderProfileBadge(href, label, title) {
    return (
      '<a class="find-food-profile-badge" href="' +
      escapeHtml(href) +
      '" target="_blank" rel="noopener noreferrer"' +
      (title ? ' title="' + escapeHtml(title) + '"' : "") +
      ">" +
      escapeHtml(label) +
      "</a>"
    );
  }

  function renderProfileField(label, valueHtml, fullWidth, column) {
    var className = "find-food-profile-field";
    if (fullWidth) className += " find-food-profile-field--full";
    if (column === 1) className += " find-food-profile-field--col-1";
    if (column === 2) className += " find-food-profile-field--col-2";

    return (
      '<div class="' +
      className +
      '">' +
      '<div class="find-food-profile-field-label">' +
      escapeHtml(label) +
      "</div>" +
      '<div class="find-food-profile-field-value">' +
      valueHtml +
      "</div></div>"
    );
  }

  function renderProfileFieldsHtml(details) {
    var fields = [];

    var photoGrid = renderProfilePhotoGridHtml(details);
    if (photoGrid) {
      fields.push(
        '<div class="find-food-profile-field find-food-profile-field--full find-food-profile-photo-row">' +
          photoGrid +
          "</div>",
      );
    }

    var address = formatAddress(details);
    if (address) {
      fields.push(renderProfileField("Address", escapeHtml(address), false, 1));
    }

    if (details.googleMapsUri) {
      fields.push(
        renderProfileField(
          "Directions",
          renderProfileBadge(
            details.googleMapsUri,
            "Open in Google Maps \uD83D\uDD17",
            "Open in Google Maps",
          ),
          false,
          2,
        ),
      );
    }

    if (details.websiteUri) {
      fields.push(
        renderProfileField(
          "Website",
          renderProfileBadge(
            details.websiteUri,
            formatWebsiteHostname(details.websiteUri),
            details.websiteUri,
          ),
          false,
          1,
        ),
      );
    }

    var phone = formatPhone(details);
    if (phone) {
      fields.push(
        renderProfileField(
          "Phone",
          '<a href="' +
            escapeHtml(phoneTelHref(phone)) +
            '">' +
            escapeHtml(phone) +
            "</a>",
          false,
          2,
        ),
      );
    }

    var hours = formatHours(details.regularOpeningHours || details.currentOpeningHours);
    if (hours) {
      fields.push(renderProfileField("Hours", hours, true));
    }

    var accessibility = formatAccessibility(details.accessibilityOptions);
    if (accessibility) {
      fields.push(renderProfileField("Accessibility", accessibility, true));
    }

    if (details.googleMapsUri) {
      fields.push(renderGoogleAttribution(details.googleMapsUri).replace(
        "find-food-map-panel-google-attribution",
        "find-food-profile-google-attribution",
      ));
    }

    if (fields.length === 0) {
      return (
        '<p class="find-food-place-details-error">No additional details available.</p>'
      );
    }

    return '<div class="find-food-profile-fields">' + fields.join("") + "</div>";
  }

  function renderProfileContentHtml(details, locationName) {
    return renderProfileFieldsHtml(details);
  }

  function hydrateProfileCover(block, details) {
    var card = block.closest(".find-food-profile-card");
    var coverEl = card ? card.querySelector("[data-profile-cover]") : null;
    if (!coverEl) return;
    coverEl.innerHTML = renderMapPanelCoverHtml(details);
  }

  function renderFullHtml(details, locationName) {
    var sections = [];

    if (details.photos && details.photos.length > 0) {
      sections.push(
        '<div class="find-food-photo-gallery">' +
          details.photos
            .slice(0, 3)
            .map(function (photo) {
              return renderPhotoHtml(photo, false);
            })
            .join("") +
          "</div>",
      );
    }

    if (details.googleMapsUri) {
      sections.push(
        '<div class="find-food-place-details-actions">' +
          renderDirectionsButton(details.googleMapsUri, "button sm w-inline-block") +
          "</div>",
      );
    }

    var rows = [];

    if (details.primaryTypeDisplayName) {
      rows.push(
        "<div><dt>Type</dt><dd>" +
          escapeHtml(details.primaryTypeDisplayName) +
          "</dd></div>",
      );
    }

    var address = formatAddress(details);
    if (address) {
      rows.push("<div><dt>Address</dt><dd>" + escapeHtml(address) + "</dd></div>");
    }

    var phone = formatPhone(details);
    if (phone) {
      rows.push("<div><dt>Phone</dt><dd>" + escapeHtml(phone) + "</dd></div>");
    }

    if (details.websiteUri) {
      rows.push(
        '<div><dt>Website</dt><dd><a href="' +
          escapeHtml(details.websiteUri) +
          '" target="_blank" rel="noopener noreferrer">Visit website</a></dd></div>',
      );
    }

    var hours = formatHours(details.regularOpeningHours || details.currentOpeningHours);
    if (hours) {
      rows.push("<div><dt>Hours</dt><dd>" + hours + "</dd></div>");
    }

    if (details.businessStatus) {
      rows.push(
        "<div><dt>Status</dt><dd>" + escapeHtml(details.businessStatus) + "</dd></div>",
      );
    }

    var accessibility = formatAccessibility(details.accessibilityOptions);
    if (accessibility) {
      rows.push("<div><dt>Accessibility</dt><dd>" + accessibility + "</dd></div>");
    }

    if (rows.length > 0) {
      sections.push("<dl>" + rows.join("") + "</dl>");
      sections.push(
        '<p class="find-food-place-details-disclaimer">Hours from Google — confirm before visiting.</p>',
      );
    } else if (sections.length === 0) {
      return (
        '<p class="find-food-place-details-error">No additional details available for ' +
        escapeHtml(locationName) +
        ".</p>"
      );
    }

    return sections.join("");
  }

  function getApiOrigin() {
    if (window.__SE_SURPLUS_API_ORIGIN) return window.__SE_SURPLUS_API_ORIGIN;
    var host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8080";
    }
    return "https://api.sharingexcess.com";
  }

  function fetchPlaceDetails(placeId) {
    var origin = getApiOrigin();
    return fetch(origin + "/public/find_food/places/" + encodeURIComponent(placeId) + "/details")
      .then(function (res) {
        if (!res.ok) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (body) {
              var message = body.message || "Unable to load location details.";
              if (res.status === 429) {
                message = "Too many requests — please try again in a moment.";
              } else if (res.status === 502) {
                message = "Location details are temporarily unavailable.";
              }
              throw new Error(message);
            });
        }
        return res.json();
      });
  }

  window.fetchPlaceDetailsPreview = function (placeId, callback) {
    fetchPlaceDetails(placeId)
      .then(function (details) {
        callback(renderPreviewHtml(details));
      })
      .catch(function () {
        callback("");
      });
  };

  window.fetchPlaceDetailsForMapPanel = function (placeId, callback) {
    fetchPlaceDetails(placeId)
      .then(function (details) {
        callback({ __details: details });
      })
      .catch(function () {
        callback({ __details: null });
      });
  };

  function hydrateBlock(block) {
    var placeId = block.getAttribute("data-place-id");
    var locationName = block.getAttribute("data-location-name") || "this location";
    var loadingEl = block.querySelector(".find-food-place-details-loading");
    var contentEl = block.querySelector(".find-food-place-details-content");
    var isProfilePage = Boolean(block.closest(".find-food-profile-card"));

    if (!placeId || !contentEl) return;

    fetchPlaceDetails(placeId)
      .then(function (details) {
        if (isProfilePage) {
          hydrateProfileCover(block, details);
          contentEl.innerHTML = renderProfileContentHtml(details, locationName);
        } else {
          contentEl.innerHTML = renderFullHtml(details, locationName);
        }
        contentEl.hidden = false;
        if (loadingEl) loadingEl.hidden = true;
      })
      .catch(function (error) {
        if (loadingEl) {
          loadingEl.textContent = error.message || "Unable to load location details.";
          loadingEl.classList.add("find-food-place-details-error");
        }
      });
  }

  document.querySelectorAll(".find-food-place-details").forEach(hydrateBlock);
  hydrateLastDistributionElements();
})();
