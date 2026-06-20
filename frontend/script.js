const API      = "http://localhost:3000/foods";
const HIST_API = "http://localhost:3000/history";

const form        = document.getElementById("foodForm");
const table       = document.getElementById("foodTable");
const searchInput = document.getElementById("searchInput");

let allFoods    = [];
let calorieGoal = 0;

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
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameVal     = document.getElementById("foodName") || document.getElementById("name");
    const caloriesVal = document.getElementById("calories");
    const proteinVal  = document.getElementById("protein");
    const carbsVal    = document.getElementById("carbs");
    const fatVal      = document.getElementById("fat");

    const food = {
        name:     nameVal.value,
        calories: caloriesVal.value,
        protein:  proteinVal.value,
        carbs:    carbsVal.value,
        fat:      fatVal.value
    };

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(food)
        });
        const text = await res.text();
        console.log("Server response:", text);
        form.reset();
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
        row.innerHTML = `
            <td>${food.name}</td>
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
        const res  = await fetch(`${API}?date=${datePicker.value}`);
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

        let score = 100;
        if (totalCalories > 2000) score -= 20;
        if (totalProtein  < 50)   score -= 20;
        if (totalFat      > 70)   score -= 20;
        if (totalCarbs    > 300)  score -= 20;
        document.getElementById("healthScore").textContent = `${Math.max(score, 0)} / 100`;

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
        const res  = await fetch(HIST_API);
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
    await fetch(`${API}/${id}`, { method: "DELETE" });
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
        body: JSON.stringify({ name: newName, calories: newCalories, protein: newProtein, carbs: newCarbs, fat: newFat })
    });
    loadFoods();
    loadHistory();
}

// ── init ──────────────────────────────────────────────────
loadFoods();
loadHistory();