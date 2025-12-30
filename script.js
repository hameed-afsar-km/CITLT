function toggleTheme() {
    document.body.classList.toggle('dark');
}

function getSubjects() {
    return JSON.parse(localStorage.getItem('subjects') || "[]");
}

function saveSubjects(subjects) {
    localStorage.setItem('subjects', JSON.stringify(subjects));
}

function addOrUpdateSubject() {
    const name = document.getElementById("subjectName").value.trim();
    const semester = +document.getElementById("semesterClasses").value;
    const conducted = +document.getElementById("conductedClasses").value;
    const attended = +document.getElementById("attendedClasses").value;
    const min = +document.getElementById("minPercent").value;
    const editIndex = document.getElementById("editIndex").value;

    if (!name || semester <= 0 || conducted < 0 || attended < 0 || attended > conducted || conducted > semester || min <= 0 || min > 100) {
        alert("❌ Please enter valid values.");
        return;
    }

    const subjects = getSubjects();
    const data = { name, semester, conducted, attended, min, date: new Date().toLocaleString() };

    if (editIndex !== "") {
        subjects[+editIndex] = data;
        document.getElementById("editIndex").value = "";
    } else {
        subjects.push(data);
    }

    saveSubjects(subjects);
    clearForm();
    renderSubjects();
}

function clearForm() {
    document.getElementById("subjectName").value = "";
    document.getElementById("semesterClasses").value = "";
    document.getElementById("conductedClasses").value = "";
    document.getElementById("attendedClasses").value = "";
    document.getElementById("minPercent").value = "";
}

function editSubject(index) {
    const subject = getSubjects()[index];
    document.getElementById("subjectName").value = subject.name;
    document.getElementById("semesterClasses").value = subject.semester;
    document.getElementById("conductedClasses").value = subject.conducted;
    document.getElementById("attendedClasses").value = subject.attended;
    document.getElementById("minPercent").value = subject.min;
    document.getElementById("editIndex").value = index;
    window.scrollTo(0, 0);
}

function deleteSubject(index) {
    const subjects = getSubjects();
    subjects.splice(index, 1);
    saveSubjects(subjects);
    renderSubjects();
}

function forecast(attended, conducted, minPercent, semesterTotal) {
    const absent = conducted - attended;
    const currentPercent = (attended / conducted) * 100;
    const newPercent = (attended / (conducted + 1)) * 100;
    const minAttendedRequired = Math.ceil((minPercent / 100) * semesterTotal);
    const maxLeavesAllowed = semesterTotal - minAttendedRequired;
    const leavesLeft = maxLeavesAllowed - absent;
    let need = 0;
    while ((attended + need) / (conducted + need) * 100 < minPercent && (conducted + need) < semesterTotal) need++;
    const classesNeeded = (conducted + need) <= semesterTotal ? need : "Not possible";
    return { absent, currentPercent, newPercent, maxLeavesAllowed, leavesLeft, classesNeeded };
}

function renderSummary(subjects) {
    const summaryBox = document.getElementById("summaryBox");
    if (subjects.length === 0) {
        summaryBox.innerHTML = "";
        return;
    }

    let total = 0;
    let above = 0;
    let below = 0;

    subjects.forEach(s => {
        const percent = (s.attended / s.conducted) * 100;
        total += percent;
        if (percent >= s.min) above++; else below++;
    });

    const avg = (total / subjects.length).toFixed(2);
    summaryBox.innerHTML = `
        <strong>📊 Summary:</strong><br>
        Total Subjects: ${subjects.length}<br>
        Average Attendance: ${avg}%<br>
        ✅ Above Min: ${above} &nbsp;&nbsp; 🚫 Below Min: ${below}
      `;
}

function getTagClass(percent, min) {
    if (percent >= min) return "safe";
    if (percent >= min - 2) return "warning";
    return "danger";
}

function renderSubjects() {
    const container = document.getElementById("subjectContainer");
    const subjects = getSubjects();
    renderSummary(subjects);
    container.innerHTML = "";

    subjects.forEach((s, index) => {
        const stats = forecast(s.attended, s.conducted, s.min, s.semester);
        const tagClass = getTagClass(stats.currentPercent, s.min);
        const tagLabel = tagClass === "safe" ? "Safe" : tagClass === "warning" ? "Borderline" : "Risk";

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <strong>${s.name}</strong> (${s.attended}/${s.conducted}) - ${stats.currentPercent.toFixed(2)}%
                    <span class="tag ${tagClass}">${tagLabel}</span>
                </div>

                <div class="card-actions">
                    <button class="attend-btn" onclick="markAttend(${index}); event.stopPropagation();">
                        ✅ Attend
                    </button>
                    <button class="leave-btn" onclick="markLeave(${index}); event.stopPropagation();">
                        🚫 Leave
                    </button>
                </div>
            </div>

            <div class="card-content">
                <div>🗓️ Date: ${s.date}</div>
                <div>📚 Semester Total: ${s.semester}</div>
                <div>✅ Attended: ${s.attended}</div>
                <div>❌ Absent: ${stats.absent}</div>
                <div>📊 Current: ${stats.currentPercent.toFixed(2)}%</div>
                <div>📉 If skip today: ${stats.newPercent.toFixed(2)}%</div>
                <div>🛑 Max Leaves: ${stats.maxLeavesAllowed}</div>
                <div>🟢 Leaves Left: ${stats.leavesLeft}</div>
                <div>🎯 Attend next: ${stats.classesNeeded}</div>
                ${stats.leavesLeft > 0 ? '<div style="color:green;">✅ You can take leave today.</div>' : '<div style="color:red;">🚫 No more leaves.</div>'}
                <button class="edit-btn" onclick="editSubject(${index})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteSubject(${index})">🗑️ Delete</button>
            </div>
        `;
        card.onclick = function (e) {
            if (e.target.tagName !== "BUTTON") {
                const content = this.querySelector(".card-content");
                content.style.display = content.style.display === "block" ? "none" : "block";
            }
        };
        container.appendChild(card);
    });
}

function markAttend(index) {
    const subjects = getSubjects();
    const s = subjects[index];

    if (s.conducted >= s.semester) {
        alert("Semester classes already completed.");
        return;
    }

    s.conducted += 1;
    s.attended += 1;
    s.date = new Date().toLocaleString();

    saveSubjects(subjects);
    renderSubjects();
}

function markLeave(index) {
    const subjects = getSubjects();
    const s = subjects[index];

    if (s.conducted >= s.semester) {
        alert("Semester classes already completed.");
        return;
    }

    s.conducted += 1;
    s.date = new Date().toLocaleString();

    saveSubjects(subjects);
    renderSubjects();
}


window.onload = () => {
    renderSubjects();
};
