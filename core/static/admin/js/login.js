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
            // Add subtle scale animation to the input
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                formGroup.classList.remove('focused');
            }
            // Remove scale animation
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

    // Enhanced form validation with smooth animations
    loginForm.addEventListener('submit', function(e) {
        let isValid = true;
        const errors = [];

        // Remove any existing error messages with fade out animation
        const existingErrors = document.querySelector('.error-messages');
        if (existingErrors) {
            existingErrors.style.opacity = '0';
            existingErrors.style.transform = 'translateY(-10px)';
            setTimeout(() => existingErrors.remove(), 300);
        }

        // Username validation with shake animation
        if (!usernameInput.value.trim()) {
            errors.push('Username is required');
            isValid = false;
            usernameInput.classList.add('error');
            shakeElement(usernameInput);
        } else {
            usernameInput.classList.remove('error');
        }

        // Password validation with shake animation
        if (!passwordInput.value) {
            errors.push('Password is required');
            isValid = false;
            passwordInput.classList.add('error');
            shakeElement(passwordInput);
        } else if (passwordInput.value.length < 6) {
            errors.push('Password must be at least 6 characters long');
            isValid = false;
            passwordInput.classList.add('error');
            shakeElement(passwordInput);
        } else {
            passwordInput.classList.remove('error');
        }

        // If there are errors, prevent form submission and show errors with animation
        if (!isValid) {
            e.preventDefault();
            
            // Create and show error messages with fade in animation
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-messages';
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateY(10px)';

            errors.forEach(error => {
                const errorP = document.createElement('p');
                errorP.className = 'alert alert-error';
                errorP.textContent = error;
                errorDiv.appendChild(errorP);
            });

            loginForm.insertBefore(errorDiv, loginForm.firstChild);

            // Trigger reflow for animation
            errorDiv.offsetHeight;

            // Add fade in animation
            errorDiv.style.opacity = '1';
            errorDiv.style.transform = 'translateY(0)';
            errorDiv.style.transition = 'all 0.3s ease-out';
        } else {
            // Add loading state to button
            loginButton.disabled = true;
            loginButton.innerHTML = '<span class="spinner"></span> Logging in...';
        }
    });

    // Function to add shake animation
    function shakeElement(element) {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'shake 0.5s ease-in-out';
    }

    // Add keyframe animation for shake effect
    if (!document.querySelector('#shake-animation')) {
        const style = document.createElement('style');
        style.id = 'shake-animation';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-5px); }
                40%, 80% { transform: translateX(5px); }
            }
            .spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
                vertical-align: middle;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Clear error styling when user starts typing
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            this.style.animation = 'none';
            const formGroup = this.parentElement;
            formGroup.classList.remove('error');
        });
    });
}); 