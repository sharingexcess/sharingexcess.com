function getImpactData() {
  window.se_impact_data = null;

  var controller = new AbortController();
  var timeoutId = setTimeout(function () {
    controller.abort();
  }, 10000);

  fetch(window.__SE_SURPLUS_API_ORIGIN + "/public/analytics/metrics", {
    signal: controller.signal,
  })
    .then(function (res) {
      clearTimeout(timeoutId);
      return res.ok ? res.json() : res.text();
    })
    .then(function (data) {
      window.se_impact_data = data;
    })
    .catch(function (error) {
      clearTimeout(timeoutId);
    });
}

window.addEventListener("load", getImpactData);
