
// STUDYFLOW - MAIN JAVASCRIPT


// ===== SELECT ELEMENTS =====
const addTaskBtn = document.getElementById("addTaskBtn");
const taskForm = document.getElementById("taskForm");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const taskList = document.getElementById("taskList");

const taskTitleInput = document.getElementById("taskTitle");
const taskSubjectInput = document.getElementById("taskSubject");
const taskDueDateInput = document.getElementById("taskDueDate");
const taskPriorityInput = document.getElementById("taskPriority");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const upcomingTasks = document.getElementById("upcomingTasks");
const totalReviewers = document.getElementById("totalReviewers");

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");


// NAVIGATION///////////////////////////////////////
const navLinks = document.querySelectorAll(".nav-link");

const pages = {
    dashboard: document.getElementById("dashboardPage"),
    tasks: document.getElementById("tasksPage"),
    reviewers: document.getElementById("reviewersSection"),
    quiz: document.getElementById("quizPage"),
    settings: document.getElementById("settingsPage")
};

navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const selectedPage = link.dataset.page;

        if (!pages[selectedPage]) {
            return;
        }

        Object.keys(pages).forEach(function (pageName) {
            pages[pageName].hidden = pageName !== selectedPage;
        });

        navLinks.forEach(function (navLink) {
            navLink.classList.remove("active");
        });

        link.classList.add("active");

        // Close the task form when leaving My Tasks.
        if (selectedPage !== "tasks") {
            closeTaskForm();
        }

        // Close the reviewer form when leaving Reviewer Library.
        if (selectedPage !== "reviewers") {
            closeReviewerForm();
        }
    });
});


// TASK FILTERS

const filterButtons = document.querySelectorAll(".filter-btn");
let currentFilter = "all";

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function (filterButton) {
            filterButton.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();
    });
});


// ==========================================
// TASK DATA
// ==========================================

let tasks = JSON.parse(
    localStorage.getItem("studyflowTasks") || "[]"
);

let editingTaskId = null;


// ===== SAVE TASKS =====

function saveTasks() {
    localStorage.setItem(
        "studyflowTasks",
        JSON.stringify(tasks)
    );
}


// ===== OPEN ADD TASK FORM =====

addTaskBtn.addEventListener("click", function () {
    editingTaskId = null;

    taskForm.reset();

    taskForm.querySelector("h3").textContent = "Add New Task";
    document.getElementById("saveTaskBtn").textContent = "Save Task";

    taskForm.hidden = false;
    addTaskBtn.disabled = true;

    taskTitleInput.focus();
});


// ===== CLOSE TASK FORM =====

function closeTaskForm() {
    taskForm.reset();
    taskForm.hidden = true;
    addTaskBtn.disabled = false;
    editingTaskId = null;

    taskForm.querySelector("h3").textContent = "Add New Task";
    document.getElementById("saveTaskBtn").textContent = "Save Task";
}

cancelTaskBtn.addEventListener("click", closeTaskForm);


// ===== EDIT TASK =====

function editTask(taskId) {
    const task = tasks.find(function (item) {
        return item.id === taskId;
    });

    if (!task) {
        return;
    }

    editingTaskId = task.id;

    taskTitleInput.value = task.title;
    taskSubjectInput.value = task.subject;
    taskDueDateInput.value = task.dueDate;
    taskPriorityInput.value = task.priority;

    taskForm.querySelector("h3").textContent = "Edit Task";
    document.getElementById("saveTaskBtn").textContent = "Update Task";

    taskForm.hidden = false;
    addTaskBtn.disabled = true;

    taskTitleInput.focus();
}


// ===== SAVE OR UPDATE TASK =====

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskTitleInput.value.trim();
    const subject = taskSubjectInput.value.trim();
    const dueDate = taskDueDateInput.value;
    const priority = taskPriorityInput.value;

    if (!title || !subject || !dueDate) {
        return;
    }

    if (editingTaskId !== null) {
        const task = tasks.find(function (item) {
            return item.id === editingTaskId;
        });

        if (task) {
            task.title = title;
            task.subject = subject;
            task.dueDate = dueDate;
            task.priority = priority;
        }
    } else {
        const newTask = {
            id: Date.now(),
            title: title,
            subject: subject,
            dueDate: dueDate,
            priority: priority,
            completed: false
        };

        tasks.push(newTask);
    }

    saveTasks();
    closeTaskForm();
    renderTasks();
    updateStatistics();
});


// ===== DISPLAY TASKS =====

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(function (task) {
        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-state";

        if (currentFilter === "pending") {
            emptyMessage.textContent = "No pending tasks!";
        } else if (currentFilter === "completed") {
            emptyMessage.textContent = "No completed tasks yet!";
        } else {
            emptyMessage.textContent =
                "No tasks yet. Add your first task!";
        }

        taskList.appendChild(emptyMessage);
        return;
    }

    filteredTasks.forEach(function (task) {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        const taskDetails = document.createElement("div");
        taskDetails.className = "task-details";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark task as completed"
        );

        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;

        if (task.completed) {
            title.classList.add("completed");
        }

        const metadata = document.createElement("p");
        metadata.className = "task-metadata";

        const formattedDate = new Date(
            task.dueDate + "T00:00:00"
        ).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        metadata.textContent =
            `${task.subject} · Due ${formattedDate}`;

        const priority = document.createElement("span");
        priority.className =
            `priority-badge priority-${task.priority.toLowerCase()}`;
        priority.textContent = task.priority;

        taskInfo.appendChild(title);
        taskInfo.appendChild(metadata);
        taskInfo.appendChild(priority);

        taskDetails.appendChild(checkbox);
        taskDetails.appendChild(taskInfo);

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.textContent = "Edit";
        editBtn.className = "edit-task-btn";

        editBtn.addEventListener("click", function () {
            editTask(task.id);
        });

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-task-btn";

        deleteBtn.addEventListener("click", function () {
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
            updateStatistics();
        });

        // Mark task as completed or pending
        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;

            saveTasks();
            renderTasks();
            updateStatistics();
        });

        taskItem.appendChild(taskDetails);
        taskItem.appendChild(editBtn);
        taskItem.appendChild(deleteBtn);

        taskList.appendChild(taskItem);
    });
}


// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    const upcoming = tasks.filter(function (task) {
        return !task.completed &&
            task.dueDate >= getTodayDate();
    }).length;

    const progress = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    upcomingTasks.textContent = upcoming;

    progressText.textContent = `${progress}%`;
    progressBar.style.width = `${progress}%`;

    totalReviewers.textContent = reviewers.length;
}


// ===== GET TODAY'S DATE =====

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ==========================================
// REVIEWER LIBRARY - FILE UPLOAD
// ==========================================

let reviewers = JSON.parse(
    localStorage.getItem("studyflowReviewers") || "[]"
);

const reviewersSection = document.getElementById("reviewersSection");
const addReviewerBtn = document.getElementById("addReviewerBtn");
const reviewerList = document.getElementById("reviewerList");


let reviewerSearch = "";
let reviewerTypeFilter = "all";


const REVIEWER_DB_NAME = "StudyFlowReviewerFiles";
const REVIEWER_STORE_NAME = "files";
const MAX_REVIEWER_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_REVIEWER_EXTENSIONS = ["pdf", "docx", "txt"];


// ===== OPEN INDEXEDDB =====

function openReviewerDatabase() {
    return new Promise(function (resolve, reject) {
        const request = indexedDB.open(REVIEWER_DB_NAME, 1);

        request.onupgradeneeded = function () {
            const database = request.result;

            if (!database.objectStoreNames.contains(REVIEWER_STORE_NAME)) {
                database.createObjectStore(REVIEWER_STORE_NAME, {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}


// ===== SAVE FILE TO INDEXEDDB =====

async function storeReviewerFile(id, file) {
    const database = await openReviewerDatabase();

    return new Promise(function (resolve, reject) {
        const transaction = database.transaction(
            REVIEWER_STORE_NAME,
            "readwrite"
        );

        transaction.objectStore(REVIEWER_STORE_NAME).put({
            id: id,
            name: file.name,
            type: file.type,
            blob: file
        });

        transaction.oncomplete = function () {
            database.close();
            resolve();
        };

        transaction.onerror = function () {
            database.close();
            reject(transaction.error);
        };

        transaction.onabort = function () {
            database.close();
            reject(transaction.error);
        };
    });
}


// ===== GET SAVED FILE =====

async function getReviewerFile(id) {
    const database = await openReviewerDatabase();

    return new Promise(function (resolve, reject) {
        const transaction = database.transaction(
            REVIEWER_STORE_NAME,
            "readonly"
        );

        const request = transaction
            .objectStore(REVIEWER_STORE_NAME)
            .get(id);

        request.onsuccess = function () {
            resolve(request.result || null);
        };

        request.onerror = function () {
            reject(request.error);
        };

        transaction.oncomplete = function () {
            database.close();
        };

        transaction.onerror = function () {
            database.close();
        };
    });
}


// ===== DELETE SAVED FILE =====

async function deleteReviewerFile(id) {
    const database = await openReviewerDatabase();

    return new Promise(function (resolve, reject) {
        const transaction = database.transaction(
            REVIEWER_STORE_NAME,
            "readwrite"
        );

        transaction.objectStore(REVIEWER_STORE_NAME).delete(id);

        transaction.oncomplete = function () {
            database.close();
            resolve();
        };

        transaction.onerror = function () {
            database.close();
            reject(transaction.error);
        };
    });
}


// ===== CREATE REVIEWER FORM =====

const reviewerForm = document.createElement("form");

reviewerForm.id = "reviewerForm";
reviewerForm.className = "task-form";
reviewerForm.hidden = true;

reviewerForm.innerHTML = `
    <h3>Add New Reviewer</h3>

    <div class="form-group">
        <label for="reviewerFile">Choose Reviewer File</label>

        <input
            type="file"
            id="reviewerFile"
            accept=".pdf,.docx,.txt"
            required
        >

        <small>
            Supported formats: PDF, DOCX, TXT.
            Maximum file size: 20 MB.
        </small>

        <p id="reviewerFileName" class="task-metadata">
            No file selected.
        </p>
    </div>

    <div class="form-actions">
        <button type="submit" id="saveReviewerBtn">
            Save Reviewer
        </button>

        <button type="button" id="cancelReviewerBtn">
            Cancel
        </button>
    </div>
`;

reviewersSection.insertBefore(reviewerForm, reviewerList);




const reviewerToolbar = document.createElement("div");
reviewerToolbar.className = "reviewer-toolbar";

reviewerToolbar.innerHTML = `
    <div class="reviewer-search">
        <input
            type="search"
            id="reviewerSearchInput"
            placeholder="Search reviewer files..."
            aria-label="Search reviewer files"
        >
    </div>

    <div class="reviewer-filters" aria-label="Filter reviewer files">
        <button type="button" class="reviewer-filter-btn active"
            data-type="all">All Files</button>
        <button type="button" class="reviewer-filter-btn"
            data-type="pdf">PDF</button>
        <button type="button" class="reviewer-filter-btn"
            data-type="docx">DOCX</button>
        <button type="button" class="reviewer-filter-btn"
            data-type="txt">TXT</button>
    </div>
`;

reviewersSection.insertBefore(reviewerToolbar, reviewerList);

const reviewerSearchInput =
    document.getElementById("reviewerSearchInput");

reviewerSearchInput.addEventListener("input", function () {
    reviewerSearch = reviewerSearchInput.value.trim().toLowerCase();
    renderReviewers();
});

reviewerToolbar.querySelectorAll(".reviewer-filter-btn")
    .forEach(function (button) {
        button.addEventListener("click", function () {
            reviewerTypeFilter = button.dataset.type;

            reviewerToolbar.querySelectorAll(".reviewer-filter-btn")
                .forEach(function (filterButton) {
                    filterButton.classList.toggle(
                        "active",
                        filterButton === button
                    );
                });

            renderReviewers();
        });
    });


const reviewerFileInput = document.getElementById("reviewerFile");
const reviewerFileName = document.getElementById("reviewerFileName");
const cancelReviewerBtn = document.getElementById("cancelReviewerBtn");
const saveReviewerBtn = document.getElementById("saveReviewerBtn");


// ===== SHOW SELECTED FILE NAME =====

reviewerFileInput.addEventListener("change", function () {
    const file = reviewerFileInput.files[0];

    reviewerFileName.textContent = file
        ? file.name
        : "No file selected.";
});


// ===== SAVE REVIEWER INFORMATION =====

function saveReviewers() {
    localStorage.setItem(
        "studyflowReviewers",
        JSON.stringify(reviewers)
    );
}


// ===== OPEN FORM =====

addReviewerBtn.addEventListener("click", function () {
    reviewerForm.reset();

    reviewerFileName.textContent = "No file selected.";
    reviewerForm.hidden = false;
    addReviewerBtn.disabled = true;

    reviewerFileInput.focus();
});


// ===== CLOSE FORM =====

function closeReviewerForm() {
    reviewerForm.reset();

    reviewerFileName.textContent = "No file selected.";
    reviewerForm.hidden = true;
    addReviewerBtn.disabled = false;

    saveReviewerBtn.disabled = false;
    saveReviewerBtn.textContent = "Save Reviewer";
}

cancelReviewerBtn.addEventListener("click", closeReviewerForm);


// ===== ADD REVIEWER FILE =====

reviewerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const file = reviewerFileInput.files[0];

    if (!file) {
        alert("Please choose a reviewer file first.");
        return;
    }

    const extension = file.name.includes(".")
        ? file.name.split(".").pop().toLowerCase()
        : "";

    if (!ALLOWED_REVIEWER_EXTENSIONS.includes(extension)) {
        alert("Please choose a PDF, DOCX, or TXT file.");
        return;
    }

    if (file.size > MAX_REVIEWER_FILE_SIZE) {
        alert("File is too large. Maximum size is 20 MB.");
        return;
    }

    const reviewerId = Date.now();

    saveReviewerBtn.disabled = true;
    saveReviewerBtn.textContent = "Saving...";

    try {
        await storeReviewerFile(reviewerId, file);

        reviewers.push({
            id: reviewerId,
            title: file.name,
            subject: "Uploaded Reviewer",
            fileName: file.name,
            fileType: file.type || extension,
            fileSize: file.size
        });

        saveReviewers();
        closeReviewerForm();
        renderReviewers();
        updateStatistics();

    } catch (error) {
        console.error("Error saving reviewer:", error);

        alert(
            "Could not save the reviewer file. " +
            "Please check your browser storage and try again."
        );

        saveReviewerBtn.disabled = false;
        saveReviewerBtn.textContent = "Save Reviewer";
    }
});


// ===== FORMAT FILE SIZE =====

function formatReviewerFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return "Unknown file size";
    }

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}


// ===== DISPLAY REVIEWERS =====



function renderReviewers() {
    reviewerList.innerHTML = "";

    // Filter reviewers based on search and selected file type
    const filteredReviewers = reviewers.filter(function (reviewer) {
        const fileName = reviewer.fileName || reviewer.title || "";
        const extension = fileName.includes(".")
            ? fileName.split(".").pop().toLowerCase()
            : "";

        const matchesSearch = fileName
            .toLowerCase()
            .includes(reviewerSearch);

        const matchesType =
            reviewerTypeFilter === "all" ||
            extension === reviewerTypeFilter;

        return matchesSearch && matchesType;
    });

    // Show empty state if no matching files exist
    if (filteredReviewers.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-state";

        if (reviewers.length === 0) {
            emptyMessage.textContent =
                "No reviewers yet. Add your first reviewer!";
        } else {
            emptyMessage.textContent =
                "No reviewer files match your search or filter.";
        }

        reviewerList.appendChild(emptyMessage);
        return;
    }

    // Create a card for each matching reviewer
    filteredReviewers.forEach(function (reviewer) {
        const card = document.createElement("article");
        card.className = "reviewer-card";

        const title = document.createElement("h3");
        title.textContent = reviewer.fileName || reviewer.title;

        const details = document.createElement("p");
        details.className = "reviewer-subject";
        details.textContent =
            `${reviewer.fileName || "Reviewer file"} · ` +
            formatReviewerFileSize(reviewer.fileSize);

        const actions = document.createElement("div");
        actions.className = "reviewer-actions";

        // OPEN FILE
        const openBtn = document.createElement("button");
        openBtn.type = "button";
        openBtn.className = "view-reviewer-btn";
        openBtn.textContent = "Open File";

        openBtn.addEventListener("click", async function () {
            let fileUrl = null;

            try {
                const storedFile = await getReviewerFile(reviewer.id);

                if (!storedFile || !storedFile.blob) {
                    alert(
                        "File not found in browser storage. " +
                        "Please upload the reviewer again."
                    );
                    return;
                }

                fileUrl = URL.createObjectURL(storedFile.blob);

                const openedWindow = window.open(fileUrl, "_blank");

                if (!openedWindow) {
                    const downloadLink = document.createElement("a");
                    downloadLink.href = fileUrl;
                    downloadLink.download = storedFile.name;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    downloadLink.remove();
                }

                // Keep the URL available while the file is being viewed.
                // Revoke it after the viewing tab is likely no longer needed.
                setTimeout(function () {
                    if (fileUrl) {
                        URL.revokeObjectURL(fileUrl);
                    }
                }, 5 * 60 * 1000);

            } catch (error) {
                if (fileUrl) {
                    URL.revokeObjectURL(fileUrl);
                }

                console.error("Error opening reviewer:", error);
                alert("Could not open the reviewer file.");
            }
        });

        // DELETE FILE
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-task-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", async function () {
            const fileName = reviewer.fileName || reviewer.title;

            const confirmed = confirm(
                `Delete "${fileName}"? This cannot be undone.`
            );

            if (!confirmed) {
                return;
            }

            deleteBtn.disabled = true;
            deleteBtn.textContent = "Deleting...";

            try {
                await deleteReviewerFile(reviewer.id);

                reviewers = reviewers.filter(function (item) {
                    return item.id !== reviewer.id;
                });

                saveReviewers();
                renderReviewers();
                updateStatistics();

            } catch (error) {
                console.error("Error deleting reviewer:", error);
                alert("Could not delete the reviewer file.");

                deleteBtn.disabled = false;
                deleteBtn.textContent = "Delete";
            }
        });

        actions.appendChild(openBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(title);
        card.appendChild(details);
        card.appendChild(actions);

        reviewerList.appendChild(card);
    });
}




// ==========================================
// INITIAL DISPLAY
// ==========================================




/* ==========================================
   QUIZ MODE - FIXED NAVIGATION AND SCREENS
========================================== */

const quizHome = document.getElementById("quizHome");
const quizWorkspace = document.getElementById("quizWorkspace");
const quizResults = document.getElementById("quizResults");
const quizHistory = document.getElementById("quizHistory");

const manualQuizBtn = document.getElementById("manualQuizBtn");
const reviewerQuizBtn = document.getElementById("reviewerQuizBtn");
const quizHistoryBtn = document.getElementById("quizHistoryBtn");

// Preserve the original builder instead of replacing quizWorkspace.
const quizBuilder = quizWorkspace.querySelector(".quiz-builder");
const quizWorkspaceTitle = document.getElementById("quizWorkspaceTitle");
const quizWorkspaceDescription =
    document.getElementById("quizWorkspaceDescription");

// Separate panel for quiz lists, reviewer selection, and quiz-taking.
let quizDynamicPanel = document.getElementById("quizDynamicPanel");

if (!quizDynamicPanel) {
    quizDynamicPanel = document.createElement("div");
    quizDynamicPanel.id = "quizDynamicPanel";
    quizWorkspace.appendChild(quizDynamicPanel);
}

let manualQuizQuestions = [];

let savedQuizzes = JSON.parse(
    localStorage.getItem("studyflowQuizzes") || "[]"
);

let quizAttempts = JSON.parse(
    localStorage.getItem("studyflowQuizHistory") || "[]"
);

const questionTypeSelect =
    document.getElementById("questionTypeSelect");

const choicesContainer =
    document.getElementById("choicesContainer");

const addQuestionBtn =
    document.getElementById("addQuestionBtn");

const saveQuizBtn =
    document.getElementById("saveQuizBtn");

const cancelQuizBtn =
    document.getElementById("cancelQuizBtn");

const questionTextInput =
    document.getElementById("questionTextInput");

const correctAnswerInput =
    document.getElementById("correctAnswerInput");

const createdQuestionsList =
    document.getElementById("createdQuestionsList");

const questionCount =
    document.getElementById("questionCount");

const quizTitleInput =
    document.getElementById("quizTitleInput");

let activeQuiz = null;
let activeQuestionIndex = 0;
let activeAnswers = [];
let questionTimer = null;
let secondsRemaining = 30;


// ==========================================
// QUIZ STORAGE
// ==========================================

function saveQuizzes() {
    localStorage.setItem(
        "studyflowQuizzes",
        JSON.stringify(savedQuizzes)
    );
}

function saveQuizAttempts() {
    localStorage.setItem(
        "studyflowQuizHistory",
        JSON.stringify(quizAttempts)
    );
}


// ==========================================
// QUIZ SCREEN NAVIGATION
// ==========================================

function clearQuizTimer() {
    if (questionTimer !== null) {
        clearInterval(questionTimer);
        questionTimer = null;
    }
}

function showQuizHome() {
    clearQuizTimer();

    quizHome.hidden = false;
    quizWorkspace.hidden = true;
    quizResults.hidden = true;
    quizHistory.hidden = true;

    quizBuilder.hidden = false;
    quizDynamicPanel.replaceChildren();
}

function showQuizWorkspace(title, description) {
    clearQuizTimer();

    quizHome.hidden = true;
    quizWorkspace.hidden = false;
    quizResults.hidden = true;
    quizHistory.hidden = true;

    quizWorkspaceTitle.textContent = title;
    quizWorkspaceDescription.textContent = description;
}

manualQuizBtn.addEventListener("click", function () {
    showQuizWorkspace(
        "Create Manual Quiz",
        "Create questions, save your quiz, and test your knowledge."
    );

    quizBuilder.hidden = false;
    renderCreatedQuestions();
    renderSavedQuizzes();
});


cancelQuizBtn.addEventListener("click", function () {
    // Clear the questions added to the current draft.
    manualQuizQuestions = [];

    // Reset the quiz title and question fields.
    quizTitleInput.value = "";
    questionTextInput.value = "";
    correctAnswerInput.value = "";

    // Clear all multiple-choice options.
    ["choiceA", "choiceB", "choiceC", "choiceD"].forEach(
        function (id) {
            document.getElementById(id).value = "";
        }
    );

    // Reset the question type and refresh the builder.
    questionTypeSelect.value = "multiple-choice";
    updateQuestionType();

    renderCreatedQuestions();
    showQuizHome();
});



// ==========================================
// MANUAL QUIZ BUILDER
// ==========================================


function updateQuestionType() {
    const type = questionTypeSelect.value;

    // Show choices only for Multiple Choice.
    choicesContainer.hidden = type !== "multiple-choice";

    // Change the question placeholder based on the selected type.
    if (type === "identification") {
        questionTextInput.placeholder =
            "Enter a question, e.g. What is the brain of the computer?";

        correctAnswerInput.placeholder =
            "Enter the exact answer, e.g. CPU";

    } else if (type === "fill-blanks") {
        questionTextInput.placeholder =
            "Enter a sentence with a blank, e.g. The brain of the computer is _____.";

        correctAnswerInput.placeholder =
            "Enter the missing word, e.g. CPU";

    } else if (type === "multiple-choice") {
        questionTextInput.placeholder =
            "Enter your question here...";

        correctAnswerInput.placeholder =
            "Enter the correct choice";

    } else {
        questionTextInput.placeholder =
            "Enter your question here...";

        correctAnswerInput.placeholder =
            "Enter the correct answer";
    }
}

questionTypeSelect.addEventListener("change", updateQuestionType);

function renderCreatedQuestions() {
    createdQuestionsList.replaceChildren();

    questionCount.textContent =
        manualQuizQuestions.length === 0
            ? "No questions added yet."
            : `${manualQuizQuestions.length} question(s) added.`;

    manualQuizQuestions.forEach(function (question, index) {
        const item = document.createElement("div");
        item.className = "created-question-item";

        const title = document.createElement("strong");
        title.textContent =
            `Question ${index + 1}: ${question.text}`;

        const type = document.createElement("p");

if (question.type === "multiple-choice") {
    type.textContent = "Multiple Choice";
} else if (question.type === "identification") {
    type.textContent = "Identification";
} else if (question.type === "fill-blanks") {
    type.textContent = "Fill in the Blanks";
} else if (question.type === "modified-true-false") {
    type.textContent = "Modified True or False";
}

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove Question";

        removeButton.addEventListener("click", function () {
            manualQuizQuestions.splice(index, 1);
            renderCreatedQuestions();
        });

        item.append(title, type, removeButton);
        createdQuestionsList.appendChild(item);
    });
}

addQuestionBtn.addEventListener("click", function () {
    const text = questionTextInput.value.trim();
    const type = questionTypeSelect.value;
    const answer = correctAnswerInput.value.trim();

    if (!text || !answer) {
        alert("Please enter the question and correct answer.");
        return;
    }

    let choices = [];

    if (type === "multiple-choice") {
        choices = ["choiceA", "choiceB", "choiceC", "choiceD"]
            .map(function (id) {
                return document.getElementById(id).value.trim();
            });

        if (choices.some(function (choice) {
            return choice === "";
        })) {
            alert("Please complete all four choices.");
            return;
        }

        const normalizedChoices = choices.map(function (choice) {
            return choice.toLowerCase();
        });

        if (new Set(normalizedChoices).size !== choices.length) {
            alert("Each multiple-choice option must be different.");
            return;
        }

        const answerExists = choices.some(function (choice) {
            return choice.toLowerCase() === answer.toLowerCase();
        });

        if (!answerExists) {
            alert("The correct answer must match one of your choices.");
            return;
        }
    }

    manualQuizQuestions.push({
        id: Date.now() + Math.random(),
        type: type,
        text: text,
        choices: choices,
        answer: answer
    });

    questionTextInput.value = "";
    correctAnswerInput.value = "";

    ["choiceA", "choiceB", "choiceC", "choiceD"].forEach(
        function (id) {
            document.getElementById(id).value = "";
        }
    );

    renderCreatedQuestions();
    questionTextInput.focus();
});

saveQuizBtn.addEventListener("click", function () {
    const title = quizTitleInput.value.trim();

    if (!title) {
        alert("Please enter a quiz title.");
        return;
    }

    if (manualQuizQuestions.length === 0) {
        alert("Please add at least one question.");
        return;
    }

    const newQuiz = {
        id: Date.now(),
        title: title,
        questions: manualQuizQuestions.map(function (question) {
            return {
                ...question,
                choices: [...question.choices]
            };
        }),
        createdAt: new Date().toISOString()
    };

    savedQuizzes.push(newQuiz);
    saveQuizzes();

    manualQuizQuestions = [];
    quizTitleInput.value = "";

    renderCreatedQuestions();
    renderSavedQuizzes();

    alert("Quiz saved successfully!");
});


// ==========================================
// SAVED QUIZZES
// ==========================================

function renderSavedQuizzes() {
    let savedQuizSection =
        document.getElementById("savedQuizSection");

    if (!savedQuizSection) {
        savedQuizSection = document.createElement("section");
        savedQuizSection.id = "savedQuizSection";
        quizDynamicPanel.appendChild(savedQuizSection);
    }

    savedQuizSection.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Your Saved Quizzes";
    savedQuizSection.appendChild(heading);

    if (savedQuizzes.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-state";
        emptyMessage.textContent =
            "No saved quizzes yet. Create and save your first quiz.";

        savedQuizSection.appendChild(emptyMessage);
        return;
    }

    savedQuizzes.forEach(function (quiz) {
        const card = document.createElement("article");
        card.className = "quiz-option-card";

        const title = document.createElement("h3");
        title.textContent = quiz.title;

        const details = document.createElement("p");
        details.textContent =
            `${quiz.questions.length} question(s)`;

        const startButton = document.createElement("button");
        startButton.type = "button";
        startButton.textContent = "Start Quiz";

        startButton.addEventListener("click", function () {
            startQuiz(quiz.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete Quiz";

        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                `Delete "${quiz.title}"? This cannot be undone.`
            );

            if (!confirmed) {
                return;
            }

            savedQuizzes = savedQuizzes.filter(function (item) {
                return item.id !== quiz.id;
            });

            saveQuizzes();
            renderSavedQuizzes();
        });

        card.append(title, details, startButton, deleteButton);
        savedQuizSection.appendChild(card);
    });
}


// ==========================================
// QUIZ RUNNER AND TIMER
// ==========================================

function startQuiz(quizId) {
    const quiz = savedQuizzes.find(function (item) {
        return item.id === quizId;
    });

    if (!quiz || !quiz.questions.length) {
        alert("This quiz has no questions.");
        return;
    }

    activeQuiz = quiz;
    activeQuestionIndex = 0;
    activeAnswers = [];

    quizBuilder.hidden = true;
    quizDynamicPanel.replaceChildren();

    showQuizWorkspace(
        quiz.title,
        "Answer each question before the timer runs out."
    );

    renderQuizQuestion();
}

function renderQuizQuestion() {
    clearQuizTimer();

    if (!activeQuiz) {
        return;
    }

    const question = activeQuiz.questions[activeQuestionIndex];

    quizDynamicPanel.replaceChildren();

    const card = document.createElement("section");
    card.className = "quiz-option-card";

    const progress = document.createElement("p");
    progress.textContent =
        `Question ${activeQuestionIndex + 1} of ${activeQuiz.questions.length}`;

    const timerText = document.createElement("p");
    timerText.id = "quizTimerText";

    const questionTitle = document.createElement("h3");
    questionTitle.textContent = question.text;

    const answerArea = document.createElement("div");
    answerArea.id = "quizAnswerArea";

    if (question.type === "multiple-choice") {
        question.choices.forEach(function (choice, index) {
            const label = document.createElement("label");
            label.className = "quiz-answer-option";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "quizAnswer";
            radio.value = choice;
            radio.id = `quizAnswer${index}`;

            const text = document.createElement("span");
            text.textContent = choice;

            label.append(radio, text);
            answerArea.appendChild(label);
        });
    } else {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "identificationAnswer";
        input.placeholder = "Type your answer";
        input.autocomplete = "off";
        input.setAttribute("aria-label", "Your answer");

        answerArea.appendChild(input);
    }

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.textContent =
        activeQuestionIndex === activeQuiz.questions.length - 1
            ? "Finish Quiz"
            : "Submit & Next";

    submitButton.addEventListener("click", function () {
        submitCurrentAnswer(false);
    });

    card.append(
        progress,
        timerText,
        questionTitle,
        answerArea,
        submitButton
    );

    quizDynamicPanel.appendChild(card);

    secondsRemaining = 30;
    updateQuizTimerText();

    questionTimer = setInterval(function () {
        secondsRemaining--;
        updateQuizTimerText();

        if (secondsRemaining <= 0) {
            submitCurrentAnswer(true);
        }
    }, 1000);

    if (question.type === "identification") {
        document.getElementById("identificationAnswer").focus();
    }
}

function updateQuizTimerText() {
    const timerText = document.getElementById("quizTimerText");

    if (timerText) {
        timerText.textContent =
            `Time remaining: ${secondsRemaining} second(s)`;
    }
}

function submitCurrentAnswer(timedOut) {
    if (!activeQuiz) {
        return;
    }

    // Stop the timer immediately to prevent duplicate submissions.
    clearQuizTimer();

    const question = activeQuiz.questions[activeQuestionIndex];
    let answer = "";

    if (question.type === "multiple-choice") {
        const selected = document.querySelector(
            'input[name="quizAnswer"]:checked'
        );

        answer = selected ? selected.value : "";
    } else {
        const input = document.getElementById("identificationAnswer");
        answer = input ? input.value.trim() : "";
    }

    const isCorrect = answer.trim().toLowerCase() ===
        question.answer.trim().toLowerCase();

    activeAnswers.push({
        question: question.text,
        userAnswer: answer,
        correctAnswer: question.answer,
        correct: isCorrect,
        timedOut: timedOut
    });

    if (activeQuestionIndex < activeQuiz.questions.length - 1) {
        activeQuestionIndex++;
        renderQuizQuestion();
    } else {
        finishQuiz();
    }
}


// ==========================================
// QUIZ RESULTS AND RETRY
// ==========================================

function finishQuiz() {
    clearQuizTimer();

    const total = activeQuiz.questions.length;
    const score = activeAnswers.filter(function (answer) {
        return answer.correct;
    }).length;

    const attempt = {
        id: Date.now(),
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        score: score,
        total: total,
        percentage: Math.round((score / total) * 100),
        completedAt: new Date().toISOString(),
        answers: activeAnswers.map(function (answer) {
            return { ...answer };
        })
    };

    quizAttempts.unshift(attempt);
    saveQuizAttempts();

    quizHome.hidden = true;
    quizWorkspace.hidden = true;
    quizResults.hidden = false;
    quizHistory.hidden = true;

    quizResults.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "Quiz Results";

    const title = document.createElement("h3");
    title.textContent = activeQuiz.title;

    const scoreText = document.createElement("p");
    scoreText.textContent = `Your score: ${score} / ${total}`;

    const percentageText = document.createElement("p");
    percentageText.textContent =
        `Percentage: ${attempt.percentage}%`;

    const reviewHeading = document.createElement("h3");
    reviewHeading.textContent = "Answer Review";

    quizResults.append(
        heading,
        title,
        scoreText,
        percentageText,
        reviewHeading
    );

    activeAnswers.forEach(function (answer, index) {
        const item = document.createElement("div");
        item.className = "created-question-item";

        const question = document.createElement("strong");
        question.textContent =
            `${index + 1}. ${answer.question}`;

        const yourAnswer = document.createElement("p");
        yourAnswer.textContent =
            `Your answer: ${answer.userAnswer || "No answer"}`;

        const correctAnswer = document.createElement("p");
        correctAnswer.textContent =
            `Correct answer: ${answer.correctAnswer}`;

        const status = document.createElement("p");
        status.textContent = answer.correct
            ? "Correct"
            : answer.timedOut
                ? "Time expired"
                : "Incorrect";

        item.append(question, yourAnswer, correctAnswer, status);
        quizResults.appendChild(item);
    });

    const retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.textContent = "Retry Quiz";

    retryButton.addEventListener("click", function () {
        startQuiz(activeQuiz.id);
    });

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.textContent = "Back to Quiz Mode";
    backButton.addEventListener("click", showQuizHome);

    quizResults.append(retryButton, backButton);
}


// ==========================================
// REVIEWER QUIZ
// ==========================================

reviewerQuizBtn.addEventListener("click", function () {
    showQuizWorkspace(
        "Reviewer Quiz",
        "Choose a reviewer from your library."
    );

    quizBuilder.hidden = true;
    quizDynamicPanel.replaceChildren();

    const card = document.createElement("section");
    card.className = "quiz-option-card";

    const heading = document.createElement("h3");
    heading.textContent = "Your Reviewer Library";

    const note = document.createElement("p");
    note.textContent =
        "You can select and open a reviewer file here. " +
        "Automatic question generation from uploaded files is not " +
        "implemented yet. You can create a quiz manually instead.";

    card.append(heading, note);

    if (reviewers.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-state";
        emptyMessage.textContent =
            "No reviewers found. Upload a file in Reviewer Library first.";

        card.appendChild(emptyMessage);
    } else {
        const select = document.createElement("select");
        select.id = "quizReviewerSelect";
        select.setAttribute("aria-label", "Choose a reviewer");

        reviewers.forEach(function (reviewer) {
            const option = document.createElement("option");
            option.value = String(reviewer.id);
            option.textContent = reviewer.fileName || reviewer.title;
            select.appendChild(option);
        });

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.textContent = "Open Selected Reviewer";

        openButton.addEventListener("click", async function () {
            let fileUrl = null;

            try {
                const storedFile = await getReviewerFile(
                    Number(select.value)
                );

                if (!storedFile || !storedFile.blob) {
                    alert(
                        "Reviewer file not found. Please upload it again."
                    );
                    return;
                }

                fileUrl = URL.createObjectURL(storedFile.blob);
                const openedWindow = window.open(fileUrl, "_blank");

                if (!openedWindow) {
                    const link = document.createElement("a");
                    link.href = fileUrl;
                    link.download = storedFile.name;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }

                setTimeout(function () {
                    URL.revokeObjectURL(fileUrl);
                }, 5 * 60 * 1000);

            } catch (error) {
                if (fileUrl) {
                    URL.revokeObjectURL(fileUrl);
                }

                console.error("Error opening reviewer:", error);
                alert("Could not open the reviewer file.");
            }
        });

        card.append(select, openButton);
    }

    const manualButton = document.createElement("button");
    manualButton.type = "button";
    manualButton.textContent = "Create Manual Quiz";

    manualButton.addEventListener("click", function () {
        manualQuizBtn.click();
    });

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.textContent = "Back to Quiz Mode";
    backButton.addEventListener("click", showQuizHome);

    card.append(manualButton, backButton);
    quizDynamicPanel.appendChild(card);
});


// ==========================================
// QUIZ HISTORY
// ==========================================

quizHistoryBtn.addEventListener("click", renderQuizHistory);

function renderQuizHistory() {
    clearQuizTimer();

    quizHome.hidden = true;
    quizWorkspace.hidden = true;
    quizResults.hidden = true;
    quizHistory.hidden = false;

    quizHistory.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "Quiz History";

    const description = document.createElement("p");
    description.textContent =
        "Review your previous quiz attempts and scores.";

    quizHistory.append(heading, description);

    if (quizAttempts.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-state";
        emptyMessage.textContent =
            "No quiz attempts yet. Complete a quiz to see your results here.";

        quizHistory.appendChild(emptyMessage);
    } else {
        quizAttempts.forEach(function (attempt) {
            const card = document.createElement("article");
            card.className = "quiz-option-card";

            const title = document.createElement("h3");
            title.textContent = attempt.quizTitle;

            const score = document.createElement("p");
            score.textContent =
                `Score: ${attempt.score}/${attempt.total} ` +
                `(${attempt.percentage}%)`;

            const date = document.createElement("p");
            date.textContent = new Date(
                attempt.completedAt
            ).toLocaleString();

            card.append(title, score, date);
            quizHistory.appendChild(card);
        });

        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.textContent = "Clear Quiz History";

        clearButton.addEventListener("click", function () {
            const confirmed = confirm(
                "Delete all quiz history? This cannot be undone."
            );

            if (!confirmed) {
                return;
            }

            quizAttempts = [];
            saveQuizAttempts();
            renderQuizHistory();
        });

        quizHistory.appendChild(clearButton);
    }

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.textContent = "Back to Quiz Mode";
    backButton.addEventListener("click", showQuizHome);

    quizHistory.appendChild(backButton);
}


/* ==========================================
   SETTINGS - PROFILE AND APPEARANCE
========================================== */

const studentNameInput = document.getElementById("studentNameInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const themeSelect = document.getElementById("themeSelect");
const saveAppearanceBtn = document.getElementById("saveAppearanceBtn");

const settingsMessage = document.getElementById("settingsMessage");

// Apply a theme and save the preference
function applyStudyFlowTheme(theme) {
    document.body.classList.toggle("studyflow-dark", theme === "dark");

    // Update the theme selector
    if (themeSelect) {
        themeSelect.value = theme;
    }
}

// Load saved settings
function loadStudyFlowSettings() {
    const savedName = localStorage.getItem("studyflowStudentName");
    const savedTheme = localStorage.getItem("studyflowTheme") || "light";

    if (studentNameInput) {
        studentNameInput.value = savedName || "";
    }

    applyStudyFlowTheme(savedTheme);

    // Update the displayed student name
    if (savedName) {
        const avatar = document.querySelector(".user-profile .avatar");
        const profileName = document.querySelector(".user-profile span");
        const welcomeTitle = document.querySelector(".welcome-section h2");

        if (avatar) {
            avatar.textContent = savedName.charAt(0).toUpperCase();
        }

        if (profileName) {
            profileName.textContent = savedName;
        }

        if (welcomeTitle) {
            welcomeTitle.textContent = `Welcome back, ${savedName}!`;
        }
    }
}

// Display a settings message
function showSettingsMessage(message) {
    if (settingsMessage) {
        settingsMessage.textContent = message;
    }
}

// Save Profile
if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", function () {
        const studentName = studentNameInput.value.trim();

        if (!studentName) {
            showSettingsMessage("Please enter your student name.");
            studentNameInput.focus();
            return;
        }

        localStorage.setItem("studyflowStudentName", studentName);

        loadStudyFlowSettings();

        showSettingsMessage("Profile saved successfully!");
    });
}

// Save Appearance
if (saveAppearanceBtn) {
    saveAppearanceBtn.addEventListener("click", function () {
        const selectedTheme = themeSelect.value;

        localStorage.setItem("studyflowTheme", selectedTheme);

        applyStudyFlowTheme(selectedTheme);

        showSettingsMessage("Appearance saved successfully!");
    });
}


/* =====================================
   STUDYFLOW SIDEBAR TOGGLE
===================================== */

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
        const isCollapsed = sidebar.classList.toggle("collapsed");

        sidebarToggle.setAttribute(
            "aria-expanded",
            String(!isCollapsed)
        );

        sidebarToggle.setAttribute(
            "aria-label",
            isCollapsed ? "Expand sidebar" : "Collapse sidebar"
        );

        sidebarToggle.setAttribute(
            "title",
            isCollapsed ? "Expand sidebar" : "Collapse sidebar"
        );
    });
}





// Load settings when the page opens
loadStudyFlowSettings();



// ==========================================
// INITIAL QUIZ DISPLAY
// ==========================================

updateQuestionType();
renderCreatedQuestions();




renderTasks();
renderReviewers();
updateStatistics();


