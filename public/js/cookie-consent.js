window.addEventListener("load", function () {
  var cookie_consent_footer = document.getElementById("cookie-consent-footer");
  var cookie_consent_preference = localStorage.getItem("cookie-consent-preference");

  if (cookie_consent_preference === "allowed") {
    console.log("Loaded previous cookie preference from session: allowed.");
    try {
      window.initializeHotjar();
      mixpanel.opt_in_tracking();
    } catch (error) {
      console.error("Error while attempting to initiate analytics trackers", error);
    }
    return;
  }

  if (cookie_consent_preference === "disabled") {
    console.log("Loaded previous cookie preference from session: disabled.");
    try {
      mixpanel.opt_out_tracking();
    } catch (error) {
      console.error("Error while opting out of mixpanel:", error);
    }
    return;
  }

  if (!cookie_consent_footer) {
    console.log("No cookie consent footer on this page; skipping banner.");
    return;
  }

  console.log("No previous cookie preference found in session.");
  cookie_consent_footer.style.display = "flex";

  var allow_cookies_button = document.getElementById("allow-cookies-button");
  var disable_cookies_button = document.getElementById("disable-cookies-button");

  if (allow_cookies_button) {
    allow_cookies_button.addEventListener("click", function () {
      console.log("Set cookie preference for session: allowed.");
      cookie_consent_footer.style.display = "none";
      localStorage.setItem("cookie-consent-preference", "allowed");
      window.initializeHotjar();
      mixpanel.opt_in_tracking();
    });
  }

  if (disable_cookies_button) {
    disable_cookies_button.addEventListener("click", function () {
      console.log("Set cookie preference for session: disabled.");
      cookie_consent_footer.style.display = "none";
      localStorage.setItem("cookie-consent-preference", "disabled");
      try {
        mixpanel.opt_out_tracking();
      } catch (error) {
        console.error("Error while opting out of mixpanel:", error);
      }
    });
  }
});
