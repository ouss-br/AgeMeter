
/* =================================
   1. CURRENT YEAR
================================= */

document.querySelectorAll(".current-year").forEach(element => {
    element.textContent = new Date().getFullYear();
});


/* =================================
   2. MOBILE NAVIGATION
================================= */

const menuBtn = document.getElementById("menu-btn");
const menuDropdown = document.getElementById("menu-dropdown");
const menuContainer = document.querySelector(".menu-container");

if (menuBtn && menuDropdown && menuContainer) {

    // Toggle menu
    menuBtn.addEventListener("click", () => {
        const isOpen = menuDropdown.classList.toggle("active");

        menuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu after clicking a link
    menuDropdown.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            menuDropdown.classList.remove("active");
            menuBtn.setAttribute("aria-expanded", "false");
        });
    });

    // Close menu when clicking outside
    document.addEventListener("click", event => {
        if (!menuContainer.contains(event.target)) {
            menuDropdown.classList.remove("active");
            menuBtn.setAttribute("aria-expanded", "false");
        }
    });

    // Close menu when switching to desktop
    window.addEventListener("resize", () => {
        if (window.innerWidth > 767) {
            menuDropdown.classList.remove("active");
            menuBtn.setAttribute("aria-expanded", "false");
        }
    });

    // Close menu with Escape key
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            menuDropdown.classList.remove("active");
            menuBtn.setAttribute("aria-expanded", "false");
        }
    });
}


/* =================================
   3. AGE CALCULATOR ELEMENTS
================================= */

const birthDateInput = document.getElementById("birth-date");
const calculateBtn = document.getElementById("calculate-btn");
const resultElement = document.getElementById("result");

const daysResult = document.getElementById("days-result");
const weeksResult = document.getElementById("weeks-result");
const hoursResult = document.getElementById("hours-result");
const minutesResult = document.getElementById("minutes-result");
const secondsResult = document.getElementById("seconds-result");
const birthdayResult = document.getElementById("birthday-result");


/* =================================
   4. DATE HELPERS
================================= */

// Create a local date without the year 0-99 limitation
function makeLocalDate(year, month, day) {
    const date = new Date(0);

    date.setFullYear(year, month, day);
    date.setHours(0, 0, 0, 0);

    return date;
}


// Get today's date at local midnight
function getToday() {
    const now = new Date();

    return makeLocalDate(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
}


// Get the number of days in a month
function getDaysInMonth(year, month) {
    return makeLocalDate(year, month + 1, 0).getDate();
}


// Convert date input into a validated local date
function parseBirthDate(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const parts = value.split("-").map(Number);

    const [year, month, day] = parts;

    if (!year || month < 1 || month > 12 || day < 1) {
        return null;
    }

    const date = makeLocalDate(year, month - 1, day);

    // Validate the entered date
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}


// Add years while preserving the calendar day
function addYears(date, years) {
    const targetYear = date.getFullYear() + years;
    const targetMonth = date.getMonth();

    const lastDay = getDaysInMonth(targetYear, targetMonth);

    return makeLocalDate(
        targetYear,
        targetMonth,
        Math.min(date.getDate(), lastDay)
    );
}


// Add months while preserving the calendar day
function addMonths(date, months) {
    const target = makeLocalDate(
        date.getFullYear(),
        date.getMonth() + months,
        1
    );

    const lastDay = getDaysInMonth(
        target.getFullYear(),
        target.getMonth()
    );

    return makeLocalDate(
        target.getFullYear(),
        target.getMonth(),
        Math.min(date.getDate(), lastDay)
    );
}


// Calculate calendar days between two dates
function getCalendarDays(start, end) {
    const startUTC = Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
    );

    const endUTC = Date.UTC(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
    );

    return Math.round(
        (endUTC - startUTC) / 86400000
    );
}


// Format large numbers
function formatNumber(number) {
    return new Intl.NumberFormat("en-US").format(number);
}


// Safely update an element
function setText(element, value) {
    if (element) {
        element.textContent = value;
    }
}


/* =================================
   5. CALCULATE EXACT AGE
================================= */

function calculateExactAge(birthDate, today) {

    let years =
        today.getFullYear() - birthDate.getFullYear();

    let yearDate = addYears(birthDate, years);

    if (yearDate > today) {
        years--;
        yearDate = addYears(birthDate, years);
    }

    let months =
        (today.getFullYear() - yearDate.getFullYear()) * 12 +
        today.getMonth() - yearDate.getMonth();

    let monthDate = addMonths(yearDate, months);

    if (monthDate > today) {
        months--;
        monthDate = addMonths(yearDate, months);
    }

    const days = getCalendarDays(monthDate, today);

    return {
        years,
        months,
        days
    };
}


/* =================================
   6. BIRTHDAY COUNTDOWN
================================= */

function getNextBirthday(birthDate, today) {

    function makeBirthday(year) {
        const month = birthDate.getMonth();

        const lastDay = getDaysInMonth(year, month);

        return makeLocalDate(
            year,
            month,
            Math.min(birthDate.getDate(), lastDay)
        );
    }

    let nextBirthday = makeBirthday(today.getFullYear());

    if (nextBirthday < today) {
        nextBirthday = makeBirthday(today.getFullYear() + 1);
    }

    return getCalendarDays(today, nextBirthday);
}


/* =================================
   7. DISPLAY RESULTS
================================= */

function displayResults(birthDate) {

    const now = new Date();
    const today = getToday();

    const age = calculateExactAge(birthDate, today);


    // Actual elapsed time since midnight of birth date
    const elapsedMilliseconds =
        now.getTime() - birthDate.getTime();

    const totalSeconds = Math.floor(
        elapsedMilliseconds / 1000
    );

    const totalMinutes = Math.floor(
        totalSeconds / 60
    );

    const totalHours = Math.floor(
        totalMinutes / 60
    );


    // Calendar-based time
    const totalDays = getCalendarDays(
        birthDate,
        today
    );

    const totalWeeks = Math.floor(
        totalDays / 7
    );


    // Birthday countdown
    const daysUntilBirthday = getNextBirthday(
        birthDate,
        today
    );


    /* Main age result */

    if (resultElement) {
        resultElement.innerHTML = `
            <div class="result-highlight">
                <h2>Your Exact Age</h2>

                <p>
                    <strong>${age.years}</strong> Years,
                    <strong>${age.months}</strong> Months,
                    <strong>${age.days}</strong> Days
                </p>
            </div>
        `;
    }


    /* Other age tools */

    setText(
        daysResult,
        `${formatNumber(totalDays)} days`
    );

    setText(
        weeksResult,
        `${formatNumber(totalWeeks)} weeks`
    );

    setText(
        hoursResult,
        `${formatNumber(totalHours)} hours`
    );

    setText(
        minutesResult,
        `${formatNumber(totalMinutes)} minutes`
    );

    setText(
        secondsResult,
        `${formatNumber(totalSeconds)} seconds`
    );


    /* Birthday countdown */

    if (daysUntilBirthday === 0) {

        setText(
            birthdayResult,
            "Happy Birthday! 🎂"
        );

    } else {

        setText(
            birthdayResult,
            `${formatNumber(daysUntilBirthday)} days remaining`
        );
    }
}


/* =================================
   8. CALCULATE BUTTON
================================= */

function handleCalculation() {

    if (!birthDateInput || !resultElement) {
        return;
    }

    const birthDate = parseBirthDate(
        birthDateInput.value
    );


    // Check empty or invalid input
    if (!birthDate) {

        resultElement.textContent =
            "Please enter a valid date of birth.";

        return;
    }


    const today = getToday();


    // Prevent future dates
    if (birthDate > today) {

        resultElement.textContent =
            "Date of birth cannot be in the future.";

        return;
    }


    // Calculate and display age
    displayResults(birthDate);
}


/* =================================
   9. EVENT LISTENERS
================================= */

// Calculate button click
if (calculateBtn) {
    calculateBtn.addEventListener(
        "click",
        handleCalculation
    );
}


// Enter key support
if (birthDateInput) {

    birthDateInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            handleCalculation();
        }

    });


    // Prevent selecting a future date
    const today = getToday();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    birthDateInput.max = `${year}-${month}-${day}`;
}
