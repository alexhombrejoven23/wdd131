document.addEventListener('DOMContentLoaded', () => {
    initializeMonthSelector();
    loadUserProgress();
});


function initializeMonthSelector() {
    const monthButtons = document.querySelectorAll('.month-btn');
    
    if (monthButtons.length === 0) return;
    
    monthButtons.forEach(button => {
        button.addEventListener('click', () => {
            const monthNumber = button.getAttribute('data-month');
            switchMonth(monthNumber);

            monthButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            saveToStorage('selectedMonth', monthNumber);
        });
    });

    const savedMonth = loadFromStorage('selectedMonth');
    if (savedMonth) {
        const savedButton = document.querySelector(`[data-month="${savedMonth}"]`);
        if (savedButton) {
            savedButton.click();
        }
    }
}


function switchMonth(monthNumber) {
    const allMonthContent = document.querySelectorAll('.month-content');
    allMonthContent.forEach(content => {
        content.classList.add('hidden');
    });

    const selectedMonth = document.getElementById(`month-${monthNumber}`);
    if (selectedMonth) {
        selectedMonth.classList.remove('hidden');

        selectedMonth.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    trackMonthView(monthNumber);
}

function trackMonthView(monthNumber) {
    let viewedMonths = loadFromStorage('viewedMonths') || [];
    
    if (!viewedMonths.includes(monthNumber)) {
        viewedMonths.push(monthNumber);
        saveToStorage('viewedMonths', viewedMonths);
        console.log(`Month ${monthNumber} viewed. Total months viewed: ${viewedMonths.length}`);
    }
}


function loadUserProgress() {
    const progress = loadFromStorage('programProgress') || {
        currentMonth: 1,
        completedLessons: 0,
        lastAccess: null
    };
    

    const currentMonthIndicator = document.getElementById('current-month-indicator');
    if (currentMonthIndicator) {
        currentMonthIndicator.textContent = `You are currently on Month ${progress.currentMonth}`;
    }
    

    progress.lastAccess = new Date().toISOString();
    saveToStorage('programProgress', progress);
}


function markMonthComplete(monthNumber) {
    const progress = loadFromStorage('programProgress') || { 
        currentMonth: 1, 
        completedMonths: [] 
    };
    
    if (!progress.completedMonths) {
        progress.completedMonths = [];
    }
    
    if (!progress.completedMonths.includes(monthNumber)) {
        progress.completedMonths.push(monthNumber);
        progress.currentMonth = Math.min(parseInt(monthNumber) + 1, 6);
        saveToStorage('programProgress', progress);
        
        console.log(`Month ${monthNumber} completed!`);
        return true;
    }
    
    return false;
}

function getCompletionPercentage() {
    const progress = loadFromStorage('programProgress') || { completedMonths: [] };
    const completed = progress.completedMonths ? progress.completedMonths.length : 0;
    return Math.round((completed / 6) * 100);
}