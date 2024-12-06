class Job {
    /**
     * Constructor for initializing Job objects.
     * @param {Object} jobData - The job data from the JSON file.
     */
    constructor({ Title, Posted, Type, Level, Skill, Detail, "Job Page Link": link }) {
        // Set job properties with default values for missing data
        this.title = Title || "Unknown Title"; // Default title
        this.posted = this.normalizePostedTime(Posted || "Unknown Time"); // Normalize time for consistency
        this.type = Type || "Unknown Type"; // Default type
        this.level = Level || "Unknown Level"; // Default level
        this.skill = Skill || "Unknown Skill"; // Default skill
        this.detail = Detail || "No Details Available"; // Default detail
        this.link = link || "#"; // Default link
    }

    /**
     * Normalize the "Posted" field into a consistent time format in minutes.
     * @param {string} posted - The raw posted time string (e.g., "2 hours").
     * @returns {number} - The equivalent time in minutes.
     */
    normalizePostedTime(posted) {
        const match = posted.match(/(\d+)\s(\w+)/); // Match time value and unit
        if (!match) return 0; // Return 0 if no valid match is found
        const [_, value, unit] = match; // Extract value and unit
        const multiplier = { minute: 1, hour: 60, day: 1440 }[unit.toLowerCase()] || 1; // Convert to minutes
        return parseInt(value, 10) * multiplier; // Calculate total minutes
    }

    /**
     * Get a formatted version of the posted time.
     * @returns {string} - Formatted time string (e.g., "120 minutes ago").
     */
    getFormattedPostedTime() {
        return `${this.posted} minutes ago`;
    }

    /**
     * Generate HTML for the job details.
     * @returns {string} - HTML representation of the job.
     */
    getDetails() {
        return `
            <div class="job">
                <h2>${this.title}</h2>
                <p><strong>Posted:</strong> ${this.getFormattedPostedTime()}</p>
                <p><strong>Type:</strong> ${this.type}</p>
                <p><strong>Level:</strong> ${this.level}</p>
                <p><strong>Skill:</strong> ${this.skill}</p>
                <p>${this.detail}</p>
                <a href="${this.link}" target="_blank">View Job</a>
            </div>`;
    }
}

let jobs = []; // Array to hold all Job objects
const jobListings = document.getElementById("job-listings"); // Container for job listings

document.getElementById("file-input").addEventListener("change", (e) => {
    const file = e.target.files[0]; // Get selected file
    if (!file) return;

    const reader = new FileReader(); // Create a FileReader instance
    reader.onload = () => {
        try {
            const jsonData = JSON.parse(reader.result); // Parse JSON file content
            jobs = jsonData.map((data) => new Job(data)); // Convert JSON to Job objects
            populateFilters(); // Populate filter dropdowns dynamically
            displayJobs(jobs); // Display all jobs
        } catch (error) {
            alert("Invalid JSON file format."); // Error message for invalid JSON
        }
    };
    reader.readAsText(file); // Read file as text
});

function populateFilters() {
    // Collect unique values for filters
    const levels = new Set(jobs.map((job) => job.level));
    const types = new Set(jobs.map((job) => job.type));
    const skills = new Set(jobs.map((job) => job.skill));

    // Populate each dropdown with unique values
    populateDropdown("filter-level", levels);
    populateDropdown("filter-type", types);
    populateDropdown("filter-skill", skills);
}

/**
 * Populate a dropdown menu with items.
 * @param {string} id - The ID of the dropdown element.
 * @param {Set} items - Unique items to populate.
 */
function populateDropdown(id, items) {
    const dropdown = document.getElementById(id); // Get dropdown by ID
    dropdown.innerHTML = '<option value="">All</option>'; // Default option
    items.forEach((item) => {
        dropdown.innerHTML += `<option value="${item}">${item}</option>`; // Add options
    });
}

/**
 * Display a list of jobs on the webpage.
 * @param {Array} filteredJobs - Array of jobs to display.
 */
function displayJobs(filteredJobs) {
    jobListings.innerHTML = filteredJobs.map((job) => job.getDetails()).join(""); // Render jobs as HTML
}

["filter-level", "filter-type", "filter-skill"].forEach((id) => {
    document.getElementById(id).addEventListener("change", applyFiltersAndSort); // Apply filters on change
});

/**
 * Apply filters and sorting to the jobs.
 */
function applyFiltersAndSort() {
    const level = document.getElementById("filter-level").value; // Selected level
    const type = document.getElementById("filter-type").value; // Selected type
    const skill = document.getElementById("filter-skill").value; // Selected skill
    const sortBy = document.getElementById("sort-options").value; // Selected sort option

    // Filter jobs based on criteria
    let filteredJobs = jobs.filter(
        (job) =>
            (!level || job.level === level) &&
            (!type || job.type === type) &&
            (!skill || job.skill === skill)
    );

    // Sort filtered jobs
    filteredJobs = sortJobs(filteredJobs, sortBy);
    displayJobs(filteredJobs); // Display results
}

/**
 * Sort jobs based on the selected criteria.
 * @param {Array} jobs - Jobs to sort.
 * @param {string} sortBy - Sorting criteria.
 * @returns {Array} - Sorted jobs.
 */
function sortJobs(jobs, sortBy) {
    switch (sortBy) {
        case "title-asc":
            return jobs.sort((a, b) => a.title.localeCompare(b.title)); // A-Z by title
        case "title-desc":
            return jobs.sort((a, b) => b.title.localeCompare(a.title)); // Z-A by title
        case "posted-asc":
            return jobs.sort((a, b) => a.posted - b.posted); // Oldest first
        case "posted-desc":
            return jobs.sort((a, b) => b.posted - a.posted); // Newest first
        default:
            return jobs; // No sorting
    }
}

// Listen for sorting dropdown changes
document.getElementById("sort-options").addEventListener("change", applyFiltersAndSort);
