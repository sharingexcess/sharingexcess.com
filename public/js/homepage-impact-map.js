/**
 * Homepage impact map — Surplus-style unclustered markers on the legacy site embed.
 * Marker art matches surplus/apps/client/src/lib/mapMarkerImages.ts (recipient only).
 */
(function (global) {
  var RECIPIENT_IMAGE_ID = "surplusMapMarkerRecipient";
  var MAP_MARKER_RECIPIENT_FILL = "#22c55e";
  var MAP_MARKER_STROKE_DARK = "#1A1A1A";
  var MAP_MARKER_STROKE_WIDTH = 0.75;
  var MAP_MARKER_IMAGE_INNER_RADIUS_PX = 10;
  var MAP_MARKER_IMAGE_PIXEL_RATIO = 2;
  var MAP_MARKER_GRADIENT_TOP_LIGHTEN = 0.22;
  var MAP_MARKER_GRADIENT_BOTTOM_FACTOR = 0.75;
  var MAP_MARKER_STROKE_OPACITY = 0.8;
  var MARKER_SIZE_OPTIONS = {
    minRadius: 5,
    maxRadius: 9.6,
    lowerPercentile: 5,
    upperPercentile: 95,
    sizeExponent: 1.4,
  };
  var ACCESS_TOKEN =
    "pk.eyJ1Ijoic2Fya2FyaWNodGVyIiwiYSI6ImNtOXU5cDkwNjA3dGgycXB5Zmt1NGpreWEifQ.prxEqERsrMZSwXxahDnkbg";
  var FALLBACK_MAP_STYLE = "mapbox://styles/mapbox/dark-v11";
  var SURPLUS_MAP_STYLE_URL = "/js/surplus-dark-map-style.json";
  var SOURCE_ID = "impact-locations";
  var LAYER_ID = "impact-points";

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
    function channel(value) {
      return Math.max(0, Math.min(255, Math.round(value + (255 - value) * amount)))
        .toString(16)
        .padStart(2, "0");
    }
    return "#" + channel(r) + channel(g) + channel(b);
  }

  function drawRecipientMarkerCanvas(strokeColor) {
    var innerRadiusPx = MAP_MARKER_IMAGE_INNER_RADIUS_PX;
    var strokeWidthPx = MAP_MARKER_STROKE_WIDTH;
    var innerR = innerRadiusPx * MAP_MARKER_IMAGE_PIXEL_RATIO;
    var strokeW = strokeWidthPx * MAP_MARKER_IMAGE_PIXEL_RATIO;
    var outerR = innerR + strokeW;
    var size = Math.ceil(outerR * 2) + 2;
    var center = size / 2;

    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    ctx.beginPath();
    ctx.arc(center, center, outerR, 0, Math.PI * 2);
    ctx.globalAlpha = MAP_MARKER_STROKE_OPACITY;
    ctx.fillStyle = strokeColor;
    ctx.fill();
    ctx.globalAlpha = 1;

    var gradient = ctx.createLinearGradient(
      center,
      center - innerR,
      center,
      center + innerR,
    );
    gradient.addColorStop(
      0,
      lightenHexColor(MAP_MARKER_RECIPIENT_FILL, MAP_MARKER_GRADIENT_TOP_LIGHTEN),
    );
    gradient.addColorStop(
      1,
      shadeHexColor(MAP_MARKER_RECIPIENT_FILL, MAP_MARKER_GRADIENT_BOTTOM_FACTOR),
    );

    ctx.beginPath();
    ctx.arc(center, center, innerR, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    return canvas;
  }

  function addMarkerImage(map) {
    try {
      var canvas = drawRecipientMarkerCanvas(MAP_MARKER_STROKE_DARK);
      var ctx = canvas.getContext("2d");
      if (!ctx) return false;
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (map.hasImage(RECIPIENT_IMAGE_ID)) {
        map.updateImage(RECIPIENT_IMAGE_ID, imageData);
      } else {
        map.addImage(RECIPIENT_IMAGE_ID, imageData, {
          pixelRatio: MAP_MARKER_IMAGE_PIXEL_RATIO,
        });
      }
      return true;
    } catch (error) {
      console.warn("Failed to register impact map marker sprite:", error);
      return false;
    }
  }

  function calculatePercentile(values, percentile) {
    var sorted = values.slice().sort(function (a, b) {
      return a - b;
    });
    var index = (percentile / 100) * (sorted.length - 1);
    if (Math.floor(index) === index) return sorted[index] || 0;
    var lower = sorted[Math.floor(index)] || 0;
    var upper = sorted[Math.ceil(index)] || 0;
    return lower + (upper - lower) * (index - Math.floor(index));
  }

  function calculateMarkerSize(totalWeight, allWeights, options) {
    var minRadius = options.minRadius;
    var maxRadius = options.maxRadius;
    var lowerPercentile = options.lowerPercentile;
    var upperPercentile = options.upperPercentile;
    var sizeExponent = options.sizeExponent;
    var fallback = (minRadius + maxRadius) / 2;

    if (!allWeights || allWeights.length === 0) return fallback;
    var weights = allWeights.filter(function (w) {
      return w > 0;
    });
    if (weights.length === 0) return fallback;

    var pLower = calculatePercentile(weights, lowerPercentile);
    var pUpper = calculatePercentile(weights, upperPercentile);
    if (pLower === pUpper) return fallback;

    var clamped = Math.max(Math.min(totalWeight, pUpper), pLower);
    var normalized = (clamped - pLower) / (pUpper - pLower);
    var curved = sizeExponent === 1 ? normalized : Math.pow(normalized, sizeExponent);
    return minRadius + curved * (maxRadius - minRadius);
  }

  function enrichGeoJson(geojson) {
    if (!geojson || !geojson.features || !geojson.features.length) {
      return { type: "FeatureCollection", features: [] };
    }
    var counts = geojson.features.map(function (feature) {
      return feature.properties.count;
    });
    return {
      type: "FeatureCollection",
      features: geojson.features.map(function (feature) {
        return {
          type: "Feature",
          geometry: feature.geometry,
          properties: Object.assign({}, feature.properties, {
            marker_size: calculateMarkerSize(
              feature.properties.count,
              counts,
              MARKER_SIZE_OPTIONS,
            ),
          }),
        };
      }),
    };
  }

  function fitMapToFeatures(map, features) {
    if (!features || !features.length) return false;
    var bounds = new mapboxgl.LngLatBounds();
    features.forEach(function (feature) {
      if (feature.geometry && feature.geometry.coordinates) {
        bounds.extend(feature.geometry.coordinates);
      }
    });
    if (bounds.isEmpty()) return false;
    map.resize();
    map.fitBounds(bounds, { padding: 48, maxZoom: 9, duration: 0 });
    return true;
  }

  function loadMapStyle() {
    return fetch(SURPLUS_MAP_STYLE_URL)
      .then(function (response) {
        if (!response.ok) throw new Error("Surplus map style unavailable");
        return response.json();
      })
      .catch(function () {
        console.warn("Using fallback Mapbox style for impact map.");
        return FALLBACK_MAP_STYLE;
      });
  }

  function loadGeoJson() {
    return fetch(
      window.__SE_SURPLUS_API_ORIGIN + "/public/analytics/geojson",
    ).then(function (response) {
      if (!response.ok) throw new Error("Impact map data unavailable");
      return response.json();
    });
  }

  function initImpactMap(mapStyle, loadingLogo) {
    mapboxgl.accessToken = ACCESS_TOKEN;
    var map = new mapboxgl.Map({
      container: "impact-map",
      style: mapStyle,
      center: [-98.5795, 39.8283],
      zoom: 3.5,
      maxZoom: 9,
    });
    map.addControl(new mapboxgl.NavigationControl());

    function hideLoadingLogo() {
      if (loadingLogo) loadingLogo.style.display = "none";
    }

    map.on("styleimagemissing", function (event) {
      if (event.id === RECIPIENT_IMAGE_ID) {
        addMarkerImage(map);
      }
    });

    map.on("load", function () {
      if (!addMarkerImage(map)) {
        hideLoadingLogo();
        return;
      }

      loadGeoJson()
        .then(enrichGeoJson)
        .then(function (data) {
          var hasFitted = false;

          function fitOnce() {
            if (hasFitted) return;
            if (fitMapToFeatures(map, data.features)) {
              hasFitted = true;
            }
          }

          map.addSource(SOURCE_ID, {
            type: "geojson",
            data: data,
          });

          map.addLayer({
            id: LAYER_ID,
            type: "symbol",
            source: SOURCE_ID,
            layout: {
              "icon-image": RECIPIENT_IMAGE_ID,
              "icon-size": [
                "/",
                ["get", "marker_size"],
                MAP_MARKER_IMAGE_INNER_RADIUS_PX,
              ],
              "symbol-sort-key": ["get", "marker_size"],
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            },
          });

          map.on("mouseenter", LAYER_ID, function () {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", LAYER_ID, function () {
            map.getCanvas().style.cursor = "";
          });

          map.on("sourcedata", function (event) {
            if (event.sourceId === SOURCE_ID && event.isSourceLoaded) {
              fitOnce();
            }
          });

          fitOnce();

          map.once("idle", function () {
            fitOnce();
            hideLoadingLogo();
          });
        })
        .catch(function (error) {
          console.warn("Failed to load impact map data:", error);
          hideLoadingLogo();
        });
    });
  }

  function init(options) {
    options = options || {};
    var mapContainer = document.getElementById(options.container || "impact-map");
    var loadingLogo = document.getElementById(options.loadingLogoId || "loading-logo");

    if (typeof mapboxgl === "undefined" || !mapContainer) {
      if (loadingLogo) loadingLogo.style.display = "none";
      console.warn("Map unavailable: Mapbox GL not loaded or container missing.");
      return;
    }

    loadMapStyle()
      .then(function (mapStyle) {
        initImpactMap(mapStyle, loadingLogo);
      })
      .catch(function (error) {
        if (loadingLogo) loadingLogo.style.display = "none";
        console.warn("Failed to initialize map:", error);
      });
  }

  global.SEHomepageImpactMap = { init: init };
})(typeof window !== "undefined" ? window : this);
