// Enhanced Quiz Application with Authentication and Dashboard
class EduQuizApp {
    constructor() {
        this.currentUser = null;
        this.currentSubject = null;
        this.currentClass = null;
        this.currentCourse = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.timer = null;
        this.timeLeft = 0;
        this.quizStartTime = null;
        this.quizConfig = {
            questionCount: 10,
            timeLimit: 30,
            difficulty: 'medium'
        };

        this.initializeApp();
    }

    initializeApp() {
        this.checkAuthStatus();
        this.initializeEventListeners();
        this.initializeKeyboardSupport();
    }

    checkAuthStatus() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showDashboard();
            this.toggleHomeVisibility(false);
        } else {
            this.toggleHomeVisibility(true);
            this.showAuthPage();
        }
    }

    initializeEventListeners() {
        // Start quiz button
        document.getElementById('start-quiz').addEventListener('click', () => {
            this.startQuiz();
        });

        // Next question button
        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });

        // Submit quiz button
        document.getElementById('submit-quiz').addEventListener('click', () => {
            this.submitQuiz();
        });

        // Retake quiz button
        document.getElementById('retake-quiz').addEventListener('click', () => {
            this.retakeQuiz();
        });

        // New quiz button
        document.getElementById('new-quiz').addEventListener('click', () => {
            this.newQuiz();
        });

        // Auth tabs toggle
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.getAttribute('data-tab');
                document.getElementById('login-form').classList.toggle('active', target === 'login');
                document.getElementById('register-form').classList.toggle('active', target === 'register');
            });
        });

        // Register submit
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Login submit
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Click on user name to open dashboard
        const userInfoSpan = document.getElementById('user-info');
        if (userInfoSpan) {
            userInfoSpan.addEventListener('click', () => this.showDashboard());
        }

        // Delegated handler in case navbar updates dynamically
        document.addEventListener('click', (e) => {
            const target = e.target.closest('#user-info');
            if (target) {
                this.showDashboard();
            }
        });

        // Keyboard activation for user-info
        document.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            if (active && active.id === 'user-info' && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.showDashboard();
            }
        });

        // Student info submit
        const studentInfoForm = document.getElementById('studentInfoForm');
        if (studentInfoForm) {
            studentInfoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStudentInfoSubmit();
            });
        }

        // Toggle course selection visibility based on class
        const classSelect = document.getElementById('class');
        if (classSelect) {
            classSelect.addEventListener('change', () => {
                this.updateCourseFieldVisibility();
            });
        }

        // React to course change to update dashboard subjects if visible
        const courseSelect = document.getElementById('course');
        if (courseSelect) {
            courseSelect.addEventListener('change', () => {
                this.updateCourseSubjectsVisibility();
            });
        }

        // Subject cards (both class and course subjects)
        document.querySelectorAll('.subject-card').forEach(card => {
            card.addEventListener('click', () => {
                const subject = card.getAttribute('data-subject');
                this.selectSubject(subject);
            });
        });

        // Back to Dashboard buttons (could exist on multiple views)
        document.querySelectorAll('#back-to-dashboard').forEach(btn => {
            btn.addEventListener('click', () => this.showDashboard());
        });

        // Navbar settings visibility and syncing
        const navSettings = document.getElementById('nav-settings');
        const navClass = document.getElementById('nav-class');
        const navCourse = document.getElementById('nav-course');
        if (navSettings && navClass && navCourse) {
            // Show settings for logged-in users
            navSettings.classList.remove('hidden');

            // Seed from saved/current state
            const saved = JSON.parse(localStorage.getItem('studentInfo') || 'null');
            const classVal = this.currentClass || (saved && saved.class) || '';
            const courseVal = this.currentCourse || (saved && saved.course) || '';
            if (classVal) navClass.value = String(parseInt(classVal || '0', 10) || '');
            if (courseVal) navCourse.value = courseVal;
            this.toggleNavbarCourseVisibility();
            // Mirror label visibility with select
            const navCourseLabel = document.querySelector('.nav-course-label');
            if (navCourseLabel) {
                navCourseLabel.classList.toggle('hidden', !(parseInt(navClass.value || '0', 10) > 10));
            }

            navClass.addEventListener('change', () => {
                const val = parseInt(navClass.value || '0', 10);
                // Update in-memory and persist
                this.currentClass = navClass.value;
                if (val > 10) {
                    this.toggleNavbarCourseVisibility();
                } else {
                    navCourse.value = '';
                    this.currentCourse = '';
                    this.toggleNavbarCourseVisibility();
                    const navCourseLabel = document.querySelector('.nav-course-label');
                    if (navCourseLabel) navCourseLabel.classList.add('hidden');
                }
                localStorage.setItem('studentInfo', JSON.stringify({
                    ...(saved || {}),
                    class: this.currentClass,
                    course: this.currentCourse || ''
                }));
                this.updateCourseSubjectsVisibility();
                this.showDashboard();
            });

            navCourse.addEventListener('change', () => {
                this.currentCourse = navCourse.value;
                const latest = JSON.parse(localStorage.getItem('studentInfo') || '{}');
                localStorage.setItem('studentInfo', JSON.stringify({
                    ...latest,
                    class: this.currentClass || latest.class || '',
                    course: this.currentCourse
                }));
                this.updateCourseSubjectsVisibility();
                this.showDashboard();
            });
        }

        // Home start button
        const homeStartBtn = document.getElementById('home-start-btn');
        if (homeStartBtn) {
            homeStartBtn.addEventListener('click', () => {
                this.toggleHomeVisibility(false);
                this.showAuthPage();
            });
        }
    }

    updateCourseSubjectsVisibility() {
        // Prefer in-memory state, then saved studentInfo, then DOM selects
        let classValueStr = this.currentClass || '';
        let courseValue = this.currentCourse || '';
        if (!classValueStr || (!courseValue && document.getElementById('course'))) {
            const saved = JSON.parse(localStorage.getItem('studentInfo') || 'null');
            if (saved) {
                classValueStr = classValueStr || saved.class || '';
                courseValue = courseValue || saved.course || '';
            }
        }
        const domClass = document.getElementById('class');
        const domCourse = document.getElementById('course');
        if (!classValueStr && domClass) classValueStr = domClass.value || '';
        if (!courseValue && domCourse) courseValue = domCourse.value || '';

        const classValue = parseInt(classValueStr || '0', 10);

        const base = document.getElementById('class-subjects');
        const courseWrap = document.getElementById('course-subjects');
        const groups = ['mpc','bipc','hec','btech','mba','higher'];
        const groupIds = groups.map(g => `${g}-subjects`);

        if (!base || !courseWrap) return;

        if (!classValue || classValue <= 10) {
            base.classList.remove('hidden');
            courseWrap.classList.add('hidden');
        } else {
            base.classList.add('hidden');
            courseWrap.classList.remove('hidden');
            groupIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
            if (courseValue) {
                const visible = document.getElementById(`${courseValue}-subjects`);
                if (visible) visible.classList.remove('hidden');
            }
        }
    }

    selectSubject(subject) {
        this.currentSubject = subject;
        this.showQuizConfig();
        this.updateQuizSubjectHeader();
        this.applySubjectCategoryMapping(subject);
    }

    showQuizConfig() {
        document.getElementById('dashboard-page').classList.add('hidden');
        document.getElementById('quiz-config').classList.remove('hidden');
        document.getElementById('quiz-interface').classList.add('hidden');
        document.getElementById('quiz-results').classList.add('hidden');
    }

    updateQuizSubjectHeader() {
        const title = document.getElementById('quiz-subject-title');
        const desc = document.getElementById('quiz-subject-description');
        const pretty = (this.currentSubject || '').replace(/\b\w/g, c => c.toUpperCase());
        title.textContent = `${pretty} Quiz Settings`;
        desc.textContent = `Configure your ${pretty} quiz preferences`;
    }

    updateCourseFieldVisibility() {
        const classSelect = document.getElementById('class');
        const courseSelection = document.getElementById('course-selection');
        const courseSelect = document.getElementById('course');
        if (!classSelect || !courseSelection) return;
        const value = parseInt(classSelect.value || '0', 10);
        if (value > 10) {
            courseSelection.classList.remove('hidden');
        } else {
            courseSelection.classList.add('hidden');
            if (courseSelect) courseSelect.value = '';
        }
    }

    toggleNavbarCourseVisibility() {
        const navClass = document.getElementById('nav-class');
        const navCourse = document.getElementById('nav-course');
        if (!navClass || !navCourse) return;
        const val = parseInt(navClass.value || '0', 10);
        if (val > 10) {
            navCourse.classList.remove('hidden');
            const navCourseLabel = document.querySelector('.nav-course-label');
            if (navCourseLabel) navCourseLabel.classList.remove('hidden');
        } else {
            navCourse.classList.add('hidden');
            const navCourseLabel = document.querySelector('.nav-course-label');
            if (navCourseLabel) navCourseLabel.classList.add('hidden');
        }
    }

    // Inserted: map subject names to Open Trivia DB categories
    applySubjectCategoryMapping(subject) {
        const categorySelect = document.getElementById('category');
        if (!categorySelect) return;

        const map = {
            'maths': 19,
            'mathematics': 19,
            'science': 17,
            'english': 9,
            'social': 23,
            'history': 23,
            'economics': 23,
            'civics': 23,
            'geography': 22,
            'politics': 23,
            'programming': 18,
            'data-structures': 18,
            'physics': 17,
            'chemistry': 17,
            'strategy': 23,
            'statistics': 19,
            'general-knowledge': 9
        };

        const cat = map[subject];
        if (cat) categorySelect.value = String(cat);
    }

    // Auth handlers
    handleRegister() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim().toLowerCase();
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm-password').value;

        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[email]) {
            alert('User already exists. Please login.');
            return;
        }

        users[email] = { name, email, password };
        localStorage.setItem('users', JSON.stringify(users));
        this.currentUser = { name, email };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.showStudentInfoPage();
    }

    handleLogin() {
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const user = users[email];
        if (!user || user.password !== password) {
            alert('Invalid email or password');
            return;
        }
        this.currentUser = { name: user.name, email: user.email };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.showDashboard();
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showAuthPage();
    }

    handleStudentInfoSubmit() {
        const age = parseInt(document.getElementById('age').value, 10);
        const classValue = document.getElementById('class').value;
        const numericClass = parseInt(classValue || '0', 10);
        const course = document.getElementById('course') ? document.getElementById('course').value : '';
        if (numericClass > 10 && !course) {
            alert('Please select a course for Class 11/12.');
            this.updateCourseFieldVisibility();
            return;
        }
        localStorage.setItem('studentInfo', JSON.stringify({ age, class: classValue, course }));
        this.currentClass = classValue;
        this.currentCourse = course;
        this.showDashboard();
    }

    // Page navigation helpers
    showAuthPage() {
        document.getElementById('auth-page').classList.remove('hidden');
        document.getElementById('student-info-page').classList.add('hidden');
        document.getElementById('dashboard-page').classList.add('hidden');
        document.getElementById('quiz-config').classList.add('hidden');
        document.getElementById('quiz-interface').classList.add('hidden');
        document.getElementById('quiz-results').classList.add('hidden');
        this.updateNavbar();
    }

    showStudentInfoPage() {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('student-info-page').classList.remove('hidden');
        document.getElementById('dashboard-page').classList.add('hidden');
        this.updateCourseFieldVisibility();
        this.updateNavbar();
        // Keep navbar in sync when entering student info
        const navClass = document.getElementById('nav-class');
        const navCourse = document.getElementById('nav-course');
        const cls = document.getElementById('class');
        const crs = document.getElementById('course');
        if (navClass && cls) navClass.value = cls.value || '';
        if (navCourse && crs) navCourse.value = crs.value || '';
        this.toggleHomeVisibility(false);
    }

    showDashboard() {
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('student-info-page').classList.add('hidden');
        document.getElementById('dashboard-page').classList.remove('hidden');
        document.getElementById('dashboard-username').textContent = this.currentUser?.name || '';
        // Load saved student info if not already set
        if (!this.currentClass || !this.currentCourse) {
            const saved = JSON.parse(localStorage.getItem('studentInfo') || 'null');
            if (saved) {
                this.currentClass = saved.class;
                this.currentCourse = saved.course;
            }
        }
        this.updateNavbar();
        this.updateCourseSubjectsVisibility();
        this.toggleHomeVisibility(false);
    }

    updateNavbar() {
        const userInfo = document.getElementById('user-info');
        const logoutBtn = document.getElementById('logout-btn');
        const navSettings = document.getElementById('nav-settings');
        const navUserIcon = document.getElementById('nav-user-icon');
        if (this.currentUser) {
            userInfo.textContent = this.currentUser.name;
            logoutBtn.style.display = 'inline-block';
            if (navSettings) navSettings.classList.remove('hidden');
            if (navUserIcon) navUserIcon.classList.remove('hidden');
        } else {
            userInfo.textContent = '';
            logoutBtn.style.display = 'none';
            if (navSettings) navSettings.classList.add('hidden');
            if (navUserIcon) navUserIcon.classList.add('hidden');
        }
    }

    initializeKeyboardSupport() {
        document.addEventListener('keydown', (event) => {
            const quizInterface = document.getElementById('quiz-interface');
            if (quizInterface.classList.contains('hidden')) return;

            const options = document.querySelectorAll('.option:not([disabled])');

            if (event.key >= '1' && event.key <= '9') {
                const index = parseInt(event.key) - 1;
                if (index < options.length) {
                    options[index].click();
                }
            }
        });
    }

    async startQuiz() {
        try {
            this.showLoading(true);
            this.updateQuizConfig();
            
            // Fetch questions from Open Trivia DB API
            await this.fetchQuestions();
            
            if (this.questions.length === 0) {
                throw new Error('No questions available. Please try again.');
            }

            this.initializeQuiz();
            this.showQuizInterface();
            this.showQuestion();
            this.startTimer();
            this.quizStartTime = Date.now();

        } catch (error) {
            console.error('Error starting quiz:', error);
            alert('Failed to load questions. Please check your internet connection and try again.');
            this.showLoading(false);
        }
    }

    updateQuizConfig() {
        this.quizConfig.questionCount = parseInt(document.getElementById('question-count').value);
        this.quizConfig.timeLimit = parseInt(document.getElementById('time-limit').value);
        this.quizConfig.difficulty = document.getElementById('difficulty').value;
        this.quizConfig.category = parseInt(document.getElementById('category').value);
    }

    async fetchQuestions() {
        const apiUrl = `https://opentdb.com/api.php?amount=${this.quizConfig.questionCount}&category=${this.quizConfig.category}&difficulty=${this.quizConfig.difficulty}&type=multiple`;
        
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.response_code === 0) {
                this.questions = data.results.map((q, index) => ({
                    id: index,
                    question: this.decodeHtml(q.question),
                    correctAnswer: this.decodeHtml(q.correct_answer),
                    options: this.shuffleArray([
                        ...q.incorrect_answers.map(incorrect => this.decodeHtml(incorrect)),
                        this.decodeHtml(q.correct_answer)
                    ]),
                    category: q.category,
                    difficulty: q.difficulty
                }));
            } else {
                throw new Error('API returned error: ' + data.response_code);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            // Fallback to sample questions if API fails
            this.questions = this.getSampleQuestions();
        }
    }

    getSampleQuestions() {
        return [
            {
                id: 0,
                question: "What is the capital of France?",
                correctAnswer: "Paris",
                options: ["London", "Berlin", "Paris", "Madrid"],
                category: "Geography",
                difficulty: "easy"
            },
            {
                id: 1,
                question: "Which planet is known as the Red Planet?",
                correctAnswer: "Mars",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                category: "Science",
                difficulty: "easy"
            },
            {
                id: 2,
                question: "What is 2 + 2?",
                correctAnswer: "4",
                options: ["3", "4", "5", "6"],
                category: "Mathematics",
                difficulty: "easy"
            },
            {
                id: 3,
                question: "Who painted the Mona Lisa?",
                correctAnswer: "Leonardo da Vinci",
                options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
                category: "Art",
                difficulty: "medium"
            },
            {
                id: 4,
                question: "What is the largest mammal in the world?",
                correctAnswer: "Blue whale",
                options: ["African elephant", "Blue whale", "Giraffe", "Hippopotamus"],
                category: "Science",
                difficulty: "medium"
            }
        ].slice(0, this.quizConfig.questionCount);
    }

    decodeHtml(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    initializeQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.timeLeft = this.quizConfig.timeLimit;
    }

    showQuizInterface() {
        document.getElementById('quiz-config').classList.add('hidden');
        document.getElementById('quiz-interface').classList.remove('hidden');
        document.getElementById('quiz-results').classList.add('hidden');
        this.showLoading(false);
    }

    showQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        
        // Update progress
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.questions.length;

        // Update question text
        document.getElementById('question-text').textContent = question.question;

        // Create options
        this.createOptions(question);

        // Reset timer
        this.timeLeft = this.quizConfig.timeLimit;
        this.updateTimerDisplay();

        // Hide navigation buttons initially
        document.getElementById('next-question').classList.add('hidden');
        document.getElementById('submit-quiz').classList.add('hidden');
    }

    createOptions(question) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionElement = document.createElement('button');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => {
                this.selectOption(optionElement, option, question);
            });
            optionsContainer.appendChild(optionElement);
        });
    }

    selectOption(optionElement, selectedAnswer, question) {
        // Disable all options
        const options = document.querySelectorAll('.option');
        options.forEach(opt => {
            opt.disabled = true;
            opt.classList.remove('selected');
        });

        // Mark selected option
        optionElement.classList.add('selected');

        // Store user answer
        this.userAnswers[this.currentQuestionIndex] = {
            question: question.question,
            selectedAnswer: selectedAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: selectedAnswer === question.correctAnswer
        };

        // Update score
        if (selectedAnswer === question.correctAnswer) {
            this.score++;
        }

        // Show correct/incorrect feedback
        this.showAnswerFeedback(options, question);

        // Show navigation button
        this.showNavigationButton();
    }

    showAnswerFeedback(options, question) {
        options.forEach(option => {
            if (option.textContent === question.correctAnswer) {
                option.classList.add('correct');
            } else if (option.classList.contains('selected') && option.textContent !== question.correctAnswer) {
                option.classList.add('incorrect');
            }
        });
    }

    showNavigationButton() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            document.getElementById('next-question').classList.remove('hidden');
        } else {
            document.getElementById('submit-quiz').classList.remove('hidden');
        }
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.showQuestion();
    }

    submitQuiz() {
        this.stopTimer();
        this.showResults();
    }

    showResults() {
        document.getElementById('quiz-interface').classList.add('hidden');
        document.getElementById('quiz-results').classList.remove('hidden');

        // Calculate results
        const totalQuestions = this.questions.length;
        const correctAnswers = this.score;
        const incorrectAnswers = totalQuestions - correctAnswers;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const timeTaken = this.calculateTimeTaken();

        // Update result display
        document.getElementById('final-score').textContent = correctAnswers;
        document.getElementById('total-score').textContent = totalQuestions;
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('correct-answers').textContent = correctAnswers;
        document.getElementById('incorrect-answers').textContent = incorrectAnswers;
        document.getElementById('time-taken').textContent = timeTaken;

        // Generate review section
        this.generateReviewSection();
    }

    calculateTimeTaken() {
        const endTime = Date.now();
        const totalTime = Math.floor((endTime - this.quizStartTime) / 1000);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    generateReviewSection() {
        const reviewContainer = document.getElementById('review-questions');
        reviewContainer.innerHTML = '';

        this.userAnswers.forEach((answer, index) => {
            const reviewQuestion = document.createElement('div');
            reviewQuestion.className = `review-question ${answer.isCorrect ? 'correct' : 'incorrect'}`;
            
            reviewQuestion.innerHTML = `
                <div class="review-question-text">
                    ${index + 1}. ${answer.question}
                </div>
                <div class="review-options">
                    ${this.questions[index].options.map(option => {
                        let className = 'review-option';
                        if (option === answer.selectedAnswer) className += ' selected';
                        if (option === answer.correctAnswer) className += ' correct';
                        if (option === answer.selectedAnswer && !answer.isCorrect) className += ' incorrect';
                        
                        return `<div class="${className}">${option}</div>`;
                    }).join('')}
                </div>
            `;
            
            reviewContainer.appendChild(reviewQuestion);
        });
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        timerElement.textContent = this.timeLeft;
        timerElement.className = 'timer';

        if (this.timeLeft <= 5) {
            timerElement.classList.add('danger');
        } else if (this.timeLeft <= 10) {
            timerElement.classList.add('warning');
        }
    }

    timeUp() {
        this.stopTimer();
        
        // Auto-select no answer if time runs out
        if (this.userAnswers[this.currentQuestionIndex] === undefined) {
            this.userAnswers[this.currentQuestionIndex] = {
                question: this.questions[this.currentQuestionIndex].question,
                selectedAnswer: null,
                correctAnswer: this.questions[this.currentQuestionIndex].correctAnswer,
                isCorrect: false
            };
        }

        // Show correct answer
        const options = document.querySelectorAll('.option');
        const question = this.questions[this.currentQuestionIndex];
        this.showAnswerFeedback(options, question);

        // Disable all options
        options.forEach(opt => opt.disabled = true);

        // Show navigation button
        this.showNavigationButton();
    }

    retakeQuiz() {
        this.initializeQuiz();
        this.showQuizInterface();
        this.showQuestion();
        this.startTimer();
        this.quizStartTime = Date.now();
    }

    newQuiz() {
        document.getElementById('quiz-results').classList.add('hidden');
        document.getElementById('quiz-config').classList.remove('hidden');
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        if (show) {
            loadingElement.classList.remove('hidden');
        } else {
            loadingElement.classList.add('hidden');
        }
    }

    toggleHomeVisibility(show) {
        const home = document.getElementById('home-page');
        if (!home) return;
        if (show) {
            home.classList.remove('hidden');
        } else {
            home.classList.add('hidden');
        }
    }
}

// Initialize the quiz application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EduQuizApp();
});

// (Keyboard support now handled inside EduQuizApp.initializeKeyboardSupport)