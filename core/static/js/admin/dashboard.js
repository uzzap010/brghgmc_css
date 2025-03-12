document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard JS loaded successfully');
    
    // Initialize the pie charts
    if (window.chartData && document.getElementById('charterPieChart')) {
        // Charter Awareness Pie Chart
        const ctxCharter = document.getElementById('charterPieChart').getContext('2d');
        new Chart(ctxCharter, {
            type: 'pie',
            data: {
                labels: window.chartData.charter.labels,
                datasets: [{
                    data: window.chartData.charter.values,
                    backgroundColor: [
                        '#00ff7b',  // Primary color
                        '#00cc69',  // Secondary color
                        '#4dabf7',  // Business color
                        '#fab005'   // Employee color
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                family: "'Segoe UI', Roboto, Arial, sans-serif",
                                size: 12
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Survey Distribution Pie Chart
        const ctxSurvey = document.getElementById('surveyPieChart').getContext('2d');
        new Chart(ctxSurvey, {
            type: 'pie',
            data: {
                labels: window.chartData.survey.labels,
                datasets: [{
                    data: window.chartData.survey.values,
                    backgroundColor: [
                        '#00ff7b',  // Patient color
                        '#ff6b6b',  // Relatives color
                        '#4dabf7',  // Business color
                        '#fab005'   // Employee color
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                family: "'Segoe UI', Roboto, Arial, sans-serif",
                                size: 12
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Monthly Trends Line Chart
        const ctxMonthly = document.getElementById('monthlyTrendsChart').getContext('2d');
        new Chart(ctxMonthly, {
            type: 'line',
            data: {
                labels: window.chartData.monthly.labels,
                datasets: [
                    {
                        label: 'Patient',
                        data: window.chartData.monthly.datasets[0].data,
                        borderColor: '#00ff7b',
                        backgroundColor: 'rgba(0, 255, 123, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Relatives',
                        data: window.chartData.monthly.datasets[1].data,
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Business',
                        data: window.chartData.monthly.datasets[2].data,
                        borderColor: '#4dabf7',
                        backgroundColor: 'rgba(77, 171, 247, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Employee',
                        data: window.chartData.monthly.datasets[3].data,
                        borderColor: '#fab005',
                        backgroundColor: 'rgba(250, 176, 5, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'center',
                        labels: {
                            boxWidth: 15,
                            usePointStyle: true,
                            font: {
                                family: "'Segoe UI', Roboto, Arial, sans-serif",
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} responses`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
    
    // Real-time date and time update
    function updateDateTime() {
        const now = new Date();
        
        // Update date
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateElement = document.querySelector('.current-date');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
        }
        
        // Update time
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            hour12: true 
        };
        const timeElement = document.querySelector('.current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
        }
    }

    // Initial update
    updateDateTime();
    
    // Update every second
    setInterval(updateDateTime, 1000);

    // Initialize dropdowns
    const monthFilter = document.querySelector('.month-filter');
    const userDropdown = document.querySelector('.user-menu .dropdown');
    const userDropdownToggle = userDropdown ? userDropdown.querySelector('.dropdown-toggle') : null;
    const notificationToggle = document.querySelector('.notification-toggle');
    const notificationDropdown = document.querySelector('.notification-dropdown');

    // Month filter dropdown toggle
    if (monthFilter) {
        const monthDropdownToggle = monthFilter.querySelector('.month-dropdown-toggle');
        if (monthDropdownToggle) {
            monthDropdownToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                monthFilter.classList.toggle('active');
                if (notificationDropdown && notificationDropdown.classList.contains('active')) {
                    notificationDropdown.classList.remove('active');
                }
                if (userDropdown && userDropdown.classList.contains('active')) {
                    userDropdown.classList.remove('active');
                }
            });
        }
    }

    // Toggle notification dropdown
    if (notificationToggle && notificationDropdown) {
        notificationToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
            if (userDropdown && userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
            if (monthFilter && monthFilter.classList.contains('active')) {
                monthFilter.classList.remove('active');
            }
        });
    }

    // Toggle user dropdown
    if (userDropdownToggle && userDropdown) {
        userDropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
            if (notificationDropdown && notificationDropdown.classList.contains('active')) {
                notificationDropdown.classList.remove('active');
            }
            if (monthFilter && monthFilter.classList.contains('active')) {
                monthFilter.classList.remove('active');
            }
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (monthFilter && !monthFilter.contains(e.target)) {
            monthFilter.classList.remove('active');
        }
        if (notificationDropdown && !notificationToggle.contains(e.target) && !notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.remove('active');
        }
        if (userDropdown && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });

    // Close dropdowns when pressing escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (monthFilter) {
                monthFilter.classList.remove('active');
            }
            if (notificationDropdown) {
                notificationDropdown.classList.remove('active');
            }
            if (userDropdown) {
                userDropdown.classList.remove('active');
            }
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
            if (monthFilter) {
                monthFilter.classList.remove('active');
            }
        });
    });

    // Initialize tooltips for action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        const title = btn.getAttribute('title');
        if (title) {
            btn.addEventListener('mouseenter', function(e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = title;
                document.body.appendChild(tooltip);

                const rect = btn.getBoundingClientRect();
                tooltip.style.top = rect.bottom + 5 + 'px';
                tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
            });

            btn.addEventListener('mouseleave', function() {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        }
    });

    // Real-time updates
    function updateDashboard() {
        fetch('/custom-admin/dashboard/updates/')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Update notification badge
                    const notificationBadge = document.querySelector('.notification-badge');
                    const notificationCount = document.querySelector('.notification-count');
                    
                    if (data.new_feedback_count > 0) {
                        if (!notificationBadge) {
                            const badge = document.createElement('span');
                            badge.className = 'notification-badge';
                            badge.textContent = data.new_feedback_count;
                            document.querySelector('.notification-toggle').appendChild(badge);
                        } else {
                            notificationBadge.textContent = data.new_feedback_count;
                        }
                        
                        if (notificationCount) {
                            notificationCount.textContent = `${data.new_feedback_count} new`;
                        }
                    } else {
                        if (notificationBadge) {
                            notificationBadge.remove();
                        }
                        if (notificationCount) {
                            notificationCount.textContent = '0 new';
                        }
                    }

                    // Update notification list
                    const notificationList = document.querySelector('.notification-list');
                    if (notificationList) {
                        if (data.feedback_data.length > 0) {
                            notificationList.innerHTML = data.feedback_data.map(feedback => `
                                <div class="notification-item">
                                    <i class="fas fa-comment-dots"></i>
                                    <div class="notification-content">
                                        <p>New feedback from ${feedback.office}</p>
                                        <span class="notification-time">${feedback.timesince} ago</span>
                                    </div>
                                </div>
                            `).join('');
                        } else {
                            notificationList.innerHTML = `
                                <div class="notification-item empty">
                                    <p>No new feedback</p>
                                </div>
                            `;
                        }
                    }

                    // Update recent activity
                    const activityList = document.querySelector('.activity-list');
                    if (activityList && data.survey_data.length > 0) {
                        activityList.innerHTML = data.survey_data.map(survey => {
                            let icon, text;
                            switch(survey.type) {
                                case 'pasyente':
                                    icon = 'fa-hospital-user';
                                    text = 'Patient Survey Response';
                                    break;
                                case 'kasama':
                                    icon = 'fa-people-arrows';
                                    text = 'Relatives Survey Response';
                                    break;
                                case 'negosyo':
                                    icon = 'fa-briefcase-medical';
                                    text = 'Business Survey Response';
                                    break;
                                default:
                                    icon = 'fa-user-doctor';
                                    text = 'Employee Survey Response';
                            }
                            return `
                                <div class="activity-item">
                                    <i class="fas ${icon}"></i>
                                    <div class="activity-info">
                                        <p>${text}</p>
                                        <span>${survey.timesince} ago</span>
                                    </div>
                                </div>
                            `;
                        }).join('');
                    }
                }
            })
            .catch(error => console.error('Error updating dashboard:', error));
    }

    // Update every 30 seconds
    setInterval(updateDashboard, 30000);

    // Initial update
    updateDashboard();
}); 