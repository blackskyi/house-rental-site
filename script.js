// Configuration
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxg-tNtejAoXsJPhMVqDjlP95dRKbIZ50HEyZzCJLgr0V5JUmeXZ5c6EEqP0okUl9Pf/exec',
    RECIPIENT_EMAIL: 'support@og-rooms.com'
};

// Load images from assets/images folder
function loadGallery() {
    // Image filenames - add your image files to assets/images/ and list them here
    const images = [
        // Example: 'house-front.jpg', 'living-room.jpg', 'bedroom.jpg'
    ];

    // Video filenames - add your video files to assets/videos/ and list them here
    const videos = [
        // Example: 'house-tour.mp4', 'backyard.mp4'
    ];

    const photoGallery = document.getElementById('photoGallery');
    const videoGallery = document.getElementById('videoGallery');

    // Load images
    if (images.length > 0) {
        photoGallery.innerHTML = '';
        images.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `<img src="assets/images/${image}" alt="House photo ${index + 1}" onclick="openModal(this.src)">`;
            photoGallery.appendChild(item);
        });
    }

    // Load videos
    if (videos.length > 0) {
        videoGallery.innerHTML = '';
        videos.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = 'video-item';
            item.innerHTML = `
                <video controls>
                    <source src="assets/videos/${video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
            videoGallery.appendChild(item);
        });
    }
}

// Image modal
function openModal(src) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <span class="close-modal">&times;</span>
        <img class="modal-content" src="${src}">
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = function() {
        modal.remove();
    };

    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    loadGallery();

    const form = document.getElementById('applicationForm');
    const formMessage = document.getElementById('formMessage');

    if (!form) return; // Exit if no form on page

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Collect form data
        const formData = {
            propertyName: document.getElementById('propertyName')?.value || 'General Inquiry',
            propertyOwner: document.getElementById('propertyOwner')?.value || 'Unknown',
            ownerEmail: document.getElementById('ownerEmail')?.value || CONFIG.RECIPIENT_EMAIL,
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            moveInDate: document.getElementById('moveInDate').value,
            occupants: document.getElementById('occupants').value,
            employment: document.getElementById('employment').value,
            income: document.getElementById('income').value,
            pets: document.getElementById('pets').value,
            petDetails: document.getElementById('petDetails').value,
            references: document.getElementById('references').value,
            message: document.getElementById('message').value,
            availability: document.getElementById('availability')?.value || '',
            submittedAt: new Date().toLocaleString(),
            recipientEmail: CONFIG.RECIPIENT_EMAIL
        };

        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            // Send to Google Apps Script
            const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // Show success message
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Application submitted successfully! Check your email for confirmation.';
            form.reset();

            // Scroll to message
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (error) {
            // Show error message
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Error submitting application. Please try again or contact us directly.';
            console.error('Error:', error);
        } finally {
            // Reset button
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Show/hide pet details based on selection
    const petsSelect = document.getElementById('pets');
    const petDetailsGroup = document.getElementById('petDetails').parentElement;

    petsSelect.addEventListener('change', function() {
        if (this.value === 'yes') {
            petDetailsGroup.style.display = 'block';
        } else {
            petDetailsGroup.style.display = 'none';
            document.getElementById('petDetails').value = '';
        }
    });

    // Initially hide pet details
    if (petsSelect.value !== 'yes') {
        petDetailsGroup.style.display = 'none';
    }
});
