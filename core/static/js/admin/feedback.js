document.addEventListener('DOMContentLoaded', function() {
    // Month filter functionality
    const monthFilter = document.querySelector('.month-filter');
    const monthDropdownToggle = monthFilter.querySelector('.month-dropdown-toggle');

    // Toggle month dropdown
    monthDropdownToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        monthFilter.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!monthFilter.contains(e.target)) {
            monthFilter.classList.remove('active');
        }
    });

    // Close dropdown when pressing escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            monthFilter.classList.remove('active');
        }
    });

    // Handle month item clicks
    const monthItems = document.querySelectorAll('.month-item');
    monthItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.getAttribute('href')) {
                e.preventDefault();
                return;
            }
            monthFilter.classList.remove('active');
        });
    });

    // User dropdown functionality
    const userDropdown = document.querySelector('.user-menu .dropdown');
    const userDropdownToggle = userDropdown.querySelector('.dropdown-toggle');

    userDropdownToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (!userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });

    // Action dropdowns for feedback items
    const actionDropdowns = document.querySelectorAll('.action-dropdown');
    actionDropdowns.forEach(dropdown => {
        const toggleBtn = dropdown.querySelector('.btn-more-actions');
        const menu = dropdown.querySelector('.dropdown-menu');

        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            actionDropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.querySelector('.dropdown-menu').style.display = 'none';
                }
            });
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
    });

    // Close action dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        actionDropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.querySelector('.dropdown-menu').style.display = 'none';
            }
        });
    });

    // View Details button click handler
    window.viewFeedbackDetails = function(id) {
        // TODO: Implement feedback details view
        console.log('Viewing feedback details for ID:', id);
    };

    // Handle feedback item hover effects
    const feedbackItems = document.querySelectorAll('.feedback-item');
    feedbackItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });

    // Export functionality
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.textContent.trim() === 'Export') {
                e.preventDefault();
                // TODO: Implement export functionality
                console.log('Export clicked');
            } else if (this.textContent.trim() === 'Print') {
                e.preventDefault();
                // TODO: Implement print functionality
                console.log('Print clicked');
            }
        });
    });
}); 