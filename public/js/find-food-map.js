(function () {
  var MAPBOX_ACCESS_TOKEN =
    "pk.eyJ1Ijoic2Fya2FyaWNodGVyIiwiYSI6ImNtOXU5cDkwNjA3dGgycXB5Zmt1NGpreWEifQ.prxEqERsrMZSwXxahDnkbg";

  var MARKER_RECIPIENT_FILL = "#22c55e";
  var MARKER_SELECTED_FILL = "#5897f9";
  var MARKER_STROKE = "#ffffff";
  var MARKER_INNER_RADIUS_PX = 7;
  var MARKER_STROKE_WIDTH_PX = 0.75;
  var MARKER_PIXEL_RATIO = 2;
  var MARKER_GRADIENT_TOP_LIGHTEN = 0.22;
  var MARKER_GRADIENT_BOTTOM_FACTOR = 0.75;
  var MARKER_STROKE_OPACITY = 0.8;
  var MARKER_SELECTED_SCALE = 1.5;

  var MARKER_IMAGE_RECIPIENT = "findFoodMarkerRecipient";
  var MARKER_IMAGE_SELECTED = "findFoodMarkerSelected";

  var ZOOM_OUT_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>';
  var ZOOM_FIT_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="M3 8V3h5"/></svg>';
  var ZOOM_IN_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
  var FULLSCREEN_EXPAND_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
  var FULLSCREEN_COMPRESS_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>';

  var mapContainer = document.getElementById("find-food-map");
  var loadingEl = document.getElementById("find-food-map-loading");
  var geojson = window.__FIND_FOOD_GEOJSON;

  function hideLoading() {
    if (loadingEl) loadingEl.classList.add("is-hidden");
  }

  if (typeof mapboxgl === "undefined" || !mapContainer || !geojson) {
    hideLoading();
    return;
  }

  function shadeHexColor(hex, factor) {
    var normalized = hex.replace("#", "");
    var r = parseInt(normalized.slice(0, 2), 16);
    var g = parseInt(normalized.slice(2, 4), 16);
    var b = parseInt(normalized.slice(4, 6), 16);
    function channel(value) {
      return Math.max(0, Math.min(255, Math.round(value * factor)))
        .toString(16)
        .padStart(2, "0");
    }
    return "#" + channel(r) + channel(g) + channel(b);
  }

  function lightenHexColor(hex, amount) {
    var normalized = hex.replace("#", "");
    var r = parseInt(normalized.slice(0, 2), 16);
    var g = parseInt(normalized.slice(2, 4), 16);
    var b = parseInt(normalized.slice(4, 6), 16);
    function mix(value) {
      return Math.round(value + (255 - value) * amount);
    }
    function channel(value) {
      return Math.max(0, Math.min(255, mix(value)))
        .toString(16)
        .padStart(2, "0");
    }
    return "#" + channel(r) + channel(g) + channel(b);
  }

  function drawMarkerCanvas(fillColor, strokeColor) {
    var innerR = MARKER_INNER_RADIUS_PX * MARKER_PIXEL_RATIO;
    var strokeW = MARKER_STROKE_WIDTH_PX * MARKER_PIXEL_RATIO;
    var outerR = innerR + strokeW;
    var size = Math.ceil(outerR * 2) + 2;
    var center = size / 2;

    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.beginPath();
    ctx.arc(center, center, outerR, 0, Math.PI * 2);
    ctx.globalAlpha = MARKER_STROKE_OPACITY;
    ctx.fillStyle = strokeColor;
    ctx.fill();
    ctx.globalAlpha = 1;

    var gradient = ctx.createLinearGradient(
      center,
      center - innerR,
      center,
      center + innerR,
    );
    gradient.addColorStop(0, lightenHexColor(fillColor, MARKER_GRADIENT_TOP_LIGHTEN));
    gradient.addColorStop(1, shadeHexColor(fillColor, MARKER_GRADIENT_BOTTOM_FACTOR));

    ctx.beginPath();
    ctx.arc(center, center, innerR, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    return canvas;
  }

  function canvasToImageData(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  function syncMarkerImages(map) {
    if (!map || !map.isStyleLoaded()) return;

    var images = [
      [MARKER_IMAGE_RECIPIENT, drawMarkerCanvas(MARKER_RECIPIENT_FILL, MARKER_STROKE)],
      [MARKER_IMAGE_SELECTED, drawMarkerCanvas(MARKER_SELECTED_FILL, MARKER_STROKE)],
    ];

    images.forEach(function (entry) {
      var imageId = entry[0];
      var canvas = entry[1];
      var imageData = canvasToImageData(canvas);
      if (map.hasImage(imageId)) {
        map.updateImage(imageId, imageData);
      } else {
        map.addImage(imageId, imageData, { pixelRatio: MARKER_PIXEL_RATIO });
      }
    });
  }

  function cloneGeoJson(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function setSelectedPlaceId(placeId) {
    geojson.features.forEach(function (feature) {
      feature.properties.is_selected =
        feature.properties.googlePlaceId === placeId ? 1 : 0;
    });
    if (map.getSource("find-food-locations")) {
      map.getSource("find-food-locations").setData(geojson);
    }
  }

  var wrapper = mapContainer.closest(".find-food-map-wrapper");
  var isPreview =
    Boolean(window.__FIND_FOOD_MAP_PREVIEW) ||
    (wrapper && wrapper.classList.contains("find-food-map-wrapper--preview"));
  var panelHost = document.createElement("div");
  panelHost.className = "find-food-map-panel-host";
  var panelEl = document.createElement("aside");
  panelEl.className = "find-food-map-panel is-hidden";
  panelEl.setAttribute("aria-live", "polite");
  panelHost.appendChild(panelEl);
  if (wrapper && !isPreview) wrapper.appendChild(panelHost);

  var zoomControlsHost = document.createElement("div");
  zoomControlsHost.className = "find-food-map-zoom-controls";
  zoomControlsHost.innerHTML =
    '<div class="find-food-map-zoom-controls-group" role="group" aria-label="Map zoom controls">' +
    '<button type="button" class="find-food-map-zoom-btn" data-zoom-action="out" aria-label="Zoom out">' +
    ZOOM_OUT_ICON +
    "</button>" +
    (isPreview
      ? ""
      : '<button type="button" class="find-food-map-zoom-btn" data-zoom-action="fit" aria-label="Zoom to fit">' +
        ZOOM_FIT_ICON +
        "</button>") +
    '<button type="button" class="find-food-map-zoom-btn" data-zoom-action="in" aria-label="Zoom in">' +
    ZOOM_IN_ICON +
    "</button>" +
    '<button type="button" class="find-food-map-zoom-btn find-food-map-fullscreen-btn" data-zoom-action="fullscreen" aria-label="Full screen">' +
    FULLSCREEN_EXPAND_ICON +
    "</button>" +
    "</div>";
  if (wrapper) wrapper.appendChild(zoomControlsHost);

  var fullscreenBtn = zoomControlsHost.querySelector("[data-zoom-action='fullscreen']");

  var selectedPlaceId = null;
  var lastPanelDetails = null;

  function applyRuntimeLastDistribution(byPlaceId) {
    geojson.features.forEach(function (feature) {
      var placeId = feature.properties && feature.properties.googlePlaceId;
      if (placeId && Object.prototype.hasOwnProperty.call(byPlaceId, placeId)) {
        feature.properties.lastSharingExcessDistribution = byPlaceId[placeId];
      }
    });
  }

  function refreshOpenPanel() {
    if (!selectedPlaceId || panelEl.classList.contains("is-hidden")) return;

    for (var i = 0; i < geojson.features.length; i++) {
      var feature = geojson.features[i];
      if (feature.properties.googlePlaceId === selectedPlaceId) {
        openPanel(feature.properties, lastPanelDetails);
        break;
      }
    }
  }

  function closePanel() {
    selectedPlaceId = null;
    panelEl.classList.add("is-hidden");
    panelEl.innerHTML = "";
    setSelectedPlaceId(null);
  }

  function openPanel(props, detailsHtml) {
    lastPanelDetails = detailsHtml;
    if (typeof window.buildFindFoodMapPanelHtml === "function") {
      panelEl.innerHTML = window.buildFindFoodMapPanelHtml(props, detailsHtml);
    } else {
      panelEl.innerHTML =
        '<div class="find-food-map-panel-body"><h3 class="find-food-map-panel-title">' +
        props.name +
        "</h3></div>";
    }

    var closeBtn = panelEl.querySelector(".find-food-map-panel-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closePanel);
    }

    panelEl.classList.remove("is-hidden");
  }

  function selectFeature(feature, fly) {
    if (!feature) return;

    var props = feature.properties;
    var coords = feature.geometry.coordinates.slice();
    selectedPlaceId = props.googlePlaceId;
    setSelectedPlaceId(props.googlePlaceId);

    if (fly !== false) {
      map.flyTo({
        center: coords,
        zoom: Math.max(map.getZoom(), 11),
        duration: 700,
      });
    }

    openPanel(props, { __details: null });

    if (props.googlePlaceId && typeof window.fetchPlaceDetailsForMapPanel === "function") {
      window.fetchPlaceDetailsForMapPanel(props.googlePlaceId, function (detailsHtml) {
        if (selectedPlaceId === props.googlePlaceId) {
          openPanel(props, detailsHtml);
        }
      });
    }
  }

  if (!isPreview && typeof window.fetchLastDistributionByPlaceId === "function") {
    window
      .fetchLastDistributionByPlaceId()
      .then(function (byPlaceId) {
        applyRuntimeLastDistribution(byPlaceId);
        refreshOpenPanel();
      })
      .catch(function () {
        /* Keep build-time values on failure. */
      });
  }

  var map;

  function fitMapToMarkers(duration) {
    if (!map || !geojson.features || geojson.features.length === 0) return;
    var bounds = new mapboxgl.LngLatBounds();
    geojson.features.forEach(function (feature) {
      if (feature.geometry && feature.geometry.coordinates) {
        bounds.extend(feature.geometry.coordinates);
      }
    });
    if (!bounds.isEmpty()) {
      var options = { padding: 48, maxZoom: 12 };
      if (duration != null) options.duration = duration;
      map.fitBounds(bounds, options);
    }
  }

  function getFullscreenElement() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      null
    );
  }

  function updateFullscreenButton() {
    if (!fullscreenBtn) return;
    var isFullscreen = getFullscreenElement() === wrapper;
    fullscreenBtn.setAttribute("aria-label", isFullscreen ? "Exit full screen" : "Full screen");
    fullscreenBtn.innerHTML = isFullscreen ? FULLSCREEN_COMPRESS_ICON : FULLSCREEN_EXPAND_ICON;
  }

  function toggleFullscreen() {
    if (!wrapper) return;

    if (getFullscreenElement() === wrapper) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      return;
    }

    if (wrapper.requestFullscreen) {
      wrapper.requestFullscreen();
    } else if (wrapper.webkitRequestFullscreen) {
      wrapper.webkitRequestFullscreen();
    } else if (wrapper.mozRequestFullScreen) {
      wrapper.mozRequestFullScreen();
    } else if (wrapper.msRequestFullscreen) {
      wrapper.msRequestFullscreen();
    }
  }

  function bindZoomControls() {
    if (!zoomControlsHost || !map) return;

    zoomControlsHost.addEventListener("click", function (event) {
      var button = event.target.closest("[data-zoom-action]");
      if (!button) return;

      var action = button.getAttribute("data-zoom-action");
      if (action === "in") {
        map.zoomIn();
      } else if (action === "out") {
        map.zoomOut();
      } else if (action === "fit") {
        fitMapToMarkers(800);
      } else if (action === "fullscreen") {
        toggleFullscreen();
      }
    });
  }

  function bindFullscreenChange() {
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);
  }

  function onFullscreenChange() {
    updateFullscreenButton();
    if (map) {
      setTimeout(function () {
        map.resize();
      }, 100);
    }
  }

  function bindGeocoder() {
    if (isPreview) return;
    if (!wrapper || !wrapper.classList.contains("find-food-map-wrapper--with-search")) return;
    if (typeof MapboxGeocoder === "undefined") return;

    var geocoderHost = document.createElement("div");
    geocoderHost.className = "find-food-map-geocoder";
    wrapper.insertBefore(geocoderHost, wrapper.firstChild);

    var geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_ACCESS_TOKEN,
      mapboxgl: mapboxgl,
      marker: false,
      types: "region,place",
      countries: "us",
      placeholder: "Search city or state",
      flyTo: {
        padding: 48,
        maxZoom: 10,
      },
    });

    geocoderHost.appendChild(geocoder.onAdd(map));
    geocoder.on("result", closePanel);
  }

  try {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    geojson = cloneGeoJson(geojson);
    geojson.features.forEach(function (feature) {
      feature.properties.is_selected = 0;
    });

    map = new mapboxgl.Map({
      container: "find-food-map",
      style: "mapbox://styles/mapbox/light-v11",
      center: [-98.5795, 39.8283],
      zoom: 3.5,
      maxZoom: 16,
      attributionControl: false,
    });

    bindZoomControls();
    bindFullscreenChange();
    bindGeocoder();

    map.on("load", function () {
      syncMarkerImages(map);

      map.addSource("find-food-locations", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "find-food-points",
        type: "symbol",
        source: "find-food-locations",
        layout: {
          "icon-image": [
            "case",
            ["==", ["get", "is_selected"], 1],
            MARKER_IMAGE_SELECTED,
            MARKER_IMAGE_RECIPIENT,
          ],
          "icon-size": [
            "/",
            [
              "*",
              MARKER_INNER_RADIUS_PX,
              [
                "case",
                ["==", ["get", "is_selected"], 1],
                MARKER_SELECTED_SCALE,
                1,
              ],
            ],
            MARKER_INNER_RADIUS_PX,
          ],
          "symbol-sort-key": [
            "case",
            ["==", ["get", "is_selected"], 1],
            ["+", MARKER_INNER_RADIUS_PX, 10000],
            MARKER_INNER_RADIUS_PX,
          ],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      if (isPreview && geojson.features.length >= 1) {
        setSelectedPlaceId(geojson.features[0].properties.googlePlaceId);
        map.jumpTo({
          center: geojson.features[0].geometry.coordinates,
          zoom: 14,
        });
      } else {
        fitMapToMarkers();

        if (geojson.features.length === 1) {
          selectFeature(geojson.features[0], false);
          map.jumpTo({
            center: geojson.features[0].geometry.coordinates,
            zoom: 13,
          });
        }
      }

      if (!isPreview) {
        map.on("click", "find-food-points", function (e) {
          var feature = e.features && e.features[0];
          selectFeature(feature);
        });

        map.on("mouseenter", "find-food-points", function () {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "find-food-points", function () {
          map.getCanvas().style.cursor = "";
        });

        map.on("click", function (e) {
          var hits = map.queryRenderedFeatures(e.point, { layers: ["find-food-points"] });
          if (!hits.length) closePanel();
        });
      }
    });

    map.on("styleimagemissing", function (event) {
      if (
        event.id === MARKER_IMAGE_RECIPIENT ||
        event.id === MARKER_IMAGE_SELECTED
      ) {
        syncMarkerImages(map);
      }
    });

    map.on("idle", hideLoading);
  } catch (_error) {
    hideLoading();
  }
})();
