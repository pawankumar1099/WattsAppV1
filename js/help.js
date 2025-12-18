/**
 * Help & Training Management Module
 * Handles help documentation, search functionality, and user guidance
 */

class HelpManager {
    constructor() {
        this.currentSection = 'getting-started';
        this.searchIndex = [];
        this.isInitialized = false;
    }

    /**
     * Initialize the help manager
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.buildSearchIndex();
        this.showSection(this.currentSection);
        this.isInitialized = true;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Help menu navigation
        const helpLinks = document.querySelectorAll('.help-link');
        helpLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
                
                // Update active state
                helpLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Search functionality
        const searchInput = document.getElementById('help-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(e.target.value);
                }
            });
        }

        // Contact support interactions
        this.setupContactSupport();
    }

    /**
     * Setup contact support interactions
     */
    setupContactSupport() {
        // Live chat button
        const chatBtn = document.querySelector('#contact .btn-primary');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                this.startLiveChat();
            });
        }

        // FAQ expand/collapse
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('expanded');
            });
        });
    }

    /**
     * Show specific help section
     */
    showSection(sectionId) {
        const sections = document.querySelectorAll('.help-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Update URL hash
            window.location.hash = sectionId;
        }
    }

    /**
     * Build search index for help content
     */
    buildSearchIndex() {
        const sections = document.querySelectorAll('.help-section');
        this.searchIndex = [];

        sections.forEach(section => {
            const sectionId = section.id;
            const title = section.querySelector('h2')?.textContent || '';
            const content = section.textContent.toLowerCase();
            
            // Extract headings and important terms
            const headings = Array.from(section.querySelectorAll('h3, h4'))
                .map(h => h.textContent);
            
            this.searchIndex.push({
                id: sectionId,
                title,
                headings,
                content,
                element: section
            });
        });
    }

    /**
     * Handle search functionality
     */
    handleSearch(query) {
        if (!query || query.length < 2) {
            this.clearSearchResults();
            return;
        }

        const results = this.searchContent(query.toLowerCase());
        this.displaySearchResults(results, query);
    }

    /**
     * Search help content
     */
    searchContent(query) {
        const results = [];
        
        this.searchIndex.forEach(item => {
            let score = 0;
            let matches = [];

            // Check title
            if (item.title.toLowerCase().includes(query)) {
                score += 10;
                matches.push({ type: 'title', text: item.title });
            }

            // Check headings
            item.headings.forEach(heading => {
                if (heading.toLowerCase().includes(query)) {
                    score += 5;
                    matches.push({ type: 'heading', text: heading });
                }
            });

            // Check content
            if (item.content.includes(query)) {
                score += 1;
                const context = this.extractContext(item.content, query);
                matches.push({ type: 'content', text: context });
            }

            if (score > 0) {
                results.push({
                    ...item,
                    score,
                    matches
                });
            }
        });

        return results.sort((a, b) => b.score - a.score);
    }

    /**
     * Extract context around search term
     */
    extractContext(content, query) {
        const index = content.indexOf(query);
        if (index === -1) return '';
        
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + query.length + 50);
        const context = content.substring(start, end);
        
        return (start > 0 ? '...' : '') + context + (end < content.length ? '...' : '');
    }

    /**
     * Display search results
     */
    displaySearchResults(results, query) {
        let searchResults = document.getElementById('search-results');
        
        if (!searchResults) {
            searchResults = document.createElement('div');
            searchResults.id = 'search-results';
            searchResults.className = 'search-results';
            
            const helpContent = document.querySelector('.help-content');
            helpContent.appendChild(searchResults);
        }

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 48px; color: #888; margin-bottom: 15px;"></i>
                    <h3>No results found</h3>
                    <p>No help topics match "${query}". Try different keywords.</p>
                </div>
            `;
        } else {
            const resultsHTML = results.map(result => this.createSearchResultHTML(result, query)).join('');
            searchResults.innerHTML = `
                <div class="search-header">
                    <h3>Search Results for "${query}"</h3>
                    <span class="result-count">${results.length} result${results.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="search-results-list">
                    ${resultsHTML}
                </div>
            `;

            // Add click handlers for search results
            searchResults.querySelectorAll('.search-result').forEach(result => {
                result.addEventListener('click', () => {
                    const sectionId = result.getAttribute('data-section');
                    this.showSection(sectionId);
                    this.clearSearchResults();
                });
            });
        }

        // Hide all help sections when showing search results
        const sections = document.querySelectorAll('.help-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        searchResults.style.display = 'block';
    }

    /**
     * Create HTML for search result
     */
    createSearchResultHTML(result, query) {
        const highlightedMatches = result.matches.map(match => {
            let text = match.text;
            const regex = new RegExp(`(${query})`, 'gi');
            text = text.replace(regex, '<mark>$1</mark>');
            return `<div class="match ${match.type}">${text}</div>`;
        }).join('');

        return `
            <div class="search-result" data-section="${result.id}">
                <h4>${result.title}</h4>
                <div class="search-matches">
                    ${highlightedMatches}
                </div>
            </div>
        `;
    }

    /**
     * Clear search results
     */
    clearSearchResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.style.display = 'none';
        }

        // Show current section
        this.showSection(this.currentSection);

        // Clear search input
        const searchInput = document.getElementById('help-search');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
        }
    }

    /**
     * Start live chat simulation
     */
    startLiveChat() {
        // Simulate live chat functionality
        const chatWindow = this.createChatWindow();
        document.body.appendChild(chatWindow);
        
        // Simulate initial message
        setTimeout(() => {
            this.addChatMessage('Support Agent', 'Hello! How can I help you today?', 'agent');
        }, 1000);
    }

    /**
     * Create chat window
     */
    createChatWindow() {
        const chatWindow = document.createElement('div');
        chatWindow.className = 'chat-window';
        chatWindow.innerHTML = `
            <div class="chat-header">
                <h4>Live Chat Support</h4>
                <button class="chat-close">&times;</button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="system-message">Connected to support chat</div>
            </div>
            <div class="chat-input">
                <input type="text" id="chat-input" placeholder="Type your message...">
                <button id="chat-send">Send</button>
            </div>
        `;

        // Add styles
        chatWindow.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            height: 400px;
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        `;

        // Add event listeners
        const closeBtn = chatWindow.querySelector('.chat-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(chatWindow);
        });

        const chatInput = chatWindow.querySelector('#chat-input');
        const sendBtn = chatWindow.querySelector('#chat-send');

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (message) {
                this.addChatMessage('You', message, 'user');
                chatInput.value = '';
                
                // Simulate agent response
                setTimeout(() => {
                    this.simulateAgentResponse(message);
                }, 1000 + Math.random() * 2000);
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        return chatWindow;
    }

    /**
     * Add message to chat
     */
    addChatMessage(sender, message, type) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        messageElement.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-text">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Simulate agent response
     */
    simulateAgentResponse(userMessage) {
        const responses = {
            battery: "For battery issues, check the Battery Status section in your dashboard. If the battery health shows 'Warning' or 'Critical', consider contacting maintenance.",
            grid: "Grid connection issues are often temporary. Check the Grid Status indicator and verify with your utility provider if the issue persists.",
            solar: "Solar generation varies with weather conditions. Check for panel obstructions and ensure they're clean for optimal performance.",
            consumption: "High consumption can be managed through the Control Panel. Consider adjusting device schedules during peak hours.",
            alert: "You can configure alert thresholds in the Alerts & Notifications section. Go to Settings to customize when you receive notifications.",
            default: "I understand you need help with that. You can find detailed information in our help documentation, or I can transfer you to a technical specialist."
        };

        let response = responses.default;
        const message = userMessage.toLowerCase();

        for (const [key, value] of Object.entries(responses)) {
            if (message.includes(key)) {
                response = value;
                break;
            }
        }

        this.addChatMessage('Support Agent', response, 'agent');
    }

    /**
     * Get help statistics
     */
    getHelpStatistics() {
        return {
            totalSections: this.searchIndex.length,
            currentSection: this.currentSection,
            searchIndexSize: this.searchIndex.length,
            lastSearchQuery: this.lastSearchQuery || null
        };
    }

    /**
     * Provide contextual help
     */
    provideContextualHelp(context) {
        const helpMapping = {
            'dashboard': 'dashboard-guide',
            'alerts': 'alerts-setup',
            'household': 'dashboard-guide',
            'control': 'device-control',
            'reports': 'reports',
            'settings': 'dashboard-guide'
        };

        const targetSection = helpMapping[context] || 'getting-started';
        this.showSection(targetSection);
    }

    /**
     * Export help content as PDF (simulation)
     */
    exportHelpAsPDF() {
        // Simulate PDF export
        const notification = document.createElement('div');
        notification.className = 'export-notification';
        notification.innerHTML = `
            <i class="fas fa-file-pdf"></i>
            Help documentation exported as PDF!
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Create global instance
window.helpManager = new HelpManager();

// Add CSS for help functionality
const helpStyle = document.createElement('style');
helpStyle.textContent = `
    .search-results {
        display: none;
        background: #2a2a2a;
        border-radius: 8px;
        padding: 20px;
        border: 1px solid #444;
    }
    
    .search-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #444;
    }
    
    .search-header h3 {
        color: #fff;
        margin: 0;
    }
    
    .result-count {
        color: #888;
        font-size: 14px;
    }
    
    .search-result {
        padding: 15px;
        background: #3a3a3a;
        border-radius: 6px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .search-result:hover {
        background: #4a4a4a;
    }
    
    .search-result h4 {
        color: #00bcd4;
        margin: 0 0 10px 0;
        font-size: 16px;
    }
    
    .search-matches {
        color: #ccc;
        font-size: 14px;
    }
    
    .match {
        margin-bottom: 5px;
    }
    
    .match.title {
        font-weight: 600;
        color: #fff;
    }
    
    .match.heading {
        color: #00bcd4;
    }
    
    mark {
        background: #ff9800;
        color: #000;
        padding: 2px 4px;
        border-radius: 3px;
    }
    
    .no-results {
        text-align: center;
        padding: 40px;
        color: #888;
    }
    
    .no-results h3 {
        color: #fff;
        margin-bottom: 10px;
    }
    
    .faq-item {
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .faq-item:hover {
        background: #4a4a4a;
    }
    
    .faq-item.expanded {
        background: #3a3a3a;
    }
    
    .chat-window .chat-header {
        background: #00bcd4;
        color: #fff;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 8px 8px 0 0;
    }
    
    .chat-window .chat-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        background: #1a1a1a;
    }
    
    .chat-message {
        margin-bottom: 15px;
        padding: 10px;
        border-radius: 6px;
    }
    
    .chat-message.user {
        background: #00bcd4;
        color: #000;
        margin-left: 20%;
    }
    
    .chat-message.agent {
        background: #3a3a3a;
        color: #fff;
        margin-right: 20%;
    }
    
    .message-sender {
        font-weight: 600;
        font-size: 12px;
        margin-bottom: 5px;
    }
    
    .message-time {
        font-size: 11px;
        opacity: 0.7;
        margin-top: 5px;
    }
    
    .system-message {
        text-align: center;
        color: #888;
        font-style: italic;
        margin-bottom: 15px;
    }
    
    .chat-input {
        display: flex;
        padding: 15px;
        background: #2a2a2a;
        border-radius: 0 0 8px 8px;
    }
    
    .chat-input input {
        flex: 1;
        padding: 8px;
        background: #1a1a1a;
        border: 1px solid #444;
        border-radius: 4px;
        color: #fff;
        margin-right: 10px;
    }
    
    .chat-input button {
        padding: 8px 15px;
        background: #00bcd4;
        border: none;
        border-radius: 4px;
        color: #000;
        cursor: pointer;
    }
    
    .chat-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(helpStyle);
