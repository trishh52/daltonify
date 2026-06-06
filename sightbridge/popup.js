document.addEventListener("DOMContentLoaded", () => {
  const powerToggle = document.getElementById("powerToggle");
  const modeBtns = document.querySelectorAll(".mode-btn");
  const intensitySlider = document.getElementById("intensitySlider");
  const intensityValue = document.getElementById("intensityValue");

  // Load state
  chrome.storage.local.get(["enabled", "mode", "intensity"], (res) => {
    powerToggle.checked = res.enabled ?? true;
    intensitySlider.value = res.intensity ?? 100;
    intensityValue.innerText = `${intensitySlider.value}%`;

    const activeMode = res.mode || "protanopia";
    modeBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === activeMode);
    });
  });

  const updateSettings = () => {
    const enabled = powerToggle.checked;
    const mode = document.querySelector(".mode-btn.active").dataset.mode;
    const intensity = parseInt(intensitySlider.value, 10);

    intensityValue.innerText = `${intensity}%`;

    chrome.storage.local.set({ enabled, mode, intensity });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateSettings",
          enabled, mode, intensity
        });
      }
    });
  };

  powerToggle.addEventListener("change", updateSettings);
  intensitySlider.addEventListener("input", updateSettings);

  modeBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      modeBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      updateSettings();
    });
  });
});
