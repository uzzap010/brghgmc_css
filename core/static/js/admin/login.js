document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('.login-btn');

    // Add material design-like floating label effect
    const inputs = [usernameInput, passwordInput];
    inputs.forEach(input => {
        const formGroup = input.parentElement;
        
        // Add floating effect if input has value
        if (input.value) {
            formGroup.classList.add('focused');
        }

        // Handle focus events
        input.addEventListener('focus', function() {
            formGroup.classList.add('focused');
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                formGroup.classList.remove('focused');
            }
            this.style.transform = 'scale(1)';
        });

        // Add smooth typing animation
        input.addEventListener('input', function() {
            if (this.value) {
                this.style.borderColor = 'var(--primary-color)';
            } else {
                this.style.borderColor = 'var(--border-color)';
            }
        });
    });

    // Add ripple effect to login button
    loginButton.addEventListener('mousedown', function(e) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        this.appendChild(ripple);

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;

        const x = e.clientX - rect.left - size/2;
        const y = e.clientY - rect.top - size/2;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    });

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            username: usernameInput.value.trim(),
            password: passwordInput.value,
            remember: document.getElementById('remember').checked
        };

        // Show loading state
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="spinner"></span> Logging in...';

        try {
            const response = await fetch('/custom-admin/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.status === 'success') {
                window.location.href = data.redirect_url;
            } else {
                showError(data.message || 'Login failed. Please try again.');
                loginButton.disabled = false;
                loginButton.innerHTML = 'Sign In';
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
            loginButton.disabled = false;
            loginButton.innerHTML = 'Sign In';
        }
    });

    // Helper function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Helper function to show error messages
    function showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.opacity = '1';
        errorDiv.style.transform = 'translateY(0)';
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateY(-10px)';
        }, 5000);
    }

    // Clear error when user starts typing
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateY(-10px)';
        });
    });
}); 