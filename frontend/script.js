const API       = "http://localhost:3000/foods";
const HIST_API  = "http://localhost:3000/history";
const FOODDB_API = "http://localhost:3000/api/food-database";
const AUTH_API  = "http://localhost:3000/api";

// ── auth guard ────────────────────────────────────────────
// Every page load starts by asking the server "who am I?" via the
// session cookie. If there's no valid session, the server responds
// 401 and we bounce to the login page before any food data loads.
// credentials: "include" is what makes the browser send the session
// cookie along with the request — without it every request would
// look logged-out, even right after signing in.
async function checkAuth() {
    try {
        const res = await fetch(`${AUTH_API}/me`, { credentials: "include" });
        if (!res.ok) {
            window.location.href = "login.html";
            return null;
        }
        const data = await res.json();
        const label = document.getElementById("usernameLabel");
        if (label) label.textContent = data.username;
        return data;
    } catch (err) {
        window.location.href = "login.html";
        return null;
    }
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch(`${AUTH_API}/logout`, { method: "POST", credentials: "include" });
    window.location.href = "login.html";
});

const form        = document.getElementById("foodForm");
const table       = document.getElementById("foodTable");
const searchInput = document.getElementById("searchInput");

let allFoods    = [];
let calorieGoal = 0;

// ── nutrition preview + dynamic unit + suggested servings ───
const foodNameInput   = document.getElementById("foodName");
const quantityInput   = document.getElementById("quantity");
const previewNote     = document.getElementById("previewNote");
const unitLabel       = document.getElementById("unitLabel");
const servingWrap     = document.getElementById("servingShortcuts");
const servingButtons  = document.getElementById("servingButtons");

let lastSelectedFoodName = null; // tracks the previous food so we only reset quantity when the user actually switches to a different food

// Human-friendly label for a unit, pluralized for pieces.
// (No food names here — purely based on the unit string from the DB.)
function unitLabelText(unit, qty) {
    if (unit === "piece") return qty === 1 ? "piece" : "pieces";
    return unit || "";
}

// Returns the matching food_database row for whatever the user has
// currently typed, or null if it doesn't match a known food.
function getSelectedFood() {
    const typed = foodNameInput.value.trim().toLowerCase();
    return typed ? foodDatabaseByName[typed] || null : null;
}

// Builds suggested-serving quick buttons purely from the food's own
// unit + reference_quantity — never from a hardcoded food name.
function buildServingShortcuts(food) {
    servingButtons.innerHTML = "";
    if (!food) { servingWrap.style.display = "none"; return; }

    const ref = Number(food.reference_quantity);
    let values;
    if (food.default_unit === "piece") {
        values = [1, 2, 3, 4];
    } else {
        values = [ref, Math.round(ref * 1.5), ref * 2];
    }

    values.forEach(v => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "serving-btn";
        btn.textContent = food.default_unit === "piece" ? String(v) : `${v} ${food.default_unit}`;
        btn.addEventListener("click", () => {
            quantityInput.value = v;
            updateNutritionPreview();
        });
        servingButtons.appendChild(btn);
    });

    const customBtn = document.createElement("button");
    customBtn.type = "button";
    customBtn.className = "serving-btn";
    customBtn.textContent = "Custom";
    customBtn.addEventListener("click", () => quantityInput.focus());
    servingButtons.appendChild(customBtn);

    servingWrap.style.display = "flex";
}

function updateNutritionPreview() {
    const food = getSelectedFood();
    const qty  = Number(quantityInput.value);

    const calEl = document.getElementById("previewCalories");
    const proEl = document.getElementById("previewProtein");
    const carEl = document.getElementById("previewCarbs");
    const fatEl = document.getElementById("previewFat");

    // Whenever the selected food changes, refresh its unit label,
    // suggested-serving buttons, and default the quantity to its
    // reference amount so the field never shows a stale grams value
    // for a food that's actually measured in pieces or ml.
    const currentName = food ? food.name : null;
    if (currentName !== lastSelectedFoodName) {
        lastSelectedFoodName = currentName;
        buildServingShortcuts(food);
        if (food) quantityInput.value = food.reference_quantity;
    }

    unitLabel.textContent = food ? unitLabelText(food.default_unit, Number(quantityInput.value)) : "—";

    if (!food) {
        calEl.textContent = proEl.textContent = carEl.textContent = fatEl.textContent = "—";
        previewNote.textContent = foodNameInput.value.trim()
            ? "No matching food in the database. Pick one from the list."
            : "Select a food from the list above to see estimated nutrition.";
        previewNote.classList.toggle("preview-error", !!foodNameInput.value.trim());
        return;
    }

    const currentQty = Number(quantityInput.value);
    if (!currentQty || currentQty <= 0 || Number.isNaN(currentQty)) {
        calEl.textContent = proEl.textContent = carEl.textContent = fatEl.textContent = "—";
        previewNote.textContent = "Enter a quantity to calculate nutrition.";
        previewNote.classList.remove("preview-error");
        return;
    }

    // Core calculation, generalized for any unit:
    // nutrition = per_reference value x (quantity / reference_quantity)
    const factor = currentQty / Number(food.reference_quantity);
    calEl.textContent = Math.round(food.calories_per_reference * factor) + " kcal";
    proEl.textContent = Math.round(food.protein_per_reference  * factor) + " g";
    carEl.textContent = Math.round(food.carbs_per_reference    * factor) + " g";
    fatEl.textContent = (Math.round(food.fat_per_reference * factor * 10) / 10) + " g";

    const unitText = unitLabelText(food.default_unit, currentQty);
    previewNote.textContent = `Estimated for ${currentQty} ${unitText} of ${food.name}. Values are approximate reference data, not medical advice.`;
    previewNote.classList.remove("preview-error");
}

foodNameInput.addEventListener("input", updateNutritionPreview);
quantityInput.addEventListener("input", updateNutritionPreview);

// ── food reference database ─────────────────────────────────
// foodDatabaseByName lets us look up a selected food instantly,
// without another network request, every time the quantity changes.
let foodDatabaseByName = {};

async function loadFoodDatabase() {
    try {
        const res  = await fetch(FOODDB_API, { credentials: "include" });
        const data = await res.json();
        foodDatabaseByName = {};
        const datalist = document.getElementById("foodDatalist");
        datalist.innerHTML = "";
        data.forEach(item => {
            // Store using a lowercase key so lookups are case-insensitive
            // (e.g. "rice" and "Rice" both match).
            foodDatabaseByName[item.name.toLowerCase()] = item;
            const option = document.createElement("option");
            option.value = item.name;
            datalist.appendChild(option);
        });
    } catch (err) {
        console.error("loadFoodDatabase error:", err);
    }
}

// ── date helpers ──────────────────────────────────────────
const datePicker = document.getElementById("datePicker");
const dateLabel  = document.getElementById("currentDateLabel");

function todayStr() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function cleanDate(dateStr) {
    return dateStr ? dateStr.toString().split("T")[0] : "";
}

function formatDateLabel(dateStr) {
    const clean = cleanDate(dateStr);
    const d = new Date(clean + "T00:00:00");
    if (clean === todayStr()) return "Today";
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yy = yest.getFullYear();
    const ym = String(yest.getMonth() + 1).padStart(2, "0");
    const yd = String(yest.getDate()).padStart(2, "0");
    const yesterdayStr = `${yy}-${ym}-${yd}`;
    if (clean === yesterdayStr) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

datePicker.value = todayStr();

if (dateLabel) dateLabel.textContent = "Today";

datePicker.addEventListener("change", () => {
    if (dateLabel) dateLabel.textContent = formatDateLabel(datePicker.value);
    loadFoods();
});

document.getElementById("btnPrevDay").addEventListener("click", function() {
    const parts = datePicker.value.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    datePicker.value = y + "-" + m + "-" + day;
    if (dateLabel) dateLabel.textContent = formatDateLabel(datePicker.value);
    loadFoods();
});

document.getElementById("btnNextDay").addEventListener("click", function() {
    const parts = datePicker.value.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const next = y + "-" + m + "-" + day;
    if (next > todayStr()) return;
    datePicker.value = next;
    if (dateLabel) dateLabel.textContent = formatDateLabel(datePicker.value);
    loadFoods();
});

// ── add food ──────────────────────────────────────────────
// The user only provides a food (picked from the datalist) and a
// quantity in grams. We do a quick client-side sanity check for a
// friendly error message, but the server always recalculates and
// re-validates before saving — the frontend check is just for UX.
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const food = getSelectedFood();
    const qty  = Number(quantityInput.value);

    if (!food) {
        previewNote.textContent = "Please pick a valid food from the list before adding.";
        previewNote.classList.add("preview-error");
        foodNameInput.focus();
        return;
    }
    if (!qty || Number.isNaN(qty) || qty <= 0) {
        previewNote.textContent = "Please enter a quantity greater than 0.";
        previewNote.classList.add("preview-error");
        quantityInput.focus();
        return;
    }
    const maxQty = food.default_unit === "piece" ? 50 : 5000;
    if (qty > maxQty) {
        previewNote.textContent = `That quantity looks too large (max ${maxQty} ${unitLabelText(food.default_unit, maxQty)}).`;
        previewNote.classList.add("preview-error");
        quantityInput.focus();
        return;
    }

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name: food.name, quantity: qty })
        });

        if (!res.ok) {
            const message = await res.text();
            previewNote.textContent = message || "Could not add food.";
            previewNote.classList.add("preview-error");
            return;
        }

        form.reset();
        quantityInput.value = 100;
        updateNutritionPreview();
        datePicker.value = todayStr();
        if (dateLabel) dateLabel.textContent = "Today";
        loadFoods();
        loadHistory();
    } catch (err) {
        console.error("Error adding food:", err);
        alert("Could not add food. Is the server running on port 3000?");
    }
});

// ── render table ──────────────────────────────────────────
function renderFoods(foods) {
    table.innerHTML = "";
    if (foods.length === 0) {
        table.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#4a5568;padding:32px;">No foods logged for this day.</td></tr>`;
        return;
    }
    foods.forEach(food => {
        const row = document.createElement("tr");
        const unit = food.quantity_unit || (food.quantity_amount ? "grams" : null);
        const qtyLabel = food.quantity_amount ? ` <span class="qty-tag">(${food.quantity_amount} ${unit})</span>` : "";
        row.innerHTML = `
            <td>${food.name}${qtyLabel}</td>
            <td>${food.calories} kcal</td>
            <td>${food.protein}g</td>
            <td>${food.carbs}g</td>
            <td>${food.fat}g</td>
            <td>
                <button onclick="editFood(${food.id},'${food.name}',${food.calories},${food.protein},${food.carbs},${food.fat})">Edit</button>
                <button onclick="deleteFood(${food.id})">Delete</button>
            </td>`;
        table.appendChild(row);
    });
}

// ── insights (rule based) ─────────────────────────────────
function showInsights(totalCalories, totalProtein, totalFat, totalCarbs, data) {
    const recEl = document.getElementById("recommendation");
    if (data.length === 0) {
        recEl.textContent = "Add some foods to unlock personalized nutrition recommendations.";
        return;
    }
    const tips = [];
    if (totalCalories > 2000) tips.push("High calorie intake detected — consider lighter meals.");
    if (totalProtein < 50)    tips.push("Protein is low — try adding eggs, chicken, or legumes.");
    if (totalFat > 70)        tips.push("Fat intake is high — reduce fried or processed foods.");
    if (totalCarbs > 300)     tips.push("Carbs are elevated — swap some for vegetables or protein.");
    if (tips.length === 0)    tips.push("Your nutrition looks balanced today. Keep it up!");
    recEl.textContent = tips.join(" ");
}

// ── load foods ────────────────────────────────────────────
async function loadFoods() {
    try {
        const res  = await fetch(`${API}?date=${datePicker.value}`, { credentials: "include" });
        const data = await res.json();
        allFoods = data;

        const totalCalories = data.reduce((s, f) => s + Number(f.calories), 0);
        const totalProtein  = data.reduce((s, f) => s + Number(f.protein),  0);
        const totalCarbs    = data.reduce((s, f) => s + Number(f.carbs),    0);
        const totalFat      = data.reduce((s, f) => s + Number(f.fat),      0);

        document.getElementById("totalCalories").textContent = totalCalories;
        document.getElementById("totalProtein").textContent  = totalProtein + "g";
        document.getElementById("totalCarbs").textContent    = totalCarbs + "g";
        document.getElementById("totalFat").textContent      = totalFat + "g";

        const sidebarCal  = document.getElementById("sidebarCalories");
        const sidebarProt = document.getElementById("sidebarProtein");
        if (sidebarCal)  sidebarCal.textContent  = totalCalories + " kcal";
        if (sidebarProt) sidebarProt.textContent = totalProtein  + "g";

        if (data.length > 0) {
            const highest = data.reduce((m, f) => Number(f.calories) > Number(m.calories) ? f : m);
            document.getElementById("highestFood").textContent     = `${highest.name} (${highest.calories} kcal)`;
            document.getElementById("averageCalories").textContent = (totalCalories / data.length).toFixed(1) + " kcal";
        } else {
            document.getElementById("highestFood").textContent     = "No food available";
            document.getElementById("averageCalories").textContent = "0 kcal";
        }

        if (calorieGoal > 0) {
            const remaining = calorieGoal - totalCalories;
            const goalEl = document.getElementById("goalStatus");
            goalEl.textContent = remaining >= 0
                ? `✅ ${remaining} kcal remaining`
                : `⚠️ Exceeded by ${Math.abs(remaining)} kcal`;
            goalEl.style.color = remaining >= 0 ? "" : "#f87171";
        }

        // Health score: each macro contributes up to 25 points (100 total).
        // - Protein climbs toward its 25-point cap as intake approaches a
        //   50g target, so 3g and 19g score differently instead of both
        //   just tripping the same "under 50" flag.
        // - Calories/fat/carbs keep their full 25 points while under a
        //   healthy daily limit, then lose points gradually the further
        //   over that limit they go, instead of losing 20 points the
        //   instant they cross it.
        function calculateHealthScore(calories, protein, carbs, fat) {
            const proteinPoints = Math.min(25, (protein / 50) * 25);
            const caloriePoints = 25 - Math.min(25, Math.max(0, (calories - 2000) / 40));
            const fatPoints     = 25 - Math.min(25, Math.max(0, (fat - 70) / 2));
            const carbPoints    = 25 - Math.min(25, Math.max(0, (carbs - 300) / 8));
            const total = proteinPoints + caloriePoints + fatPoints + carbPoints;
            return Math.max(0, Math.min(100, Math.round(total)));
        }

        const healthScoreEl = document.getElementById("healthScore");
        const healthScoreHint = document.getElementById("healthScoreHint");
        if (data.length === 0) {
            healthScoreEl.textContent = "No data yet";
            if (healthScoreHint) healthScoreHint.style.display = "block";
        } else {
            const score = calculateHealthScore(totalCalories, totalProtein, totalCarbs, totalFat);
            healthScoreEl.innerHTML = `${score} <span class="panel-unit">/ 100</span>`;
            if (healthScoreHint) healthScoreHint.style.display = "none";
        }

        showInsights(totalCalories, totalProtein, totalFat, totalCarbs, data);
        renderFoods(data);
    } catch (err) {
        console.error("loadFoods error:", err);
    }
}

// ── load history ──────────────────────────────────────────
async function loadHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = `<p class="history-loading">Loading history…</p>`;
    try {
        const res  = await fetch(HIST_API, { credentials: "include" });
        const days = await res.json();

        if (days.length === 0) {
            historyList.innerHTML = `<p class="history-empty">No history yet. Start logging your meals!</p>`;
            return;
        }

        historyList.innerHTML = "";
        days.forEach(day => {
            const cd      = cleanDate(day.logged_date);
            const isToday = cd === todayStr();
            const card    = document.createElement("div");
            card.className = "history-day-card" + (isToday ? " history-today" : "");
            card.innerHTML = `
                <div class="history-card-left">
                    <span class="history-date-label">${formatDateLabel(cd)}</span>
                    <span class="history-date-sub">${isToday ? "" : cd}</span>
                </div>
                <div class="history-macros">
                    <span class="hm hm-cal">${day.total_calories} kcal</span>
                    <span class="hm hm-p">${day.total_protein}g P</span>
                    <span class="hm hm-c">${day.total_carbs}g C</span>
                    <span class="hm hm-f">${day.total_fat}g F</span>
                </div>
                <div class="history-card-right">
                    <span class="history-items">${day.item_count} item${day.item_count !== 1 ? "s" : ""}</span>
                    <button class="history-view-btn" onclick="viewDay('${cd}')">View</button>
                </div>`;
            historyList.appendChild(card);
        });
    } catch (err) {
        historyList.innerHTML = `<p class="history-empty">Could not load history.</p>`;
        console.error("loadHistory error:", err);
    }
}

function viewDay(dateStr) {
    const cd = cleanDate(dateStr);
    datePicker.value = cd;
    if (dateLabel) dateLabel.textContent = formatDateLabel(cd);
    loadFoods();
    document.getElementById("section-dashboard").scrollIntoView({ behavior: "smooth" });
}

// ── search ────────────────────────────────────────────────
searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    renderFoods(allFoods.filter(f => f.name.toLowerCase().includes(q)));
});

// ── delete ────────────────────────────────────────────────
async function deleteFood(id) {
    await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
    loadFoods();
    loadHistory();
}

// ── goal ──────────────────────────────────────────────────
function setGoal() {
    calorieGoal = Number(document.getElementById("goalInput").value);
    loadFoods();
}

// ── edit ──────────────────────────────────────────────────
async function editFood(id, name, calories, protein, carbs, fat) {
    const newName     = prompt("Food Name", name);
    const newCalories = prompt("Calories", calories);
    const newProtein  = prompt("Protein", protein);
    const newCarbs    = prompt("Carbs", carbs);
    const newFat      = prompt("Fat", fat);
    if (!newName) return;
    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName, calories: newCalories, protein: newProtein, carbs: newCarbs, fat: newFat })
    });
    loadFoods();
    loadHistory();
}

// ── init ──────────────────────────────────────────────────
(async function init() {
    const user = await checkAuth();
    if (!user) return; // checkAuth already redirected to login.html
    loadFoodDatabase();
    loadFoods();
    loadHistory();
})();