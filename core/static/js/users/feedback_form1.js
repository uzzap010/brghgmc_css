// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeRatings();
    setCurrentDate();
    initializeCharterQuestions();
    initializeAnimations();
    initializeFormValidation();
    initializeTextFeedback();
    initializeProgressBar();
    initializeTooltips();
    initializeScrollEffects();
    initializeAccessibility();
    ensureContentVisibility();
    initializeErrorHandling();
    initializeModernAnimations();
    initializeIntersectionObserver();
    initializeStaffMatrixScroll();

    // Initialize tooltips with enhanced options
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
        animation: true,
        delay: { show: 100, hide: 100 },
        trigger: 'hover focus',
        boundary: 'window'
    }));

    // Set current date
    const currentDate = new Date()
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('fil-PH', options)

    // Form validation
    const form = document.querySelector('#feedback-form')
    if (form) {
        form.addEventListener('submit', function(event) {
            if (!this.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
                
                // Find first invalid field
                const firstInvalid = form.querySelector(':invalid')
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }
            this.classList.add('was-validated')
        })
    }

    // Modern scroll animations
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top bottom-=100",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: index * 0.1
        });
    });

    // Rating selection handling
    const ratingInputs = document.querySelectorAll('.rating-input');
    
    ratingInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Remove selected class from all labels in this group
            const groupLabels = this.closest('.rating-options').querySelectorAll('.rating-label');
            groupLabels.forEach(label => label.classList.remove('selected'));
            
            // Add selected class to the chosen label
            this.closest('.rating-label').classList.add('selected');
            
            // Trigger animation
            const emoji = this.closest('.rating-label').querySelector('.emoji');
            emoji.style.animation = 'none';
            emoji.offsetHeight; // Trigger reflow
            emoji.style.animation = 'scaleIn 0.3s ease forwards';
        });
    });
});

function ensureContentVisibility() {
    // Check and fix visibility of all major components
    const components = [
        '.rating-container',
        '.staff-matrix',
        '.feedback-text-section',
        '.follow-up-question'
    ];

    components.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Ensure display property is set correctly
            if (window.getComputedStyle(element).display === 'none') {
                element.style.display = 'block';
            }
            // Add fade-in animation
            element.classList.add('fade-in');
        });
    });

    // Ensure staff matrix is properly laid out
    const staffMatrix = document.querySelector('.staff-matrix-container');
    if (staffMatrix) {
        staffMatrix.style.display = 'block';
        staffMatrix.style.width = '100%';
        adjustStaffMatrixLayout();
    }
}

function adjustStaffMatrixLayout() {
    const staffRows = document.querySelectorAll('.staff-row');
    const container = document.querySelector('.staff-matrix-container');
    
    if (!container || !staffRows.length) return;

    // Calculate optimal width for staff matrix
    const containerWidth = container.offsetWidth;
    const minCellWidth = 60; // Minimum width for rating cells
    const labelWidth = Math.max(containerWidth * 0.3, 150); // 30% of container or minimum 150px
    const remainingWidth = containerWidth - labelWidth;
    const ratingWidth = Math.max(minCellWidth, remainingWidth / 5);

    // Apply calculated widths
    staffRows.forEach(row => {
        const cells = row.children;
        if (cells.length > 0) {
            cells[0].style.width = `${labelWidth}px`; // Label column
            for (let i = 1; i < cells.length; i++) {
                cells[i].style.width = `${ratingWidth}px`; // Rating columns
            }
        }
    });
}

function initializeRatings() {
    const ratingLabels = document.querySelectorAll('.rating-label');
    const ratingInputs = document.querySelectorAll('.rating-input');

    ratingLabels.forEach(label => {
        label.addEventListener('click', () => {
            const container = label.closest('.rating-container');
            const allLabels = container.querySelectorAll('.rating-label');
            allLabels.forEach(l => l.classList.remove('selected'));
            label.classList.add('selected');
            
            // Trigger animation
            const emoji = label.querySelector('.emoji-large');
            emoji.style.transform = 'scale(1.2)';
            setTimeout(() => {
                emoji.style.transform = 'scale(1.1)';
            }, 200);
        });
    });

    ratingInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const label = e.target.closest('.rating-label');
            const value = e.target.value;
            const container = label.closest('.rating-container');
            
            // Update visual state
            container.querySelectorAll('.rating-label').forEach(l => {
                l.classList.remove('selected');
                if (l.dataset.rating === value) {
                    l.classList.add('selected');
                }
            });
        });
    });
}

function createRippleEffect(event, element) {
    const circle = document.createElement('div');
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - element.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - element.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = element.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    element.appendChild(circle);
}

function updateStaffRatingVisuals(radio) {
    const row = radio.closest('.staff-row');
    const rating = parseInt(radio.value);
    const color = getEmotionColor(rating);
    
    // Animate background change
    row.style.transition = 'background-color 0.3s ease';
    row.style.backgroundColor = `${color}22`; // Add 22 for 13% opacity
    
    // Add visual indicator
    const indicator = document.createElement('div');
    indicator.className = 'rating-indicator';
    indicator.style.backgroundColor = color;
    
    // Remove any existing indicators
    const existingIndicator = row.querySelector('.rating-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    row.appendChild(indicator);
    
    // Animate indicator
    requestAnimationFrame(() => {
        indicator.style.transform = 'scale(1)';
        indicator.style.opacity = '1';
    });
}

function getEmotionColor(rating) {
    const colors = {
        5: '#00C853', // Excellent
        4: '#64DD17', // Good
        3: '#FFD600', // Neutral
        2: '#FF9100', // Bad
        1: '#FF3D00'  // Terrible
    };
    return colors[rating] || colors[3];
}

function handleRatingClick(label) {
    if (!label) {
        console.warn('Rating label is null or undefined');
        return;
    }

    // Check if this is a staff matrix rating
    const isStaffRating = label.closest('.staff-matrix') !== null;
    
    // Find the appropriate container based on the rating type
    let ratingContainer;
    if (isStaffRating) {
        // For staff matrix ratings, find the staff row
        ratingContainer = label.closest('.staff-row');
        if (!ratingContainer) {
            console.warn('Staff row not found for label:', label);
            return;
        }
    } else {
        // For main rating questions, try to find the rating container
        ratingContainer = label.closest('.rating-container');
        
        // If not found, try finding through parent elements
        if (!ratingContainer) {
            let parent = label.parentElement;
            while (parent) {
                if (parent.classList.contains('rating-container') || 
                    parent.classList.contains('rating-options') ||
                    parent.classList.contains('rating-scale-container')) {
                    ratingContainer = parent;
                    break;
                }
                parent = parent.parentElement;
            }
        }

        // If still not found, try finding the closest rating-options parent
        if (!ratingContainer) {
            const ratingOptions = label.closest('.rating-options');
            if (ratingOptions) {
                ratingContainer = ratingOptions.parentElement;
            }
        }

        if (!ratingContainer) {
            console.warn('Rating container not found for label:', label);
            return;
        }
    }

    const rating = label.getAttribute('data-rating');
    if (!rating) {
        console.warn('Rating value not found for label:', label);
        return;
    }

    // Remove selected class from all labels in this container
    const allLabels = ratingContainer.querySelectorAll('.rating-label');
    if (allLabels && allLabels.length > 0) {
        allLabels.forEach(l => l.classList.remove('selected'));
    }
    
    // Add selected class to clicked label
    label.classList.add('selected');

    // Update visual feedback
    const emoji = label.querySelector('.emoji-large .emoji');
    if (emoji) {
        emoji.style.transform = 'scale(1.2)';
    setTimeout(() => {
            emoji.style.transform = 'scale(1)';
        }, 200);
    }

    // Save rating
    const input = label.querySelector('input[type="radio"]');
    if (input) {
        input.checked = true;
        saveRating(input.name, rating);
    }

    // Handle follow-up questions if needed (only for main rating questions)
    if (!isStaffRating) {
        const followUpContainer = ratingContainer.querySelector('.follow-up-container');
        if (followUpContainer) {
            if (rating === '1' || rating === '2') {
                showFollowUpQuestion(followUpContainer, rating);
            } else {
                hideFollowUpQuestion(followUpContainer);
            }
        }
    }

    // Play feedback sound
    playFeedbackSound(rating);

    // Highlight related ratings
    highlightRelatedRatings(rating);
}

function getNextVisibleContainer(currentContainer) {
    let next = currentContainer.nextElementSibling;
    while (next) {
        if (next.classList.contains('rating-container') && 
            window.getComputedStyle(next).display !== 'none') {
            return next;
        }
        next = next.nextElementSibling;
    }
    return null;
}

function smoothScrollTo(element) {
    const offset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    gsap.to(window, {
        duration: 0.8,
        scrollTo: {
            y: offsetPosition,
            offsetY: offset
        },
        ease: "power3.inOut"
    });
}

function getEmotionShadow(rating) {
    const colors = {
        5: 'rgba(76, 175, 80, 0.5)',  // Excellent - Green
        4: 'rgba(139, 195, 74, 0.5)',  // Good - Light Green
        3: 'rgba(255, 193, 7, 0.5)',   // Neutral - Yellow
        2: 'rgba(255, 152, 0, 0.5)',   // Bad - Orange
        1: 'rgba(244, 67, 54, 0.5)'    // Terrible - Red
    };
    return `0 8px 24px ${colors[rating] || 'rgba(0, 0, 0, 0.2)'}`;
}

function highlightRelatedRatings(rating) {
    if (!rating) return;
    
    const relatedLabels = document.querySelectorAll(`.rating-label[data-rating="${rating}"]`);
    if (!relatedLabels) return;

    relatedLabels.forEach(label => {
        if (!label.classList.contains('selected')) {
            label.style.transform = 'scale(1.05)';
            label.style.boxShadow = getEmotionShadow(rating);
        }
    });
}

function resetRelatedRatings() {
    const allLabels = document.querySelectorAll('.rating-label:not(.selected)');
    allLabels.forEach(label => {
        label.style.transform = 'scale(1)';
        label.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    });
}

function playFeedbackSound(rating) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Map ratings to frequencies (higher rating = higher pitch)
    const frequencies = {
        5: 880,  // A5
        4: 783.99,  // G5
        3: 698.46,  // F5
        2: 659.25,  // E5
        1: 587.33   // D5
    };
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequencies[rating] || 440;
    
    gainNode.gain.value = 0.1;
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

function showFollowUpQuestion(container, rating) {
    const existingFollowUp = container.nextElementSibling;
    if (existingFollowUp && existingFollowUp.classList.contains('follow-up-question')) {
        existingFollowUp.remove();
    }
    
    const followUpDiv = document.createElement('div');
    followUpDiv.className = 'follow-up-question';
    followUpDiv.style.opacity = '0';
    
    const textArea = document.createElement('textarea');
    textArea.className = 'form-control';
    textArea.placeholder = rating === '1' ? 
        'Pakilahad ang iyong hindi magandang karanasan...' :
        'Paano namin mapapabuti ang aming serbisyo?';
    
    const helpText = document.createElement('p');
    helpText.className = 'text-muted mt-2';
    helpText.textContent = 'Ang iyong feedback ay mahalaga sa amin.';
    
    followUpDiv.appendChild(textArea);
    followUpDiv.appendChild(helpText);
    
    container.after(followUpDiv);
    
    // Animate the follow-up question
    requestAnimationFrame(() => {
        followUpDiv.style.transition = 'all 0.3s ease';
        followUpDiv.style.opacity = '1';
    });
    
    // Auto-save the response as the user types
    textArea.addEventListener('input', debounce(() => {
        saveFollowUpResponse(container.getAttribute('data-question-id'), textArea.value);
    }, 500));
}

function hideFollowUpQuestion(container) {
    const followUp = container.nextElementSibling;
    if (followUp && followUp.classList.contains('follow-up-question')) {
        followUp.style.opacity = '0';
        setTimeout(() => followUp.remove(), 300);
    }
}

function saveFollowUpResponse(containerId, response) {
    localStorage.setItem(`followup_${containerId}`, response);
}

function handleStaffRatingClick(radio) {
    const row = radio.closest('.staff-row');
    const rating = parseInt(radio.value);
    
    // Add visual feedback
    row.style.transition = 'background-color 0.3s ease';
    row.style.backgroundColor = getEmotionColor(rating);
    
    // Play feedback sound
    playFeedbackSound(rating);
}

function setCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
    };
        dateElement.textContent = now.toLocaleDateString('fil-PH', options);
    }
}

function initializeCharterQuestions() {
    const charterSelect = document.querySelector('.charter-select');
    const followUpContainer = document.querySelector('.follow-up-container');
    const followUpCards = document.querySelectorAll('.follow-up-card');

    console.log('Initializing Charter Questions:', {
        charterSelect: charterSelect?.value,
        followUpContainer: followUpContainer,
        followUpCards: followUpCards.length
    });

    if (!charterSelect || !followUpContainer) {
        console.error('Required elements not found:', {
            charterSelect: !!charterSelect,
            followUpContainer: !!followUpContainer
        });
        return;
    }

    function showFollowUpQuestions() {
        console.log('Showing follow-up questions');
        // First, ensure the container is visible
        followUpContainer.style.display = 'block';
        followUpContainer.style.visibility = 'visible';
        followUpContainer.classList.add('active');
        
        // Then show each card with a shorter delay
        followUpCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.display = 'block';
                card.style.visibility = 'visible';
                card.classList.add('active');
                console.log(`Showing card ${index + 1}`);
            }, index * 100);
        });
    }

    function hideFollowUpQuestions() {
        console.log('Hiding follow-up questions');
        // Remove active class from all cards
        followUpCards.forEach(card => {
            card.classList.remove('active');
            card.style.display = 'none';
            card.style.visibility = 'hidden';
        });
        
        // Hide the container
        followUpContainer.classList.remove('active');
        followUpContainer.style.display = 'none';
        followUpContainer.style.visibility = 'hidden';
    }

    function handleCharterChange(event) {
        const selectedValue = event.target.value;
        console.log('Charter selection changed:', selectedValue);
        
        // Show follow-up questions for these specific values
        if (selectedValue === 'seen' || selectedValue === 'heard_not_seen' || selectedValue === 'heard_not_seen_2') {
            showFollowUpQuestions();
        } else {
            hideFollowUpQuestions();
        }
    }

    // Initial check
    const currentValue = charterSelect.value;
    console.log('Initial charter value:', currentValue);
    
    if (currentValue === 'seen' || currentValue === 'heard_not_seen' || currentValue === 'heard_not_seen_2') {
        showFollowUpQuestions();
    } else {
        hideFollowUpQuestions();
    }

    // Event listener
    charterSelect.addEventListener('change', handleCharterChange);
}

function initializeAnimations() {
    // Initialize GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
        // Animate cards on scroll
        gsap.from(".card", {
            duration: 1,
            y: 60,
            opacity: 0,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".card",
                start: "top bottom",
                toggleActions: "play none none reverse"
            }
        });

        // Animate rating containers
        gsap.from(".rating-container", {
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".rating-container",
                start: "top bottom",
                toggleActions: "play none none reverse"
            }
        });

        // Animate staff matrix
        gsap.from(".staff-matrix", {
            duration: 1,
            y: 40,
            opacity: 0,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".staff-matrix",
                start: "top bottom",
                toggleActions: "play none none reverse"
            }
        });
    }
    
    // Add hover effects to cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -5,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });

    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = `${size}px`;
            
            const x = e.clientX - rect.left - size/2;
            const y = e.clientY - rect.top - size/2;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function initializeFormValidation() {
    const form = document.querySelector('#feedback-form');
    if (!form) return;
    
    // Add required indicators to required fields
    document.querySelectorAll('.rating-container[required]').forEach(container => {
        const questionHeader = container.querySelector('.question-header');
        if (questionHeader) {
            questionHeader.classList.add('required-field');
        }
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Remove existing validation popup
        const existingPopup = document.querySelector('.validation-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Check if all required ratings are selected
        const requiredRatings = document.querySelectorAll('.rating-container[required]');
        let isValid = true;
        let firstError = null;
        
        requiredRatings.forEach(container => {
            const selected = container.querySelector('.rating-label.selected');
            if (!selected) {
                isValid = false;
                if (!firstError) firstError = container;
                
                // Add error state
                container.classList.add('has-error');
                container.classList.add('shake-animation');
                
                // Remove shake animation after it completes
                setTimeout(() => {
                    container.classList.remove('shake-animation');
                }, 600);
                
                // Show error message
                let errorMsg = container.querySelector('.error-message');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Mangyaring pumili ng rating.';
                    container.appendChild(errorMsg);
                }
                
                // Animate error message
                setTimeout(() => {
                    errorMsg.classList.add('show');
                }, 100);
            } else {
                // Remove error state if previously added
                container.classList.remove('has-error');
                const errorMsg = container.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.classList.remove('show');
                    setTimeout(() => errorMsg.remove(), 300);
                }
            }
        });
        
        if (!isValid) {
            // Show validation popup
            const popup = document.createElement('div');
            popup.className = 'validation-popup';
            popup.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                May mga kinakailangang sagutan na hindi pa nasasagutan.
            `;
            document.body.appendChild(popup);
            
            // Animate popup
            setTimeout(() => {
                popup.classList.add('show');
            }, 100);
            
            // Remove popup after 5 seconds
            setTimeout(() => {
                popup.classList.remove('show');
                setTimeout(() => popup.remove(), 300);
            }, 5000);
            
            // Scroll to first error with smooth animation
            if (firstError) {
                firstError.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
            
            return;
        }
        
        // If valid, proceed with form submission
        if (isValid) {
            // Show completion animation
            showCompletionMessage();
            
            // Submit the form and redirect
            const formData = new FormData(form);
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => {
                if (response.ok) {
                    // Animate form submission
                    gsap.to(form, {
                        opacity: 0,
                        y: 20,
                        duration: 0.5,
                        ease: "power2.in",
                        onComplete: () => {
                            window.location.href = '/feedback/success/';
                        }
                    });
                } else {
                    console.error('Form submission failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
    
    // Add event listeners to remove error state when rating is selected
    document.querySelectorAll('.rating-label').forEach(label => {
        label.addEventListener('click', function() {
            const container = this.closest('.rating-container');
            if (container) {
                container.classList.remove('has-error');
                const errorMsg = container.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.classList.remove('show');
                    setTimeout(() => errorMsg.remove(), 300);
                }
            }
        });
    });
}

// Helper function to get CSRF token
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

function saveRating(name, rating) {
    localStorage.setItem(`rating_${name}`, rating);
}

function initializeTextFeedback() {
    const textareas = document.querySelectorAll('.feedback-textarea');
    const classificationMatrix = document.querySelector('.feedback-classification-matrix');
    const maxLength = 500;

    // Initialize classification checkboxes
    const checkboxes = document.querySelectorAll('.classification-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('.matrix-row');
            if (this.checked) {
                row.style.backgroundColor = '#ffffff';
                row.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
            } else {
                row.style.backgroundColor = '#f8f9fa';
                row.style.boxShadow = 'none';
            }
            
            // Save checkbox state
            localStorage.setItem(this.id, this.checked);
        });
        
        // Restore checkbox state
        const savedState = localStorage.getItem(checkbox.id);
        if (savedState === 'true') {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));
        }
    });
    
    textareas.forEach(textarea => {
        const container = textarea.closest('.feedback-textarea-container');
        const currentCount = container.querySelector('.current-count');
        const maxCount = container.querySelector('.max-count');

        // Set initial values
        maxCount.textContent = maxLength;
        textarea.maxLength = maxLength;

        // Update character count and show/hide matrix
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            currentCount.textContent = length;

            // Show classification matrix if there's text in any textarea
            if (length > 0) {
                classificationMatrix.style.display = 'block';
                setTimeout(() => {
                    classificationMatrix.classList.add('visible');
                }, 10);
            } else {
                // Check if other textarea is empty before hiding
                const otherTextareas = Array.from(textareas).filter(t => t !== this);
                const allEmpty = otherTextareas.every(t => t.value.length === 0);
                if (allEmpty) {
                    classificationMatrix.classList.remove('visible');
                    setTimeout(() => {
                        classificationMatrix.style.display = 'none';
                    }, 300);
                }
            }

            // Add visual feedback states
            if (length >= maxLength) {
                textarea.classList.add('warning');
            } else {
                textarea.classList.remove('warning');
            }

            // Auto-expand textarea
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';

            // Save content to localStorage
            localStorage.setItem(this.name, this.value);
        });

        // Restore saved content
        const savedContent = localStorage.getItem(textarea.name);
        if (savedContent) {
            textarea.value = savedContent;
            textarea.dispatchEvent(new Event('input'));
        }
    });
}

function initializeProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);
    
    // Animate progress bar on scroll
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        
        const progress = (scrolled / documentHeight) * 100;
        
        gsap.to(progressBar, {
            width: `${progress}%`,
            duration: 0.3,
            ease: "power2.out"
        });
        
        if (progress > 99) {
            progressBar.classList.add('completed');
        } else {
            progressBar.classList.remove('completed');
        }
    });
}

function showCompletionMessage() {
    const message = document.createElement('div');
    message.className = 'completion-message';
    message.textContent = 'Salamat sa iyong feedback!';
    document.body.appendChild(message);
    
    gsap.from(message, {
        x: 100,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
    });
    
    setTimeout(() => {
        gsap.to(message, {
            x: 100,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => message.remove()
        });
    }, 3000);
}

function initializeTooltips() {
    const ratingLabels = document.querySelectorAll('.rating-label');
    
    ratingLabels.forEach(label => {
        const rating = label.getAttribute('data-rating');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = getRatingText(rating);
        label.appendChild(tooltip);
        
        // Show/hide tooltip on hover for desktop
        if (window.matchMedia('(min-width: 768px)').matches) {
            label.addEventListener('mouseenter', () => tooltip.style.opacity = '1');
            label.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
        }
    });
}

function getRatingText(rating) {
    const texts = {
        5: 'Lubos na Sumasang-ayon',
        4: 'Sumasang-ayon',
        3: 'Medyo Sumasang-ayon',
        2: 'Hindi Sumasang-ayon',
        1: 'Lubos na Hindi Sumasang-ayon'
    };
    return texts[rating] || '';
}

function initializeScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.rating-container, .staff-matrix, .feedback-text-section').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(element);
    });
}

function initializeAccessibility() {
    const ratingLabels = document.querySelectorAll('.rating-label');
    if (!ratingLabels) {
        console.warn('No rating labels found for accessibility initialization');
        return;
    }

    ratingLabels.forEach(label => {
        if (!label) return;

        const input = label.querySelector('input[type="radio"]');
        if (!input) return;

        // Set ARIA attributes
        label.setAttribute('role', 'radio');
        label.setAttribute('aria-checked', input.checked);
        label.setAttribute('tabindex', '0');

        // Add keyboard event listeners
        label.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleRatingClick(label);
            }
        });
    });
}

function initializeErrorHandling() {
    window.addEventListener('error', function(e) {
        console.error('JS Error:', e.error);
        // Attempt to recover from errors
        ensureContentVisibility();
    });

    // Handle dynamic content loading errors
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                ensureContentVisibility();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Add CSS for new animations and effects
const style = document.createElement('style');
style.textContent = `
    .progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
        transition: width 0.3s ease;
        z-index: 1000;
    }
    
    .progress-bar.completed {
        animation: rainbow 2s linear infinite;
    }
    
    @keyframes rainbow {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(61, 146, 95, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(2.5);
            opacity: 0;
        }
    }
    
    .tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        padding: 0.5rem 1rem;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 4px;
        font-size: 0.8rem;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
        white-space: nowrap;
    }
    
    .completion-message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: var(--primary-color);
        color: white;
        border-radius: 8px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .completion-message.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .scroll-animation {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeIn 0.5s ease-out forwards;
    }

    .rating-indicator {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%) scale(0);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .error-message {
        color: #ff3d00;
        font-size: 0.9rem;
        margin-top: 0.5rem;
        opacity: 0;
        transform: translateY(-10px);
        animation: slideDown 0.3s ease forwards;
    }

    @keyframes slideDown {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes scaleIn {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

function showFollowUp(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
        element.style.opacity = '0';
        requestAnimationFrame(() => {
            element.style.transition = 'opacity 0.3s ease';
            element.style.opacity = '1';
        });
    }
}

function hideFollowUp(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.display = 'none';
        }, 300);
    }
}

function initializeModernAnimations() {
    // Enhanced rating transitions
    const ratingLabels = document.querySelectorAll('.rating-label');
    if (!ratingLabels || ratingLabels.length === 0) {
        console.warn('No rating labels found for animations');
        return;
    }

    ratingLabels.forEach(label => {
        if (!label) return;

        label.addEventListener('mouseenter', () => {
            gsap.to(label, {
                scale: 1.05,
                y: -5,
                duration: 0.3,
                ease: "back.out(1.7)"
            });

            // Animate siblings
            const isStaffRating = label.closest('.staff-matrix') !== null;
            let container;
            
            if (isStaffRating) {
                container = label.closest('.staff-row');
            } else {
                container = label.closest('.rating-container');
                if (!container) {
                    const ratingOptions = label.closest('.rating-options');
                    if (ratingOptions) {
                        container = ratingOptions.parentElement;
                    }
                }
            }
            
            if (container) {
                const siblings = [...container.querySelectorAll('.rating-label')].filter(el => el !== label);
                gsap.to(siblings, {
                    scale: 0.95,
                    opacity: 0.7,
                    duration: 0.3
                });
            }
        });

        label.addEventListener('mouseleave', () => {
            if (!label.classList.contains('selected')) {
                gsap.to(label, {
                    scale: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                });
            }

            // Reset siblings
            const isStaffRating = label.closest('.staff-matrix') !== null;
            let container;
            
            if (isStaffRating) {
                container = label.closest('.staff-row');
            } else {
                container = label.closest('.rating-container');
                if (!container) {
                    const ratingOptions = label.closest('.rating-options');
                    if (ratingOptions) {
                        container = ratingOptions.parentElement;
                    }
                }
            }
            
            if (container) {
                const siblings = [...container.querySelectorAll('.rating-label')];
                gsap.to(siblings, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.3
                });
            }
        });

        label.addEventListener('click', () => {
            const isStaffRating = label.closest('.staff-matrix') !== null;
            let container;
            
            if (isStaffRating) {
                container = label.closest('.staff-row');
            } else {
                container = label.closest('.rating-container');
                if (!container) {
                    const ratingOptions = label.closest('.rating-options');
                    if (ratingOptions) {
                        container = ratingOptions.parentElement;
                    }
                }
            }
            
            if (!container) {
                console.warn('Container not found for label click animation');
                return;
            }

            // Remove previous selections
            const allLabels = container.querySelectorAll('.rating-label');
            if (allLabels && allLabels.length > 0) {
                allLabels.forEach(l => {
                    if (l !== label) {
                        gsap.to(l, {
                            scale: 1,
                            y: 0,
                            duration: 0.3,
                            ease: "back.out(1.7)",
                            clearProps: "all"
                        });
                        l.classList.remove('selected');
                    }
                });
            }

            // Animate selected label
            label.classList.add('selected');
            gsap.to(label, {
                scale: 1.1,
                y: -10,
                duration: 0.3,
                ease: "back.out(1.7)"
            });

            // Animate container
            gsap.to(container, {
                borderColor: 'var(--primary-color)',
                boxShadow: '0 12px 24px rgba(0,102,255,0.2)',
                duration: 0.3
            });

            // Update progress bar
            updateProgress();
        });
    });

    // Enhanced progress bar
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        ScrollTrigger.create({
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                const progress = self.progress * 100;
                gsap.to(progressBar, {
                    width: `${progress}%`,
                    duration: 0.3,
                    ease: "power2.out"
                });

                // Update color based on progress
                const color = progress < 30 ? '#ff4444' :
                             progress < 70 ? '#ffbb33' :
                             '#00C853';
                
                gsap.to(progressBar, {
                    backgroundColor: color,
                    duration: 0.5
                });
            }
        });
    }

    // Enhanced button animations
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            gsap.to(button, {
                scale: 1.02,
                y: -2,
                duration: 0.3,
                ease: "power2.out"
            });

            createRippleEffect(e, button);
        });

        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        button.addEventListener('click', (e => {
            gsap.to(button, {
                scale: 0.98,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        }));
    });
}

function initializeIntersectionObserver() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // Observe rating containers
    document.querySelectorAll('.rating-container').forEach(container => {
        observer.observe(container);
    });
}

function initializeStaffMatrixScroll() {
    const staffMatrix = document.querySelector('.staff-matrix');
    const container = document.querySelector('.staff-matrix-container');
    
    if (!staffMatrix || !container) return;

    // Check if scrolling is needed
    function checkScroll() {
        if (container.scrollWidth > container.clientWidth) {
            staffMatrix.classList.add('has-scroll');
        } else {
            staffMatrix.classList.remove('has-scroll');
        }
    }

    // Initial check
    checkScroll();

    // Check on resize
    window.addEventListener('resize', checkScroll);

    // Handle scroll position for sticky header
    container.addEventListener('scroll', () => {
        const header = container.querySelector('.staff-rating-header');
        if (header) {
            header.style.transform = `translateX(${container.scrollLeft}px)`;
        }
    });

    // Add touch scroll hint timeout
    let scrollHintTimeout;
    function hideScrollHint() {
        const hint = staffMatrix.querySelector('.scroll-hint');
        if (hint) {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 300);
        }
    }

    container.addEventListener('scroll', () => {
        clearTimeout(scrollHintTimeout);
        scrollHintTimeout = setTimeout(hideScrollHint, 1500);
    });
}
