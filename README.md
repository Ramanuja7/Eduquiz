# 🧠 Online Quiz Application

A modern, interactive quiz application built with HTML, CSS, and JavaScript that provides an engaging learning experience with multiple-choice questions, timers, and instant scoring.

## ✨ Features

- **Interactive Quiz Interface**: Clean, modern UI with smooth animations
- **Timer Functionality**: Configurable time limits per question with visual countdown
- **Instant Scoring**: Real-time feedback and scoring system
- **Multiple Question Sources**: 
  - Open Trivia DB API integration for dynamic questions
  - Fallback sample questions for offline use
- **Customizable Settings**:
  - Number of questions (5, 10, 15, 20)
  - Time per question (15, 30, 45, 60 seconds)
  - Difficulty levels (Easy, Medium, Hard)
  - Multiple categories (General Knowledge, Science, Sports, etc.)
- **Comprehensive Results**:
  - Score display with percentage
  - Detailed statistics
  - Answer review section
  - Retake and new quiz options
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Keyboard Support**: Use number keys (1-4) to select answers
- **Accessibility**: High contrast colors and clear typography

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Open Trivia DB API)

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start quizzing!

### Local Development
If you want to run this locally with a web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🎮 How to Use

1. **Configure Your Quiz**:
   - Select the number of questions
   - Choose time limit per question
   - Pick difficulty level
   - Select a category
   - Click "Start Quiz"

2. **Take the Quiz**:
   - Read each question carefully
   - Click on your answer choice
   - Watch the timer countdown
   - Get instant feedback on your answer
   - Use "Next Question" to proceed

3. **Review Results**:
   - See your final score and percentage
   - Review detailed statistics
   - Check the answer review section
   - Retake the same quiz or start a new one

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript
- **Open Trivia DB API**: Free trivia questions database

### Key Features Implementation
- **Timer System**: Uses `setInterval` for countdown with visual feedback
- **API Integration**: Fetches questions from Open Trivia DB with error handling
- **State Management**: Object-oriented approach with QuizApp class
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Accessibility**: ARIA labels and keyboard navigation support

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Responsive typography
- Optimized button sizes
- Mobile-specific layouts

## 🔧 Customization

### Adding New Categories
To add new categories, modify the category select in `index.html` and update the category mapping in the API call.

### Styling Changes
All styles are in `styles.css` with CSS custom properties for easy theming:
- Color scheme can be changed by modifying the gradient values
- Typography can be updated by changing the font imports
- Layout can be adjusted using CSS Grid and Flexbox properties

### Adding Features
The modular JavaScript structure makes it easy to add new features:
- Extend the `QuizApp` class for new functionality
- Add new event listeners for additional interactions
- Modify the results display for new statistics

## 🐛 Troubleshooting

### Common Issues
1. **Questions not loading**: Check internet connection and API availability
2. **Timer not working**: Ensure JavaScript is enabled
3. **Styling issues**: Clear browser cache and check CSS file loading

### API Limitations
- Open Trivia DB has rate limits
- Some categories may have limited questions
- API may be temporarily unavailable

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Open Trivia DB](https://opentdb.com/) for providing free trivia questions
- [Google Fonts](https://fonts.google.com/) for the Inter font family
- Modern CSS techniques and best practices from the web development community

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

---

**Happy Quizzing! 🎉**