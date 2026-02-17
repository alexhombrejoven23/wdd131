document.addEventListener('DOMContentLoaded', () => {
    initializeToolTabs();
    initializeConversationSimulator();
    initializeWritingAssistant();
    initializeVocabularyQuiz();
});

function initializeToolTabs() {
    const toolTabs = document.querySelectorAll('.tool-tab');
    
    toolTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const toolName = tab.getAttribute('data-tool');
            switchTool(toolName);

            toolTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            saveToStorage('selectedTool', toolName);
        });
    });

    const savedTool = loadFromStorage('selectedTool');
    if (savedTool) {
        const savedTab = document.querySelector(`[data-tool="${savedTool}"]`);
        if (savedTab) {
            savedTab.click();
        }
    }
}


function switchTool(toolName) {
    const allTools = document.querySelectorAll('.tool-content');
    allTools.forEach(tool => tool.classList.remove('active'));
    
    const selectedTool = document.getElementById(`${toolName}-tool`);
    if (selectedTool) {
        selectedTool.classList.add('active');
    }
}


function initializeConversationSimulator() {
    const startButton = document.getElementById('start-conversation');
    const sendButton = document.getElementById('send-message');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const scenarioSelect = document.getElementById('scenario');
    const messageCountElement = document.getElementById('message-count');
    const conversationLevelElement = document.getElementById('conversation-level');
    
    if (!startButton) return;
    
    let conversationActive = false;
    let messageCount = 0;
    let currentScenario = '';
    
    const scenarios = {
        restaurant: {
            greeting: `Welcome to our restaurant! I'll be your server today. Have you had a chance to look at our menu?`,
            responses: [
                `Great choice! Would you like that with fries or a salad?`,
                `Excellent! And what would you like to drink with that?`,
                `Perfect! Your order will be ready in about 15 minutes. Anything else I can get for you?`,
                `Thank you! I'll bring that right out for you.`
            ]
        },
        shopping: {
            greeting: `Hello! Welcome to our store. Are you looking for something specific today?`,
            responses: [
                `We have a great selection in that department. What size are you looking for?`,
                `That's a popular item! Let me check if we have it in stock.`,
                `This one is on sale today! Would you like to try it on?`,
                `Great! I'll ring that up for you. Will that be cash or card?`
            ]
        },
        directions: {
            greeting: `Hello! You look a bit lost. Can I help you find something?`,
            responses: [
                `Ah yes, that's just two blocks down this street. Do you see the tall building ahead?`,
                `You'll want to turn left at the next intersection, then it's on your right.`,
                `It's about a 10-minute walk from here. Would you like me to draw you a map?`,
                `You're welcome! Have a great day!`
            ]
        },
        interview: {
            greeting: `Good morning! Thank you for coming in today. Please, have a seat. Can you tell me a bit about yourself?`,
            responses: [
                `That's impressive experience. What would you say is your greatest strength?`,
                `Interesting! Can you give me an example of how you've demonstrated that skill?`,
                `And what interests you most about this position at our company?`,
                `Thank you for sharing that. Do you have any questions for me about the role?`
            ]
        },
        meeting: {
            greeting: `Good morning, everyone. Let's get started with today's meeting. First on the agenda is the quarterly review. Any thoughts?`,
            responses: [
                `Good point. How do you think we should address that?`,
                `I agree. Let's schedule a follow-up meeting to discuss this in more detail.`,
                `Excellent suggestion! Can you take the lead on implementing that?`,
                `Thanks everyone for your input. I'll send out the meeting notes this afternoon.`
            ]
        }
    };
    
    startButton.addEventListener('click', () => {
        currentScenario = scenarioSelect.value;
        conversationActive = true;
        messageCount = 0;

        chatMessages.innerHTML = '';

        addAIMessage(scenarios[currentScenario].greeting);

        userInput.disabled = false;
        sendButton.disabled = false;
        startButton.style.display = 'none';
        
        updateConversationStats();
    });
    
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !userInput.disabled) {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message || !conversationActive) return;

        addUserMessage(message);
        messageCount++;

        userInput.value = '';

        setTimeout(() => {
            const responses = scenarios[currentScenario].responses;
            const responseIndex = Math.min(messageCount - 1, responses.length - 1);
            addAIMessage(responses[responseIndex]);
            
            updateConversationStats();

            if (messageCount >= 4) {
                endConversation();
            }
        }, 1000);
    }
    
    function addAIMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message';
        messageDiv.innerHTML = `<strong>AI Assistant:</strong> ${text}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';
        messageDiv.innerHTML = `<strong>You:</strong> ${text}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function updateConversationStats() {
        messageCountElement.textContent = messageCount;

        if (messageCount <= 2) {
            conversationLevelElement.textContent = 'Beginner';
        } else if (messageCount <= 5) {
            conversationLevelElement.textContent = 'Intermediate';
        } else {
            conversationLevelElement.textContent = 'Advanced';
        }
    }
    
    function endConversation() {
        conversationActive = false;
        userInput.disabled = true;
        sendButton.disabled = true;
        
        addAIMessage(`Great practice! You completed this ${currentScenario} scenario. Click "Start Conversation" to try again or choose a different scenario.`);
        
        startButton.style.display = 'block';

        saveConversationPractice(currentScenario, messageCount);
    }
    
    function saveConversationPractice(scenario, messages) {
        const practiceData = loadFromStorage('conversationPractice') || {};
        
        if (!practiceData[scenario]) {
            practiceData[scenario] = { count: 0, totalMessages: 0 };
        }
        
        practiceData[scenario].count++;
        practiceData[scenario].totalMessages += messages;
        practiceData.lastPractice = new Date().toISOString();
        
        saveToStorage('conversationPractice', practiceData);
    }
}

function initializeWritingAssistant() {
    const analyzeButton = document.getElementById('analyze-writing');
    const writingInput = document.getElementById('writing-input');
    const feedbackContainer = document.getElementById('feedback-container');
    
    if (!analyzeButton) return;
    
    analyzeButton.addEventListener('click', () => {
        const text = writingInput.value.trim();
        
        if (!text) {
            showFeedback([{
                type: 'Error',
                message: 'Please enter some text to analyze.'
            }]);
            return;
        }

        const feedback = analyzeText(text);
        showFeedback(feedback);

        saveWritingPractice(text.length);
    });
    
    function analyzeText(text) {
        const feedback = [];
        const words = text.split(/\s+/);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

        feedback.push({
            type: 'Length Analysis',
            message: `Your text contains ${words.length} words and ${sentences.length} sentences.`
        });

        if (text.includes('their are') || text.includes('there is a lot of people')) {
            feedback.push({
                type: 'Grammar Error',
                original: text.includes('their are') ? 'their are' : 'there is a lot of people',
                suggestion: text.includes('their are') ? 'there are' : 'there are a lot of people',
                explanation: 'Common confusion between "their/there" or subject-verb agreement.'
            });
        }
        
        if (text.includes('alot')) {
            feedback.push({
                type: 'Spelling Error',
                original: 'alot',
                suggestion: 'a lot',
                explanation: '"A lot" should be written as two words.'
            });
        }

        const shortSentences = sentences.filter(s => s.trim().split(/\s+/).length < 5);
        if (shortSentences.length > sentences.length / 2) {
            feedback.push({
                type: 'Style Suggestion',
                message: 'Consider varying your sentence length. Many of your sentences are quite short. Try combining some for better flow.'
            });
        }
        
        const wordFrequency = {};
        words.forEach(word => {
            const lowerWord = word.toLowerCase().replace(/[^a-z]/g, '');
            if (lowerWord.length > 4) {
                wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1;
            }
        });
        
        const repetitiveWords = Object.entries(wordFrequency)
            .filter(([word, count]) => count > 3)
            .map(([word]) => word);
        
        if (repetitiveWords.length > 0) {
            feedback.push({
                type: 'Vocabulary Suggestion',
                message: `You've used these words frequently: ${repetitiveWords.join(', ')}. Consider using synonyms for variety.`
            });
        }

        if (words.length > 50 && sentences.length > 5) {
            feedback.push({
                type: 'Great Work!',
                message: 'Good job writing a substantial piece! Your ideas are clearly expressed.'
            });
        }
        
        return feedback;
    }
    
    function showFeedback(feedbackArray) {
        feedbackContainer.innerHTML = '<h3>Feedback</h3>';
        
        feedbackArray.forEach(item => {
            const feedbackItem = document.createElement('div');
            feedbackItem.className = 'feedback-item';
            
            let content = `<div class="feedback-type">${item.type}</div>`;
            
            if (item.original) {
                content += `<span class="feedback-original">${item.original}</span>`;
            }
            
            if (item.suggestion) {
                content += `<span class="feedback-suggestion">→ ${item.suggestion}</span>`;
            }
            
            if (item.explanation) {
                content += `<p class="feedback-explanation">${item.explanation}</p>`;
            } else if (item.message) {
                content += `<p class="feedback-explanation">${item.message}</p>`;
            }
            
            feedbackItem.innerHTML = content;
            feedbackContainer.appendChild(feedbackItem);
        });
    }
    
    function saveWritingPractice(wordCount) {
        const practiceData = loadFromStorage('writingPractice') || {
            sessions: 0,
            totalWords: 0
        };
        
        practiceData.sessions++;
        practiceData.totalWords += wordCount;
        practiceData.lastSession = new Date().toISOString();
        
        saveToStorage('writingPractice', practiceData);
    }
}


function initializeVocabularyQuiz() {
    const startQuizButton = document.getElementById('start-quiz');
    const quizContainer = document.getElementById('quiz-container');
    const quizResults = document.getElementById('quiz-results');
    const retakeButton = document.getElementById('retake-quiz');
    
    if (!startQuizButton) return;
    
    let currentQuestion = 0;
    let score = 0;
    let quizQuestions = [];
    
    const questionBank = {
        beginner: {
            general: [
                { question: 'What is a synonym for "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correct: 1 },
                { question: 'What does "big" mean?', options: ['Small', 'Large', 'Fast', 'Slow'], correct: 1 },
                { question: 'Choose the correct article: "I saw ___ cat."', options: ['a', 'an', 'the', 'some'], correct: 0 },
                { question: 'What is the past tense of "go"?', options: ['goed', 'went', 'gone', 'going'], correct: 1 },
                { question: 'Which word means "not expensive"?', options: ['Costly', 'Cheap', 'Valuable', 'Precious'], correct: 1 }
            ],
            business: [
                { question: 'What do we call money paid for work?', options: ['Salary', 'Bill', 'Receipt', 'Tax'], correct: 0 },
                { question: 'A person who buys products is a:', options: ['Seller', 'Customer', 'Manager', 'Employee'], correct: 1 },
                { question: 'To "schedule" a meeting means to:', options: ['Cancel it', 'Plan it', 'Attend it', 'Miss it'], correct: 1 },
                { question: 'What is a "deadline"?', options: ['A meeting', 'A due date', 'A salary', 'A vacation'], correct: 1 },
                { question: '"Profit" means:', options: ['Loss', 'Gain', 'Cost', 'Debt'], correct: 1 }
            ],
            travel: [
                { question: 'Where do you check in for a flight?', options: ['Gate', 'Airport', 'Runway', 'Cockpit'], correct: 1 },
                { question: 'A place to stay overnight is called a:', options: ['Restaurant', 'Museum', 'Hotel', 'Park'], correct: 2 },
                { question: 'To "board" a plane means to:', options: ['Buy a ticket', 'Get on', 'Get off', 'Cancel'], correct: 1 },
                { question: 'Luggage is another word for:', options: ['Passport', 'Ticket', 'Bags', 'Seat'], correct: 2 },
                { question: 'A round-trip ticket includes:', options: ['One way only', 'Going and returning', 'First class', 'Extra bags'], correct: 1 }
            ],
            academic: [
                { question: 'To "study" means to:', options: ['Play', 'Learn', 'Sleep', 'Eat'], correct: 1 },
                { question: 'A "course" is a:', options: ['Book', 'Class', 'Test', 'Grade'], correct: 1 },
                { question: 'What is a "library"?', options: ['A place for books', 'A classroom', 'A cafeteria', 'A gym'], correct: 0 },
                { question: 'To "graduate" means to:', options: ['Start school', 'Fail', 'Complete', 'Skip'], correct: 2 },
                { question: 'A "textbook" is used for:', options: ['Cooking', 'Studying', 'Playing', 'Sleeping'], correct: 1 }
            ]
        },
        intermediate: {
            general: [
                { question: 'What is an antonym of "increase"?', options: ['Decrease', 'Improve', 'Enhance', 'Expand'], correct: 0 },
                { question: 'Which word means "to make something better"?', options: ['Worsen', 'Improve', 'Ignore', 'Destroy'], correct: 1 },
                { question: 'Choose the correct phrase: "I am _____ learning English."', options: ['interested to', 'interested in', 'interesting in', 'interesting to'], correct: 1 },
                { question: '"Accomplish" is similar to:', options: ['Fail', 'Achieve', 'Attempt', 'Begin'], correct: 1 },
                { question: 'What does "persuade" mean?', options: ['To convince', 'To confuse', 'To refuse', 'To question'], correct: 0 }
            ],
            business: [
                { question: 'A "stakeholder" is someone who:', options: ['Has no interest', 'Has an interest in the business', 'Only invests', 'Only works'], correct: 1 },
                { question: '"Negotiate" means to:', options: ['Argue', 'Discuss terms', 'Refuse', 'Accept immediately'], correct: 1 },
                { question: 'What is "market research"?', options: ['Selling products', 'Studying the market', 'Making products', 'Advertising'], correct: 1 },
                { question: '"Revenue" refers to:', options: ['Expenses', 'Income', 'Debts', 'Employees'], correct: 1 },
                { question: 'To "implement" a plan means to:', options: ['Cancel it', 'Discuss it', 'Execute it', 'Ignore it'], correct: 2 }
            ],
            travel: [
                { question: 'An "itinerary" is a:', options: ['Ticket', 'Travel plan', 'Passport', 'Visa'], correct: 1 },
                { question: 'To "embark" means to:', options: ['Cancel travel', 'Begin a journey', 'Return home', 'Get lost'], correct: 1 },
                { question: 'A "layover" is:', options: ['Direct flight', 'Stop between flights', 'Cancellation', 'Upgrade'], correct: 1 },
                { question: '"Accommodation" refers to:', options: ['Transportation', 'Food', 'Lodging', 'Activities'], correct: 2 },
                { question: 'To "venture" somewhere means to:', options: ['Stay home', 'Go cautiously', 'Avoid', 'Return'], correct: 1 }
            ],
            academic: [
                { question: 'A "thesis" is a:', options: ['Test', 'Main argument', 'Textbook', 'Teacher'], correct: 1 },
                { question: '"Analyze" means to:', options: ['Memorize', 'Examine closely', 'Ignore', 'Copy'], correct: 1 },
                { question: 'What is "plagiarism"?', options: ['Original work', 'Copying without credit', 'Good writing', 'Research'], correct: 1 },
                { question: '"Comprehend" is similar to:', options: ['Misunderstand', 'Understand', 'Forget', 'Ignore'], correct: 1 },
                { question: 'A "hypothesis" is a:', options: ['Proven fact', 'Educated guess', 'Final answer', 'Random thought'], correct: 1 }
            ]
        },
        advanced: {
            general: [
                { question: 'What does "ubiquitous" mean?', options: ['Rare', 'Everywhere', 'Ancient', 'Modern'], correct: 1 },
                { question: '"Eloquent" describes someone who:', options: ['Is silent', 'Speaks well', 'Mumbles', 'Whispers'], correct: 1 },
                { question: 'To "mitigate" means to:', options: ['Increase', 'Lessen', 'Ignore', 'Create'], correct: 1 },
                { question: '"Ambiguous" means:', options: ['Clear', 'Uncertain', 'Simple', 'Direct'], correct: 1 },
                { question: 'What is "pragmatic"?', options: ['Impractical', 'Practical', 'Emotional', 'Theoretical'], correct: 1 }
            ],
            business: [
                { question: '"Synergy" refers to:', options: ['Competition', 'Conflict', 'Combined effect', 'Individual work'], correct: 2 },
                { question: 'A "paradigm shift" is a:', options: ['Small change', 'Fundamental change', 'No change', 'Temporary change'], correct: 1 },
                { question: '"Due diligence" means:', options: ['Being lazy', 'Thorough investigation', 'Quick decision', 'Guessing'], correct: 1 },
                { question: 'To "leverage" an asset means to:', options: ['Sell it', 'Use it effectively', 'Ignore it', 'Hide it'], correct: 1 },
                { question: '"ROI" stands for:', options: ['Rate of Interest', 'Return on Investment', 'Risk of Investment', 'Rule of Income'], correct: 1 }
            ],
            travel: [
                { question: 'An "expatriate" is someone who:', options: ['Lives in their birth country', 'Lives abroad', 'Never travels', 'Only vacations'], correct: 1 },
                { question: '"Traverse" means to:', options: ['Stay still', 'Cross over', 'Return', 'Circle'], correct: 1 },
                { question: 'A "wanderlust" is:', options: ['Fear of travel', 'Desire to travel', 'Travel sickness', 'Lost luggage'], correct: 1 },
                { question: '"Indigenous" means:', options: ['Foreign', 'Native', 'Modern', 'Temporary'], correct: 1 },
                { question: 'To "sojourn" means to:', options: ['Rush through', 'Stay temporarily', 'Avoid', 'Ignore'], correct: 1 }
            ],
            academic: [
                { question: '"Empirical" evidence is based on:', options: ['Theory', 'Observation', 'Assumption', 'Belief'], correct: 1 },
                { question: 'To "postulate" means to:', options: ['Disprove', 'Suggest as true', 'Ignore', 'Question'], correct: 1 },
                { question: '"Methodology" refers to:', options: ['Results', 'Methods used', 'Conclusion', 'Introduction'], correct: 1 },
                { question: 'A "dissertation" is a:', options: ['Short essay', 'Long research paper', 'Test', 'Lecture'], correct: 1 },
                { question: '"Extrapolate" means to:', options: ['Summarize', 'Extend beyond data', 'Memorize', 'Delete'], correct: 1 }
            ]
        }
    };
    
    startQuizButton.addEventListener('click', () => {
        const level = document.getElementById('quiz-level').value;
        const category = document.getElementById('quiz-category').value;
        
        quizQuestions = questionBank[level][category];
        currentQuestion = 0;
        score = 0;
        
        document.querySelector('.quiz-settings').style.display = 'none';
        quizContainer.classList.remove('hidden');
        quizResults.classList.add('hidden');
        
        showQuestion();
    });
    
    retakeButton.addEventListener('click', () => {
        quizResults.classList.add('hidden');
        document.querySelector('.quiz-settings').style.display = 'grid';
    });
    
    function showQuestion() {
        if (currentQuestion >= quizQuestions.length) {
            showResults();
            return;
        }
        
        const question = quizQuestions[currentQuestion];
        
        document.getElementById('current-question').textContent = currentQuestion + 1;
        document.getElementById('total-questions').textContent = quizQuestions.length;
        document.getElementById('question-text').textContent = question.question;
        
        const progressPercent = ((currentQuestion + 1) / quizQuestions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;
        
        const optionsContainer = document.getElementById('answer-options');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'answer-option';
            optionButton.textContent = option;
            optionButton.addEventListener('click', () => selectAnswer(index));
            optionsContainer.appendChild(optionButton);
        });
        
        document.getElementById('quiz-feedback').classList.add('hidden');
    }
    
    function selectAnswer(selectedIndex) {
        const question = quizQuestions[currentQuestion];
        const options = document.querySelectorAll('.answer-option');
        const feedbackElement = document.getElementById('quiz-feedback');

        options.forEach(option => option.style.pointerEvents = 'none');

        options[question.correct].classList.add('correct');
        
        if (selectedIndex === question.correct) {
            score++;
            feedbackElement.textContent = 'Correct! Well done!';
            feedbackElement.className = 'quiz-feedback correct';
        } else {
            options[selectedIndex].classList.add('incorrect');
            feedbackElement.textContent = `Incorrect. The correct answer is: ${question.options[question.correct]}`;
            feedbackElement.className = 'quiz-feedback incorrect';
        }
        
        feedbackElement.classList.remove('hidden');

        setTimeout(() => {
            currentQuestion++;
            showQuestion();
        }, 2000);
    }
    
    function showResults() {
        quizContainer.classList.add('hidden');
        quizResults.classList.remove('hidden');
        
        const percentage = Math.round((score / quizQuestions.length) * 100);
        
        document.getElementById('quiz-score').textContent = `${score}/${quizQuestions.length}`;
        document.getElementById('quiz-percentage').textContent = `${percentage}%`;

        saveQuizResults(score, quizQuestions.length);
    }
    
    function saveQuizResults(score, total) {
        const quizData = loadFromStorage('quizResults') || {
            attempts: 0,
            totalScore: 0,
            totalQuestions: 0
        };
        
        quizData.attempts++;
        quizData.totalScore += score;
        quizData.totalQuestions += total;
        quizData.lastAttempt = new Date().toISOString();
        
        saveToStorage('quizResults', quizData);
    }
}