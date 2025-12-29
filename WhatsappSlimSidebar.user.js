// ==UserScript==
// @name         Whatsapp Slim Sidebar
// @namespace    https://userscripts.fandrest.my.id/
// @version      1.0
// @description  Collapse the Whatsapp sidebar
// @author       Fandrest
// @match        https://web.whatsapp.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'SidePanelCollapsed';

    // Selectors
    // Note: WhatsApp obfuscates classes frequently.
    const SELECTORS = {
        sidePanel: 'div[class*="_aigw"]',
        mainGrid: 'div[class*="_aigv"]',
        navBar: 'header[data-tab="2"] > div > div:first-child',
    };

    let isCollapsed = GM_getValue(STORAGE_KEY, false);

    // CSS for the "Slim" mode
    const STYLES = `
        /* Smooth Transition */
        ${SELECTORS.sidePanel}, ${SELECTORS.mainGrid} {
            transition: all 0.2s ease-in-out !important;
        }

        /* Set specific width for sidebar */
        body.side-panel-collapsed ${SELECTORS.sidePanel} {
            width: 110px !important;
            flex: 0 0 110px !important;
            min-width: 110px !important;
        }

        /* Adjust Main Grid to accept the 110px column */
        body.side-panel-collapsed ${SELECTORS.mainGrid} {
            grid-template-columns: 110px 1fr !important;
        }

        /* Hiding Content in Slim Mode */

        /* Hide Search Bar & Filter Headers */
        body.side-panel-collapsed ${SELECTORS.sidePanel} div[contenteditable="true"], /* Search Input */
        body.side-panel-collapsed ${SELECTORS.sidePanel} div[role="search"],
        body.side-panel-collapsed ${SELECTORS.sidePanel} button[aria-label="Unread filter"],
        body.side-panel-collapsed ${SELECTORS.sidePanel} div[aria-label="Chat list"] > div:first-child {
            display: none !important;
        }

        /* Hide Text Information in Chat List (Name, Last Message, Time) */
        /* Targets the text container (usually the second child of the flex container) */
        body.side-panel-collapsed ${SELECTORS.sidePanel} div[role="listitem"] > div > div:last-child {
            display: none !important;
        }

        /* 5. Centering the Avatars */
        body.side-panel-collapsed ${SELECTORS.sidePanel} div[role="listitem"] > div {
            justify-content: center !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
        }

        body.side-panel-collapsed ${SELECTORS.sidePanel} div[role="listitem"] img {
            margin: 0 auto !important;
        }

        /* Toggle Button Styling */
        #slim-toggle-btn {
            cursor: pointer;
            padding: 8px 12px;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
        }
        #slim-toggle-btn:hover {
            opacity: 1;
            background-color: rgba(128, 128, 128, 0.1);
            border-radius: 50%;
        }
    `;

    GM_addStyle(STYLES);

    function applyState() {
        document.body.classList.toggle('side-panel-collapsed', isCollapsed);
        const btn = document.getElementById('slim-toggle-btn');
        if (btn) {
            // Arrow points right when collapsed (to expand), left when expanded (to collapse)
            btn.innerHTML = isCollapsed ? '➡️' : '⬅️';
            btn.title = isCollapsed ? 'Expand Panel' : 'Slim Panel';
        }
    }

    function togglePanel() {
        isCollapsed = !isCollapsed;
        GM_setValue(STORAGE_KEY, isCollapsed);
        applyState();
    }

    function injectButton() {
        if (document.getElementById('slim-toggle-btn')) return;

        const navBar = document.querySelector(SELECTORS.navBar);
        if (!navBar) return;

        const btn = document.createElement('div');
        btn.id = 'slim-toggle-btn';
        btn.addEventListener('click', togglePanel);

        // Insert at the beginning of the nav bar
        navBar.prepend(btn);
        applyState();
    }

    // Monitor for WhatsApp's dynamic loading
    const observer = new MutationObserver(() => {
        if (document.querySelector(SELECTORS.navBar)) {
            injectButton();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check
    setTimeout(injectButton, 1100);
})();
