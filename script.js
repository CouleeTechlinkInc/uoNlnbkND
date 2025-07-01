// Q3 Prospecting Tracker - Quarterly Grid

class QuarterlyProspectingTracker {
    constructor() {
        // Start date: July 7, 2024 (Q3 start)
        this.startDate = new Date(2024, 6, 7); // Month is 0-indexed
        this.weekCount = 13; // 13 weeks for Q3
        this.weeks = this.generateWeeks();
        this.data = this.loadData();
        this.campaigns = this.loadCampaigns();
        
        this.metrics = [
            { key: 'newProspects', name: 'New Prospects Reached Out To', type: 'editable' },
            { key: 'totalDials', name: 'Total Dials', type: 'editable' },
            { key: 'dialsPerProspect', name: 'Dials Per Prospect', type: 'calculated', clickable: true },
            { key: 'conversations', name: 'Conversations with Decision-Makers', type: 'editable' },
            { key: 'ftasBooked', name: 'FTAs Booked (Discovery Meetings)', type: 'editable' },
            { key: 'section1', name: 'Networking Groups', type: 'section' },
            { key: 'networkingPeople', name: 'People at Networking Events', type: 'editable' },
            { key: 'networkingLeads', name: 'Networking Leads Generated', type: 'editable' },
            { key: 'networkingFTAs', name: 'Networking FTAs Booked', type: 'editable' },
            { key: 'section2', name: 'Trade Shows & Events', type: 'section' },
            { key: 'eventsTalkedTo', name: 'People Talked To at Events', type: 'editable' },
            { key: 'eventsQualified', name: 'Qualified Event Prospects', type: 'editable' },
            { key: 'eventsFTAs', name: 'Event FTAs Booked', type: 'editable' }
        ];
        
        this.initializeTable();
        this.setupEventListeners();
        this.createPopupModals();
        this.updateSummary();
    }

    generateWeeks() {
        const weeks = [];
        for (let i = 0; i < this.weekCount; i++) {
            const weekStart = new Date(this.startDate);
            weekStart.setDate(weekStart.getDate() + (i * 7));
            
            weeks.push({
                index: i,
                startDate: weekStart,
                key: this.formatDateKey(weekStart),
                displayDate: this.formatDateDisplay(weekStart)
            });
        }
        return weeks;
    }

    formatDateKey(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    formatDateDisplay(date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}/${day}`;
    }

    initializeTable() {
        this.createTableHeader();
        this.createTableBody();
    }

    createTableHeader() {
        const headerRow = document.getElementById('headerRow');
        
        // Add week columns
        this.weeks.forEach(week => {
            const th = document.createElement('th');
            th.className = 'week-header';
            th.textContent = week.displayDate;
            th.dataset.weekKey = week.key;
            th.addEventListener('contextmenu', (e) => this.showDayPopup(e, week));
            headerRow.appendChild(th);
        });
    }

    createTableBody() {
        const tableBody = document.getElementById('tableBody');
        
        this.metrics.forEach(metric => {
            const row = document.createElement('tr');
            
            if (metric.type === 'section') {
                row.className = 'section-header';
                const nameCell = document.createElement('td');
                nameCell.className = 'metric-name';
                nameCell.textContent = metric.name;
                nameCell.colSpan = this.weekCount + 1;
                row.appendChild(nameCell);
            } else {
                // Metric name cell
                const nameCell = document.createElement('td');
                nameCell.className = 'metric-name';
                nameCell.textContent = metric.name;
                
                // Add click handler for clickable metrics
                if (metric.clickable) {
                    nameCell.style.cursor = 'pointer';
                    nameCell.style.textDecoration = 'underline';
                    nameCell.addEventListener('click', () => this.showCampaignPopup(metric));
                }
                
                row.appendChild(nameCell);
                
                // Week data cells
                this.weeks.forEach(week => {
                    const dataCell = document.createElement('td');
                    
                    if (metric.type === 'editable') {
                        dataCell.className = 'editable-cell';
                        dataCell.contentEditable = true;
                        dataCell.dataset.metric = metric.key;
                        dataCell.dataset.week = week.key;
                        dataCell.textContent = this.getCellValue(metric.key, week.key);
                    } else if (metric.type === 'calculated') {
                        dataCell.className = 'calculated-cell';
                        dataCell.id = `${metric.key}-${week.key}`;
                        dataCell.textContent = this.calculateValue(metric.key, week.key);
                    }
                    
                    row.appendChild(dataCell);
                });
            }
            
            tableBody.appendChild(row);
        });
    }

    setupEventListeners() {
        // Export button
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        
        // Editable cells - use different approach to prevent backwards typing
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('editable-cell')) {
                this.handleCellClick(e.target);
            }
        });
        
        // Global click handler to close popups
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.popup-modal') && !e.target.closest('.week-header') && !e.target.classList.contains('metric-name')) {
                this.closeAllPopups();
            }
        });
    }

    handleCellClick(cell) {
        // Remove existing event listeners to prevent duplicates
        const existingCell = document.querySelector('.editing-cell');
        if (existingCell && existingCell !== cell) {
            this.finishEditing(existingCell);
        }
        
        cell.classList.add('editing-cell');
        cell.focus();
        
        // Select all text for easy replacement
        if (window.getSelection && document.createRange) {
            const range = document.createRange();
            range.selectNodeContents(cell);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        // Add event listeners for this editing session
        const handleInput = (e) => this.handleCellInput(e);
        const handleKeyPress = (e) => this.handleKeyPress(e);
        const handleBlur = (e) => {
            this.finishEditing(cell);
            cell.removeEventListener('input', handleInput);
            cell.removeEventListener('keypress', handleKeyPress);
            cell.removeEventListener('blur', handleBlur);
        };
        
        cell.addEventListener('input', handleInput);
        cell.addEventListener('keypress', handleKeyPress);
        cell.addEventListener('blur', handleBlur);
    }

    handleCellInput(event) {
        const cell = event.target;
        // Don't modify the content during input to preserve cursor position
        // Just add visual feedback
        cell.classList.add('updated');
        setTimeout(() => cell.classList.remove('updated'), 500);
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.target.blur();
            return;
        }
        
        // Allow numbers, backspace, delete, etc.
        if (!/[0-9]/.test(event.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }
    }

    finishEditing(cell) {
        cell.classList.remove('editing-cell');
        
        // Clean the input - only allow numbers
        const cleanValue = cell.textContent.replace(/[^0-9]/g, '');
        const numericValue = parseInt(cleanValue) || 0;
        
        const metricKey = cell.dataset.metric;
        const weekKey = cell.dataset.week;
        
        // Initialize week data if it doesn't exist
        if (!this.data[weekKey]) {
            this.data[weekKey] = {};
        }
        
        // Save the value
        this.data[weekKey][metricKey] = numericValue;
        cell.textContent = numericValue;
        
        // Save to localStorage
        this.saveData();
        
        // Update calculated cells for this week
        this.updateCalculatedCells(weekKey);
        
        // Update summary
        this.updateSummary();
    }

    getCellValue(metricKey, weekKey) {
        return (this.data[weekKey] && this.data[weekKey][metricKey]) || 0;
    }

    calculateValue(metricKey, weekKey) {
        const weekData = this.data[weekKey] || {};
        
        switch (metricKey) {
            case 'dialsPerProspect':
                const newProspects = weekData.newProspects || 0;
                const totalDials = weekData.totalDials || 0;
                return newProspects > 0 ? (totalDials / newProspects).toFixed(1) : '0.0';
            default:
                return '0';
        }
    }

    updateCalculatedCells(weekKey) {
        // Update dials per prospect
        const dialsPerProspectCell = document.getElementById(`dialsPerProspect-${weekKey}`);
        if (dialsPerProspectCell) {
            dialsPerProspectCell.textContent = this.calculateValue('dialsPerProspect', weekKey);
        }
    }

    createPopupModals() {
        // Campaign Management Popup
        const campaignPopup = document.createElement('div');
        campaignPopup.id = 'campaignPopup';
        campaignPopup.className = 'popup-modal';
        campaignPopup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>Campaign Management</h3>
                    <button class="close-btn" onclick="this.closest('.popup-modal').style.display='none'">&times;</button>
                </div>
                <div class="popup-body">
                    <div class="campaign-list" id="campaignList">
                        <!-- Campaigns will be populated here -->
                    </div>
                    <div class="add-campaign">
                        <input type="text" id="newCampaignName" placeholder="Enter new campaign name" maxlength="50">
                        <button onclick="window.prospectingTracker.addCampaign()">Add Campaign</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(campaignPopup);

        // Day Details Popup
        const dayPopup = document.createElement('div');
        dayPopup.id = 'dayPopup';
        dayPopup.className = 'popup-modal';
        dayPopup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3 id="dayPopupTitle">Day Details</h3>
                    <button class="close-btn" onclick="this.closest('.popup-modal').style.display='none'">&times;</button>
                </div>
                <div class="popup-body">
                    <div id="dayDetails">
                        <!-- Day details will be populated here -->
                    </div>
                    <div class="day-notes">
                        <label for="dayNotes">Notes for this day:</label>
                        <textarea id="dayNotes" rows="4" placeholder="Add notes for this day..."></textarea>
                        <button onclick="prospectingTracker.saveDayNotes()">Save Notes</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(dayPopup);
    }

    showCampaignPopup(metric) {
        const popup = document.getElementById('campaignPopup');
        this.updateCampaignList();
        popup.style.display = 'block';
    }

    showDayPopup(event, week) {
        event.preventDefault();
        const popup = document.getElementById('dayPopup');
        const title = document.getElementById('dayPopupTitle');
        const details = document.getElementById('dayDetails');
        const notes = document.getElementById('dayNotes');
        
        // Set current week for popup
        this.currentPopupWeek = week.key;
        
        title.textContent = `Week of ${week.displayDate} Details`;
        
        // Get week data
        const weekData = this.data[week.key] || {};
        
        details.innerHTML = `
            <div class="day-metrics">
                <h4>Metrics for this week:</h4>
                <div class="metric-item">New Prospects: <strong>${weekData.newProspects || 0}</strong></div>
                <div class="metric-item">Total Dials: <strong>${weekData.totalDials || 0}</strong></div>
                <div class="metric-item">Conversations: <strong>${weekData.conversations || 0}</strong></div>
                <div class="metric-item">FTAs Booked: <strong>${weekData.ftasBooked || 0}</strong></div>
                <div class="metric-item">Networking FTAs: <strong>${weekData.networkingFTAs || 0}</strong></div>
                <div class="metric-item">Event FTAs: <strong>${weekData.eventsFTAs || 0}</strong></div>
            </div>
        `;
        
        // Load existing notes
        notes.value = weekData.notes || '';
        
        popup.style.display = 'block';
    }

    updateCampaignList() {
        const campaignList = document.getElementById('campaignList');
        campaignList.innerHTML = '';
        
        if (this.campaigns.length === 0) {
            campaignList.innerHTML = '<p>No campaigns added yet. Add your first campaign below.</p>';
            return;
        }
        
        this.campaigns.forEach((campaign, index) => {
            const campaignDiv = document.createElement('div');
            campaignDiv.className = 'campaign-item';
            campaignDiv.innerHTML = `
                <span class="campaign-name">${campaign}</span>
                <button class="delete-btn" onclick="prospectingTracker.deleteCampaign(${index})">Delete</button>
            `;
            campaignList.appendChild(campaignDiv);
        });
    }

    addCampaign() {
        const input = document.getElementById('newCampaignName');
        const campaignName = input.value.trim();
        
        if (campaignName && !this.campaigns.includes(campaignName)) {
            this.campaigns.push(campaignName);
            this.saveCampaigns();
            this.updateCampaignList();
            input.value = '';
        } else if (this.campaigns.includes(campaignName)) {
            alert('Campaign already exists!');
        }
    }

    deleteCampaign(index) {
        if (confirm('Are you sure you want to delete this campaign?')) {
            this.campaigns.splice(index, 1);
            this.saveCampaigns();
            this.updateCampaignList();
        }
    }

    saveDayNotes() {
        const notes = document.getElementById('dayNotes').value;
        const weekKey = this.currentPopupWeek;
        
        if (!this.data[weekKey]) {
            this.data[weekKey] = {};
        }
        
        this.data[weekKey].notes = notes;
        this.saveData();
        
        alert('Notes saved successfully!');
    }

    closeAllPopups() {
        document.querySelectorAll('.popup-modal').forEach(popup => {
            popup.style.display = 'none';
        });
    }

    loadCampaigns() {
        const savedCampaigns = localStorage.getItem('prospectingCampaigns');
        return savedCampaigns ? JSON.parse(savedCampaigns) : [];
    }

    saveCampaigns() {
        localStorage.setItem('prospectingCampaigns', JSON.stringify(this.campaigns));
    }

    updateSummary() {
        const summary = this.generateSummary();
        const summaryStats = document.getElementById('summaryStats');
        
        summaryStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total New Prospects:</span>
                <span class="stat-value">${summary.totals.newProspects}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Dials:</span>
                <span class="stat-value">${summary.totals.totalDials}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Conversations:</span>
                <span class="stat-value">${summary.totals.conversations}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total FTAs Booked:</span>
                <span class="stat-value">${summary.totals.totalFTAs}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Overall Conversion Rate:</span>
                <span class="stat-value">${summary.overallConversionRate}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Avg FTAs Per Week:</span>
                <span class="stat-value">${summary.averages.ftasPerWeek}</span>
            </div>
        `;
    }

    generateSummary() {
        const summary = {
            totals: {
                newProspects: 0,
                totalDials: 0,
                conversations: 0,
                ftasBooked: 0,
                networkingFTAs: 0,
                eventsFTAs: 0,
                totalFTAs: 0
            },
            averages: {},
            overallConversionRate: 0
        };

        let weeksWithData = 0;

        this.weeks.forEach(week => {
            const weekData = this.data[week.key] || {};
            
            if (Object.keys(weekData).length > 0) {
                weeksWithData++;
            }

            summary.totals.newProspects += weekData.newProspects || 0;
            summary.totals.totalDials += weekData.totalDials || 0;
            summary.totals.conversations += weekData.conversations || 0;
            summary.totals.ftasBooked += weekData.ftasBooked || 0;
            summary.totals.networkingFTAs += weekData.networkingFTAs || 0;
            summary.totals.eventsFTAs += weekData.eventsFTAs || 0;
        });

        summary.totals.totalFTAs = summary.totals.ftasBooked + summary.totals.networkingFTAs + summary.totals.eventsFTAs;

        // Calculate averages
        const divisor = weeksWithData || 1;
        summary.averages.ftasPerWeek = (summary.totals.totalFTAs / divisor).toFixed(1);

        // Calculate overall conversion rate
        if (summary.totals.conversations > 0) {
            summary.overallConversionRate = ((summary.totals.ftasBooked / summary.totals.conversations) * 100).toFixed(1);
        }

        return summary;
    }

    loadData() {
        const savedData = localStorage.getItem('prospectingTrackerData');
        return savedData ? JSON.parse(savedData) : {};
    }

    saveData() {
        localStorage.setItem('prospectingTrackerData', JSON.stringify(this.data));
    }

    exportData() {
        const summary = this.generateSummary();
        const exportData = {
            generatedDate: new Date().toISOString(),
            quarter: 'Q3 2024',
            startDate: this.startDate.toISOString(),
            weeks: this.weeks.length,
            campaigns: this.campaigns,
            data: this.data,
            summary: summary
        };
        
        // Export JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `q3-prospecting-data-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        // Also export CSV
        this.exportToCSV();
    }

    exportToCSV() {
        const csvRows = [];
        
        // Headers
        const headers = ['Metric', ...this.weeks.map(week => week.displayDate)];
        csvRows.push(headers);
        
        // Data rows
        this.metrics.forEach(metric => {
            if (metric.type !== 'section') {
                const row = [metric.name];
                this.weeks.forEach(week => {
                    if (metric.type === 'editable') {
                        row.push(this.getCellValue(metric.key, week.key));
                    } else if (metric.type === 'calculated') {
                        row.push(this.calculateValue(metric.key, week.key));
                    }
                });
                csvRows.push(row);
            }
        });
        
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const csvUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        
        const csvExportFileDefaultName = `q3-prospecting-data-${new Date().toISOString().split('T')[0]}.csv`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', csvUri);
        linkElement.setAttribute('download', csvExportFileDefaultName);
        linkElement.click();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.prospectingTracker = new QuarterlyProspectingTracker();
});

// Utility functions for debugging
window.debugUtils = {
    clearData: () => {
        localStorage.removeItem('prospectingTrackerData');
        localStorage.removeItem('prospectingCampaigns');
        location.reload();
    },
    
    viewData: () => {
        const data = localStorage.getItem('prospectingTrackerData');
        const campaigns = localStorage.getItem('prospectingCampaigns');
        console.log('Current data:', data ? JSON.parse(data) : 'No data found');
        console.log('Current campaigns:', campaigns ? JSON.parse(campaigns) : 'No campaigns found');
    }
}; 