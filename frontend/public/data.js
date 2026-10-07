// Format a number as Nepali rupees, e.g. money(4500) -> "Rs. 4,500"
function money(amount) {
  return "Rs. " + amount.toLocaleString("en-IN");
}

// Turns a numeric rating into a word, like booking sites do
function ratingLabel(rating) {
  if (rating >= 9) return "Excellent";
  if (rating >= 8) return "Good";
  if (rating >= 7) return "Fair";
  return "Average";
}

// Returns HTML for a vehicle's picture: a real photo if "image" is set,
// otherwise falls back to the emoji icon.
function vehiclePictureHTML(vehicle, sizeClass) {
  if (vehicle.image) {
    return `<img src="${vehicle.image}" alt="${vehicle.name}" class="${sizeClass}"
              onerror="this.replaceWith(Object.assign(document.createElement('div'), {className: '${sizeClass}', textContent: '${vehicle.icon}'}))">`;
  }
  return `<div class="${sizeClass}">${vehicle.icon}</div>`;
}

// Show a small message box in the corner of the screen for 2.5 seconds
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast.hideTimer);
  toast.hideTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2500);
}