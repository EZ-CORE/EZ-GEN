// Global variables
let serverStatus = false;
let firebaseStatus = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkServerStatus();
    setupEventListeners();
    loadSavedData();
});

// Check server and Firebase status
async function checkServerStatus() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        
        serverStatus = data.status === 'ok';
        firebaseStatus = data.firebase === true;
        
        updateStatusDisplay();
    } catch (error) {
        console.error('Failed to check server status:', error);
        serverStatus = false;
        firebaseStatus = false;
        updateStatusDisplay();
    }
}

// Update status indicators
function updateStatusDisplay() {
    const serverStatusEl = document.getElementById('server-status');
    const firebaseStatusEl = document.getElementById('firebase-status');
    
    // Server status
    const serverDot = serverStatusEl.querySelector('.status-dot');
    const serverText = serverStatusEl.querySelector('.status-text');
    
    if (serverStatus) {
        serverDot.className = 'status-dot online';
        serverText.textContent = 'Server Online';
    } else {
        serverDot.className = 'status-dot offline';
        serverText.textContent = 'Server Offline';
    }
    
    // Firebase status
    const firebaseDot = firebaseStatusEl.querySelector('.status-dot');
    const firebaseText = firebaseStatusEl.querySelector('.status-text');
    
    if (firebaseStatus) {
        firebaseDot.className = 'status-dot online';
        firebaseText.textContent = 'Firebase Connected';
    } else {
        firebaseDot.className = 'status-dot offline';
        firebaseText.textContent = 'Firebase Not Configured';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submissions
    document.getElementById('single-notification-form').addEventListener('submit', handleSingleNotification);
    document.getElementById('bulk-notification-form').addEventListener('submit', handleBulkNotification);
    document.getElementById('topic-notification-form').addEventListener('submit', handleTopicNotification);
    document.getElementById('validate-token-form').addEventListener('submit', handleTokenValidation);
    
    // Auto-save form data
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', saveFormData);
    });
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Handle single device notification
async function handleSingleNotification(event) {
    event.preventDefault();
    
    const formData = {
        token: document.getElementById('device-token').value.trim(),
        title: document.getElementById('notification-title').value,
        body: document.getElementById('notification-body').value,
        imageUrl: document.getElementById('notification-image').value || undefined,
        sound: document.getElementById('notification-sound').value,
        deepLink: document.getElementById('deep-link').value || undefined,
        webLink: document.getElementById('web-link').value || undefined,
        data: {}
    };
    
    // Parse custom data if provided
    const customData = document.getElementById('custom-data').value.trim();
    if (customData) {
        try {
            formData.data = JSON.parse(customData);
        } catch (error) {
            showResult('Invalid JSON in custom data field', 'error');
            return;
        }
    }
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.innerHTML = originalText + ' <span class="loading"></span>';
        submitButton.disabled = true;
        
        const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showResult(`✅ Notification sent successfully!\nMessage ID: ${result.messageId}\nSent at: ${result.sentAt}`, 'success');
        } else {
            showResult(`❌ Failed to send notification:\n${result.error}\n${result.details || ''}`, 'error');
        }
        
    } catch (error) {
        showResult(`❌ Network error:\n${error.message}`, 'error');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Handle bulk notifications
async function handleBulkNotification(event) {
    event.preventDefault();
    
    const tokensText = document.getElementById('bulk-tokens').value.trim();
    const tokens = tokensText.split('\n').map(token => token.trim()).filter(token => token.length > 0);
    
    if (tokens.length === 0) {
        showResult('❌ Please provide at least one FCM token', 'error');
        return;
    }
    
    const formData = {
        tokens: tokens,
        title: document.getElementById('bulk-title').value,
        body: document.getElementById('bulk-body').value,
        imageUrl: document.getElementById('bulk-image').value || undefined,
        sound: document.getElementById('bulk-sound').value
    };
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.innerHTML = originalText + ' <span class="loading"></span>';
        submitButton.disabled = true;
        
        const response = await fetch('/api/send-bulk-notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showResult(`✅ Bulk notifications sent!\nTotal: ${result.totalCount}\nSuccessful: ${result.successCount}\nFailed: ${result.failureCount}`, 'success');
        } else {
            showResult(`❌ Failed to send bulk notifications:\n${result.error}\n${result.details || ''}`, 'error');
        }
        
    } catch (error) {
        showResult(`❌ Network error:\n${error.message}`, 'error');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Handle topic notifications
async function handleTopicNotification(event) {
    event.preventDefault();
    
    const formData = {
        topic: document.getElementById('topic-name').value.trim(),
        title: document.getElementById('topic-title').value,
        body: document.getElementById('topic-body').value,
        imageUrl: document.getElementById('topic-image').value || undefined,
        sound: document.getElementById('topic-sound').value,
        deepLink: document.getElementById('topic-deep-link').value || undefined,
        webLink: document.getElementById('topic-web-link').value || undefined
    };
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.innerHTML = originalText + ' <span class="loading"></span>';
        submitButton.disabled = true;
        
        const response = await fetch('/api/send-topic-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showResult(`✅ Topic notification sent!\nTopic: ${result.topic}\nMessage ID: ${result.messageId}\nSent at: ${result.sentAt}`, 'success');
        } else {
            showResult(`❌ Failed to send topic notification:\n${result.error}\n${result.details || ''}`, 'error');
        }
        
    } catch (error) {
        showResult(`❌ Network error:\n${error.message}`, 'error');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Handle token validation
async function handleTokenValidation(event) {
    event.preventDefault();
    
    const token = document.getElementById('validate-token').value.trim();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.innerHTML = originalText + ' <span class="loading"></span>';
        submitButton.disabled = true;
        
        const response = await fetch('/api/validate-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });
        
        const result = await response.json();
        
        if (result.valid) {
            showResult(`✅ Token is valid!\nToken: ${result.token.substring(0, 50)}...\nChecked at: ${result.checkedAt}`, 'success');
        } else {
            showResult(`❌ Token is invalid!\nError: ${result.error}\nChecked at: ${result.checkedAt}`, 'error');
        }
        
    } catch (error) {
        showResult(`❌ Network error:\n${error.message}`, 'error');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Quick test functions
async function sendQuickTest(type) {
    const token = document.getElementById('device-token').value.trim();
    
    if (!token) {
        alert('⚠️ Please enter a device token in the "Single Device" tab first');
        showTab('single');
        return;
    }
    
    const quickTests = {
        welcome: {
            title: '👋 Welcome to EZ-GEN!',
            body: 'Thanks for installing our app. Get started by exploring the features!',
            deepLink: '/welcome'
        },
        update: {
            title: '🔄 App Update Available',
            body: 'A new version of the app is available with exciting new features!',
            deepLink: '/update'
        },
        reminder: {
            title: '⏰ Don\'t Forget!',
            body: 'You have pending tasks waiting for your attention.',
            deepLink: '/tasks'
        },
        image: {
            title: '🖼️ Check this out!',
            body: 'We have something exciting to show you.',
            imageUrl: 'https://picsum.photos/400/300',
            deepLink: '/gallery'
        },
        weblink: {
            title: '🍰 Check Out Dessert Options!',
            body: 'Discover amazing dessert businesses and sweet treats available now!',
            webLink: 'https://timeless.ezassist.me/?industry=DESSERTS'
            // No deepLink intentionally - this will make the action button more prominent
        },
        // In-App Navigation Notifications (opens specific pages within the app)
        desserts_inapp: {
            title: '🍰 Sweet Dessert Deals!',
            body: 'Check out amazing dessert options in your area!',
            deepLink: 'timeless://industry?category=DESSERTS',
            data: {
                navigationType: 'in-app',
                targetUrl: 'https://timeless.ezassist.me/?industry=DESSERTS',
                industry: 'DESSERTS'
            }
        },
        western_delights: {
            title: '🤠 Western Delights Await!',
            body: 'Explore authentic Western cuisine and delights!',
            deepLink: 'timeless://industry?category=Western%20Delights',
            data: {
                navigationType: 'in-app',
                targetUrl: 'https://timeless.ezassist.me/?industry=Western%20Delights',
                industry: 'Western Delights'
            }
        },
        restaurants_inapp: {
            title: '🍽️ Great Restaurant Finds!',
            body: 'Discover top-rated restaurants near you!',
            deepLink: 'timeless://industry?category=RESTAURANTS',
            data: {
                navigationType: 'in-app',
                targetUrl: 'https://timeless.ezassist.me/?industry=RESTAURANTS',
                industry: 'RESTAURANTS'
            }
        },
        retail_inapp: {
            title: '🛍️ Amazing Retail Stores!',
            body: 'Browse the best retail shopping options!',
            deepLink: 'timeless://industry?category=RETAIL',
            data: {
                navigationType: 'in-app',
                targetUrl: 'https://timeless.ezassist.me/?industry=RETAIL',
                industry: 'RETAIL'
            }
        },
        services_inapp: {
            title: '🔧 Professional Services!',
            body: 'Connect with trusted service providers!',
            deepLink: 'timeless://industry?category=SERVICES',
            data: {
                navigationType: 'in-app',
                targetUrl: 'https://timeless.ezassist.me/?industry=SERVICES',
                industry: 'SERVICES'
            }
        },
        homepage_inapp: {
            title: '🏠 Welcome Home!',
            body: 'Explore all available business categories!',
            deepLink: 'timeless://home',
            data: {
                navigationType: 'in-app',
                targetUrl: 'https://timeless.ezassist.me/',
                industry: 'HOME'
            }
        },
        // Browser navigation (existing)
        restaurants: {
            title: '🍽️ Find Great Restaurants!',
            body: 'Explore top-rated restaurants and dining options in your area!',
            webLink: 'https://timeless.ezassist.me/?industry=RESTAURANTS'
        },
        retail: {
            title: '🛍️ Shop Retail Stores!',
            body: 'Browse amazing retail stores and shopping opportunities!',
            webLink: 'https://timeless.ezassist.me/?industry=RETAIL'
        },
        services: {
            title: '🔧 Professional Services!',
            body: 'Connect with trusted professional service providers!',
            webLink: 'https://timeless.ezassist.me/?industry=SERVICES'
        },
        homepage: {
            title: '🏠 Visit Our Homepage!',
            body: 'Explore all business categories and discover what\'s available!',
            webLink: 'https://timeless.ezassist.me/'
        }
    };
    
    const testData = quickTests[type];
    if (!testData) return;
    
    try {
        const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                ...testData,
                data: { quickTest: true, testType: type }
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showResult(`✅ Quick test "${type}" sent successfully!\nMessage ID: ${result.messageId}`, 'success');
        } else {
            showResult(`❌ Quick test failed:\n${result.error}`, 'error');
        }
        
    } catch (error) {
        showResult(`❌ Network error:\n${error.message}`, 'error');
    }
}

// Show results
function showResult(message, type = 'success') {
    const resultsSection = document.getElementById('results');
    const resultsContent = document.getElementById('results-content');
    
    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${type} fade-in`;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'result-time';
    timeDiv.textContent = new Date().toLocaleString();
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'result-content';
    contentDiv.textContent = message;
    
    resultItem.appendChild(timeDiv);
    resultItem.appendChild(contentDiv);
    
    resultsContent.insertBefore(resultItem, resultsContent.firstChild);
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Remove old results (keep only last 5)
    const allResults = resultsContent.querySelectorAll('.result-item');
    if (allResults.length > 5) {
        for (let i = 5; i < allResults.length; i++) {
            allResults[i].remove();
        }
    }
}

// Save form data to localStorage
function saveFormData() {
    const formData = {};
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.id) {
            formData[input.id] = input.value;
        }
    });
    
    localStorage.setItem('pushNotificationFormData', JSON.stringify(formData));
}

// Load saved form data
function loadSavedData() {
    try {
        const savedData = localStorage.getItem('pushNotificationFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            Object.keys(formData).forEach(key => {
                const input = document.getElementById(key);
                if (input && formData[key]) {
                    input.value = formData[key];
                }
            });
        }
    } catch (error) {
        console.log('No saved form data found');
    }
}

// Refresh status periodically
setInterval(checkServerStatus, 30000); // Check every 30 seconds
