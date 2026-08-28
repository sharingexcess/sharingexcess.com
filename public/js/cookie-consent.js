window.addEventListener("load", function () {
  var cookie_consent_footer = document.getElementById("cookie-consent-footer");
  var cookie_consent_preference = localStorage.getItem("cookie-consent-preference");

  if (cookie_consent_preference === "allowed") {
    try {
      window.initializeHotjar();
      mixpanel.opt_in_tracking();
    } catch (_error) {}
    return;
  }

  if (cookie_consent_preference === "disabled") {
    try {
      mixpanel.opt_out_tracking();
    } catch (_error) {}
    return;
  }

  if (!cookie_consent_footer) {
    return;
  }

  cookie_consent_footer.style.display = "flex";

  var allow_cookies_button = document.getElementById("allow-cookies-button");
  var disable_cookies_button = document.getElementById("disable-cookies-button");

  if (allow_cookies_button) {
    allow_cookies_button.addEventListener("click", function () {
      cookie_consent_footer.style.display = "none";
      localStorage.setItem("cookie-consent-preference", "allowed");
      window.initializeHotjar();
      mixpanel.opt_in_tracking();
    });
  }

  if (disable_cookies_button) {
    disable_cookies_button.addEventListener("click", function () {
      cookie_consent_footer.style.display = "none";
      localStorage.setItem("cookie-consent-preference", "disabled");
      try {
        mixpanel.opt_out_tracking();
      } catch (_error) {}
    });
  }
});
