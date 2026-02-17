document.addEventListener('DOMContentLoaded', () => {
    initializeEnrollmentForm();
    initializeFAQ();
});

function initializeEnrollmentForm() {
    const form = document.getElementById('enrollment-form');
    
    if (!form) return;
    
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            validateEmail(emailInput.value);
        });
    }
 
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', () => {
            validatePhone(phoneInput.value);
        });
    }
}

function validateForm() {
    let isValid = true;
    const requiredFields = [
        'full-name',
        'email',
        'phone',
        'country',
        'english-level',
        'goal',
        'availability',
        'payment-preference'
    ];

    document.querySelectorAll('.error-message').forEach(el => el.remove());

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            showError(field, 'This field is required');
            isValid = false;
        }
    });

    const emailField = document.getElementById('email');
    if (emailField && emailField.value && !validateEmail(emailField.value)) {
        showError(emailField, 'Please enter a valid email address');
        isValid = false;
    }

    const phoneField = document.getElementById('phone');
    if (phoneField && phoneField.value && !validatePhone(phoneField.value)) {
        showError(phoneField, 'Please enter a valid phone number');
        isValid = false;
    }
    
    const agreeTerms = document.getElementById('agree-terms');
    if (agreeTerms && !agreeTerms.checked) {
        showError(agreeTerms.parentElement, 'You must agree to the terms and conditions');
        isValid = false;
    }
    
    return isValid;
}


function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


function validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
}

function showError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'var(--error-red)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    
    if (field.nextElementSibling && field.nextElementSibling.classList.contains('error-message')) {
        field.nextElementSibling.remove();
    }
    
    field.parentElement.appendChild(errorDiv);
    field.style.borderColor = 'var(--error-red)';
}

function submitForm() {
    const form = document.getElementById('enrollment-form');
    const submitButton = form.querySelector('.submit-button');
    const successMessage = document.getElementById('form-success');
    const errorMessage = document.getElementById('form-error');
    
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    const formData = {
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        country: document.getElementById('country').value,
        englishLevel: document.getElementById('english-level').value,
        goal: document.getElementById('goal').value,
        availability: document.getElementById('availability').value,
        paymentPreference: document.getElementById('payment-preference').value,
        message: document.getElementById('message').value,
        subscribeNewsletter: document.getElementById('subscribe-newsletter').checked,
        timestamp: new Date().toISOString()
    };
    
    setTimeout(() => {
  
        saveEnrollmentData(formData);

        form.style.display = 'none';
        successMessage.classList.remove('hidden');

        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        console.log('Form submitted successfully:', formData);
    }, 1500);
}


function saveEnrollmentData(formData) {
    const enrollments = loadFromStorage('enrollments') || [];
    enrollments.push(formData);
    saveToStorage('enrollments', enrollments);

    saveToStorage('latestEnrollment', formData);

    const funnelData = loadFromStorage('enrollmentFunnel') || {
        visits: 0,
        formStarts: 0,
        submissions: 0
    };
    funnelData.submissions++;
    saveToStorage('enrollmentFunnel', funnelData);
}

function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    if (faqQuestions.length === 0) return;
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const wasActive = faqItem.classList.contains('active');
    
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            if (!wasActive) {
                faqItem.classList.add('active');

                trackFAQClick(question.textContent.trim());
            }
        });
    });
}

function trackFAQClick(question) {
    const faqClicks = loadFromStorage('faqClicks') || {};
    const questionKey = question.substring(0, 50); 
    
    faqClicks[questionKey] = (faqClicks[questionKey] || 0) + 1;
    faqClicks.lastClick = new Date().toISOString();
    
    saveToStorage('faqClicks', faqClicks);
}

(function trackFormEngagement() {
    const form = document.getElementById('enrollment-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    let hasStartedForm = false;
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (!hasStartedForm) {
                hasStartedForm = true;
                
                const funnelData = loadFromStorage('enrollmentFunnel') || {
                    visits: 0,
                    formStarts: 0,
                    submissions: 0
                };
                funnelData.formStarts++;
                saveToStorage('enrollmentFunnel', funnelData);
                
                console.log('User started enrollment form');
            }
        });
    });
})();


(function autoSaveForm() {
    const form = document.getElementById('enrollment-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            saveFormProgress();
        });
    });

    loadFormProgress();
})();


function saveFormProgress() {
    const form = document.getElementById('enrollment-form');
    if (!form) return;
    
    const formData = {
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        country: document.getElementById('country').value,
        englishLevel: document.getElementById('english-level').value,
        goal: document.getElementById('goal').value,
        availability: document.getElementById('availability').value,
        paymentPreference: document.getElementById('payment-preference').value,
        message: document.getElementById('message').value,
        savedAt: new Date().toISOString()
    };
    
    saveToStorage('formProgress', formData);
}


function loadFormProgress() {
    const savedData = loadFromStorage('formProgress');
    if (!savedData) return;
 
    const savedTime = new Date(savedData.savedAt);
    const now = new Date();
    const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
   
        localStorage.removeItem('formProgress');
        return;
    }

    if (savedData.fullName) document.getElementById('full-name').value = savedData.fullName;
    if (savedData.email) document.getElementById('email').value = savedData.email;
    if (savedData.phone) document.getElementById('phone').value = savedData.phone;
    if (savedData.country) document.getElementById('country').value = savedData.country;
    if (savedData.englishLevel) document.getElementById('english-level').value = savedData.englishLevel;
    if (savedData.goal) document.getElementById('goal').value = savedData.goal;
    if (savedData.availability) document.getElementById('availability').value = savedData.availability;
    if (savedData.paymentPreference) document.getElementById('payment-preference').value = savedData.paymentPreference;
    if (savedData.message) document.getElementById('message').value = savedData.message;
    
    console.log('Form progress restored from previous session');
}
