function getImpactData() {
  console.log("getting impact data");
  var start = performance.now();
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
      console.log(data, performance.now() - start);
    })
    .catch(function (error) {
      clearTimeout(timeoutId);
      console.warn("Failed to load impact data:", error);
    });
}

window.addEventListener("load", getImpactData);
