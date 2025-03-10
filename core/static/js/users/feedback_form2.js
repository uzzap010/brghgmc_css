document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sideNav = document.querySelector('.side-nav');
    const closeBtn = document.querySelector('.close-btn');
    const overlay = document.querySelector('.overlay');
    const body = document.body;

    function openSideNav() {
        sideNav.classList.add('active');
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
    }

    function closeSideNav() {
        sideNav.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
    }

    if (mobileMenuBtn && sideNav && closeBtn && overlay) {
        mobileMenuBtn.addEventListener('click', openSideNav);
        closeBtn.addEventListener('click', closeSideNav);
        overlay.addEventListener('click', closeSideNav);

        // Close side nav when clicking a link
        const sideNavLinks = document.querySelectorAll('.side-nav-links a');
        sideNavLinks.forEach(link => {
            link.addEventListener('click', closeSideNav);
        });
    }

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Form Functionality
    const feedbackForm = document.querySelector('.feedback-form');
    if (feedbackForm) {
        // Create loading overlay
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loading);

        // Create success message with animation
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle success-icon"></i>
                <h2>Thank You!</h2>
                <p>Your feedback has been submitted successfully.</p>
            </div>
        `;
        document.body.appendChild(successMessage);

        // Form submission
        feedbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading
            loading.classList.add('show');

            try {
                // Submit form
                const formData = new FormData(feedbackForm);
                const response = await fetch(feedbackForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                    }
                });

                if (response.ok) {
                    // Hide loading
                    loading.classList.remove('show');
                    
                    // Show success message with animation
                    successMessage.classList.add('show');
                    
                    // Wait for animation and redirect
                    setTimeout(() => {
                        window.location.href = '/office/';  // Redirect to office index
                    }, 2000);  // Wait for 2 seconds before redirecting
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                loading.classList.remove('show');
                showError('An error occurred while submitting the form. Please try again.');
            }
        });

        // Add input validation for staff name fields
        const staffFirstNameInput = document.getElementById('id_staff_first_name');
        const staffLastNameInput = document.getElementById('id_staff_last_name');
        
        if (staffFirstNameInput && staffLastNameInput) {
            staffFirstNameInput.addEventListener('input', function() {
                if (this.value.toUpperCase() === 'N/A') {
                    staffLastNameInput.value = 'N/A';
                    staffLastNameInput.disabled = true;
                } else {
                    staffLastNameInput.disabled = false;
                }
            });
        }

        // Add smooth scroll to form sections
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add animation to form elements on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.form-group, .rating-group').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.5s ease';
            observer.observe(el);
        });
    }
});

// Error handling function
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.querySelector('.feedback-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}
