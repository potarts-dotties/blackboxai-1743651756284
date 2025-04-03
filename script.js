// Global variables
let submissions = JSON.parse(localStorage.getItem('uglyArtSubmissions')) || [];
let votedEntries = JSON.parse(localStorage.getItem('votedEntries')) || [];

// DOM Elements
const elements = {
    // Submission Page
    submissionForm: document.getElementById('submissionForm'),
    artTitle: document.getElementById('artTitle'),
    artImage: document.getElementById('artImage'),
    imagePreview: document.getElementById('imagePreview'),
    titleError: document.getElementById('titleError'),
    imageError: document.getElementById('imageError'),

    // Voting Page
    artGrid: document.getElementById('artGrid'),
    searchInput: document.getElementById('searchInput'),
    noEntries: document.getElementById('noEntries'),

    // Trophy Page
    championImage: document.getElementById('championImage'),
    championTitle: document.getElementById('championTitle'),
    championVotes: document.getElementById('championVotes'),
    noChampion: document.getElementById('noChampion'),
    resetBtn: document.getElementById('resetBtn')
};

// Initialize page-specific functionality
function initPage() {
    const path = window.location.pathname.split('/').pop();

    if (path === 'submit.html') {
        initSubmissionPage();
    } else if (path === 'vote.html') {
        initVotingPage();
    } else if (path === 'trophy.html') {
        initTrophyPage();
    }
}

// Submission Page Functions
function initSubmissionPage() {
    if (!elements.submissionForm) return;

    // Image preview handler
    elements.artImage.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                elements.imagePreview.innerHTML = `<img src="${event.target.result}" class="max-h-64 w-auto mx-auto">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission handler
    elements.submissionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        let isValid = true;
        if (!elements.artTitle.value.trim()) {
            elements.titleError.classList.remove('hidden');
            isValid = false;
        } else {
            elements.titleError.classList.add('hidden');
        }

        if (!elements.artImage.files[0]) {
            elements.imageError.classList.remove('hidden');
            isValid = false;
        } else {
            elements.imageError.classList.add('hidden');
        }

        if (!isValid) return;

        // Process submission
        const reader = new FileReader();
        reader.onload = function(event) {
            const newSubmission = {
                id: Date.now(),
                title: elements.artTitle.value.trim(),
                image: event.target.result,
                votes: 0,
                date: new Date().toISOString()
            };

            submissions.push(newSubmission);
            saveSubmissions();
            alert('Your masterpiece has been submitted to the hall of shame!');
            window.location.href = 'index.html';
        };
        reader.readAsDataURL(elements.artImage.files[0]);
    });
}

// Voting Page Functions
function initVotingPage() {
    if (!elements.artGrid) return;

    // Load and display submissions
    displaySubmissions();

    // Search functionality
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', function() {
            displaySubmissions(this.value.toLowerCase());
        });
    }
}

function displaySubmissions(filter = '') {
    elements.artGrid.innerHTML = '';

    const filteredSubmissions = submissions.filter(sub => 
        sub.title.toLowerCase().includes(filter)
    );

    if (filteredSubmissions.length === 0) {
        elements.noEntries.classList.remove('hidden');
        return;
    }

    elements.noEntries.classList.add('hidden');

    filteredSubmissions.forEach(sub => {
        const hasVoted = votedEntries.includes(sub.id);
        const entry = document.createElement('div');
        entry.className = 'art-entry bg-white rounded-xl shadow-md p-4 flex flex-col';
        entry.innerHTML = `
            <div class="flex-grow mb-4 overflow-hidden">
                <img src="${sub.image}" alt="${sub.title}" class="w-full h-48 object-contain mx-auto">
            </div>
            <h3 class="text-lg font-bold text-[#45B7D1] mb-2 truncate">${sub.title}</h3>
            <div class="flex items-center justify-between mt-auto">
                <span class="text-gray-600"><i class="fas fa-thumbs-up mr-1"></i>${sub.votes}</span>
                <button data-id="${sub.id}" class="vote-btn px-3 py-1 rounded-lg ${hasVoted ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4ECDC4] hover:bg-[#3bb5ac]'} text-white transition">
                    ${hasVoted ? 'Voted!' : 'Vote'}
                </button>
            </div>
        `;
        elements.artGrid.appendChild(entry);
    });

    // Add vote event listeners
    document.querySelectorAll('.vote-btn').forEach(btn => {
        if (!btn.classList.contains('bg-gray-400')) {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                voteForSubmission(id);
            });
        }
    });
}

function voteForSubmission(id) {
    const submission = submissions.find(sub => sub.id === id);
    if (submission && !votedEntries.includes(id)) {
        submission.votes += 1;
        votedEntries.push(id);
        saveSubmissions();
        saveVotedEntries();
        displaySubmissions(elements.searchInput?.value.toLowerCase() || '');
    }
}

// Trophy Page Functions
function initTrophyPage() {
    if (!elements.championImage) return;

    displayChampion();

    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all submissions and votes?')) {
                localStorage.clear();
                submissions = [];
                votedEntries = [];
                displayChampion();
            }
        });
    }

    // Create confetti effect
    createConfetti();
}

function displayChampion() {
    if (submissions.length === 0) {
        elements.noChampion.classList.remove('hidden');
        elements.championArt.classList.add('hidden');
        return;
    }

    elements.noChampion.classList.add('hidden');
    elements.championArt.classList.remove('hidden');

    // Find submission with most votes
    const champion = submissions.reduce((prev, current) => 
        (prev.votes > current.votes) ? prev : current
    );

    elements.championImage.src = champion.image;
    elements.championImage.alt = champion.title;
    elements.championTitle.textContent = champion.title;
    elements.championVotes.innerHTML = `<i class="fas fa-thumbs-up mr-1"></i>${champion.votes} votes`;
}

function createConfetti() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD166', '#06D6A0'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() + 's';
        confetti.style.width = (Math.random() * 10 + 5) + 'px';
        confetti.style.height = (Math.random() * 10 + 5) + 'px';
        document.body.appendChild(confetti);
    }
}

// Helper Functions
function saveSubmissions() {
    localStorage.setItem('uglyArtSubmissions', JSON.stringify(submissions));
}

function saveVotedEntries() {
    localStorage.setItem('votedEntries', JSON.stringify(votedEntries));
}

// Initialize the current page
document.addEventListener('DOMContentLoaded', initPage);