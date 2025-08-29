const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

let authenticated = false;

// CORS Middleware
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://scanland.org',
        'https://www.scanland.org',
        'https://districtforgesolutions.com',
        'https://www.districtforgesolutions.com',
        'https://forgottengrandstands.com',
        'https://www.forgottengrandstands.com',
        'https://jubileecoffeeandtea.com',
        'https://www.jubileecoffeeandtea.com',
        'https://missiondrivenpod.com',
        'https://www.missiondrivenpod.com',
        'https://scanlandconsulting.com',
        'https://www.scanlandconsulting.com',
        'https://thescanlandgroup.com',
        'https://www.thescanlandgroup.com',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:5501',
        'http://127.0.0.1:5501',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    console.log(`${req.method} ${req.path} from ${origin || 'unknown'}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'running', 
        authenticated,
        server: 'Scanland CMS Server',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Login endpoint with multiple client passwords
app.post('/login', (req, res) => {
    const { password } = req.body;
    console.log('Login attempt received');
    
    const validPasswords = {
        'Scanland2025!CMS': {
            user: 'admin',
            name: 'Scanland Admin',
            permissions: 'full'
        },
        'TSG2025!Edit': {
            user: 'tsg-client',
            name: 'The Scanland Group',
            permissions: 'client'
        },
        'District2025!Edit': {
            user: 'district-client', 
            name: 'District Forge Solutions',
            permissions: 'client'
        },
        'Jubilee2025!Edit': {
            user: 'jubilee-client',
            name: 'Jubilee Coffee & Tea',
            permissions: 'client'
        },
        'Mission2025!Edit': {
            user: 'mission-client',
            name: 'Mission Driven Pod',
            permissions: 'client'
        },
        'Consulting2025!Edit': {
            user: 'consulting-client',
            name: 'Scanland Consulting',
            permissions: 'client'
        },
        'Grandstands2025!Edit': {
            user: 'grandstands-client',
            name: 'Forgotten Grandstands',
            permissions: 'client'
        }
    };
    
    if (validPasswords[password]) {
        authenticated = true;
        const userInfo = validPasswords[password];
        console.log('Login successful for:', userInfo.name);
        res.json({ 
            success: true, 
            message: 'Authentication successful',
            user: userInfo.user,
            name: userInfo.name,
            permissions: userInfo.permissions,
            timestamp: new Date().toISOString()
        });
    } else {
        console.log('Login failed - incorrect password');
        res.json({ 
            success: false, 
            message: 'Invalid password'
        });
    }
});

// Serve the CMS JavaScript
app.get('/cms.js', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.send(`
// Scanland CMS - Complete Working Version
console.log('Scanland CMS Loading...');

let editMode = false;

// Keyboard shortcut
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyE') {
        e.preventDefault();
        if (!editMode) {
            showLogin();
        } else {
            exitCMS();
        }
    }
});

function showLogin() {
    const overlay = document.createElement('div');
    overlay.innerHTML = \`
        <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,61,39,0.8);z-index:999999;display:flex;align-items:center;justify-content:center;">
            <div style="background:#F3E7D1;padding:40px;border-radius:12px;text-align:center;border:3px solid #7BB58C;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                <h2 style="color:#0F3D27;margin:0 0 10px 0;">Scanland CMS</h2>
                <input type="password" id="loginPassword" placeholder="Password" style="width:100%;padding:15px;margin:20px 0;border:2px solid #7BB58C;border-radius:6px;background:#F3E7D1;color:#0F3D27;">
                <button onclick="doLogin()" style="width:100%;padding:15px;background:#0F3D27;color:#F3E7D1;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Access CMS</button>
            </div>
        </div>
    \`;
    document.body.appendChild(overlay);
    
    // Focus password field
    const passwordField = document.getElementById('loginPassword');
    passwordField.focus();
    passwordField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            doLogin();
        }
    });
}

async function doLogin() {
    const password = document.getElementById('loginPassword').value;
    
    try {
        const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3001' 
            : 'https://cms.scanland.org';
            
        const response = await fetch(serverUrl + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.querySelector('[style*="position:fixed"]').remove();
            startCMS();
            if (data.name) {
                showMessage('Welcome, ' + data.name );
            }
        } else {
            showMessage('Incorrect password', 'error');
        }
    } catch (error) {
        showMessage('Server connection failed - is the CMS server running?', 'error');
        console.error('Login error:', error);
    }
}

function startCMS() {
    editMode = true;
    createToolbar();
    makeContentEditable();
}

function createToolbar() {
    // Remove existing toolbar if present
    const existingToolbar = document.getElementById('cmsToolbar');
    if (existingToolbar) {
        existingToolbar.remove();
    }
    
    const toolbar = document.createElement('div');
    toolbar.id = 'cmsToolbar';
    toolbar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#0F3D27;color:#F3E7D1;padding:15px 25px;z-index:999998;display:flex;justify-content:space-between;align-items:center;font-family:Arial,sans-serif;border-bottom:4px solid #7BB58C;box-shadow:0 4px 15px rgba(0,0,0,0.3);';
    
    toolbar.innerHTML = \`
        <div><strong style="font-size:18px;">Scanland CMS</strong></div>
        <div>
            <button onclick="duplicateElement()" style="padding:12px 18px;background:#F3E7D1;color:#0F3D27;border:none;border-radius:6px;margin-right:8px;cursor:pointer;font-weight:bold;font-size:14px;">Duplicate</button>
            <button onclick="addButtonToPage()" style="padding:12px 18px;background:#F3E7D1;color:#0F3D27;border:none;border-radius:6px;margin-right:8px;cursor:pointer;font-weight:bold;font-size:14px;">Add Button</button>
            <button onclick="reorderCards()" style="padding:12px 18px;background:#F3E7D1;color:#0F3D27;border:none;border-radius:6px;margin-right:8px;cursor:pointer;font-weight:bold;font-size:14px;">Reorder</button>
            <button onclick="showInfo()" style="padding:12px 18px;background:#F3E7D1;color:#0F3D27;border:none;border-radius:6px;margin-right:8px;cursor:pointer;font-weight:bold;font-size:14px;">Help</button>
            <button onclick="downloadClean()" style="padding:12px 18px;background:#7BB58C;color:#0F3D27;border:none;border-radius:6px;margin-right:8px;cursor:pointer;font-weight:bold;font-size:14px;">Download</button>
            <button onclick="exitCMS()" style="padding:12px 18px;background:#E0E0E0;color:#0F3D27;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px;">Exit</button>
        </div>
    \`;
    
    document.body.appendChild(toolbar);
    document.body.style.paddingTop = '80px';
}

function makeContentEditable() {
    // Clear existing CMS elements
    document.querySelectorAll('.cms-delete-btn').forEach(btn => btn.remove());
    
    // Make text elements editable
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, td, th').forEach(el => {
        if (el.closest('#cmsToolbar')) return;
        if (el.querySelector('img, button, a, input, select, textarea')) return;
        
        const text = el.textContent?.trim();
        if (!text || text.length < 2) return;
        
        // Skip if already has CMS functionality
        if (el.hasAttribute('data-cms-text')) return;
        el.setAttribute('data-cms-text', 'true');
        
        el.addEventListener('click', function(e) {
            if (!editMode) return;
            e.stopPropagation();
            editText(this);
        });
        
        el.addEventListener('mouseenter', function() {
            if (editMode) {
                this.style.outline = '2px dashed #7BB58C';
                this.style.cursor = 'pointer';
            }
        });
        
        el.addEventListener('mouseleave', function() {
            if (editMode) {
                this.style.outline = '';
                this.style.cursor = '';
            }
        });
    });
    
    // Make buttons/links editable
    document.querySelectorAll('a, button').forEach(btn => {
        if (btn.closest('#cmsToolbar') || btn.classList.contains('cms-delete-btn')) return;
        if (btn.hasAttribute('data-cms-button')) return;
        
        btn.setAttribute('data-cms-button', 'true');
        
        // Add delete button
        if (!btn.querySelector('.cms-delete-btn')) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'cms-delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.style.cssText = 'position:absolute;top:-8px;right:-8px;background:#dc3545;color:white;border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;display:none;z-index:999999;font-size:12px;font-weight:bold;';
            
            if (getComputedStyle(btn).position === 'static') {
                btn.style.position = 'relative';
            }
            
            btn.appendChild(deleteBtn);
            
            deleteBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (confirm('Delete this button?')) {
                    btn.remove();
                    showMessage('Button deleted');
                }
            });
        }
        
        btn.addEventListener('click', function(e) {
            if (!editMode) return;
            if (e.target.classList.contains('cms-delete-btn')) return;
            e.preventDefault();
            editButton(this);
        });
        
        btn.addEventListener('mouseenter', function() {
            if (editMode) {
                this.style.outline = '2px solid #0F3D27';
                this.style.cursor = 'pointer';
                const deleteBtn = this.querySelector('.cms-delete-btn');
                if (deleteBtn) deleteBtn.style.display = 'block';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            if (editMode) {
                this.style.outline = '';
                this.style.cursor = '';
                const deleteBtn = this.querySelector('.cms-delete-btn');
                if (deleteBtn) deleteBtn.style.display = 'none';
            }
        });
    });
    
    // Make images editable
    document.querySelectorAll('img').forEach(img => {
        if (img.closest('#cmsToolbar')) return;
        if (img.hasAttribute('data-cms-image')) return;
        
        img.setAttribute('data-cms-image', 'true');
        
        img.addEventListener('click', function(e) {
            if (!editMode) return;
            e.preventDefault();
            editImage(this);
        });
        
        img.addEventListener('mouseenter', function() {
            if (editMode) {
                this.style.outline = '3px solid #7BB58C';
                this.style.cursor = 'pointer';
            }
        });
        
        img.addEventListener('mouseleave', function() {
            if (editMode) {
                this.style.outline = '';
                this.style.cursor = '';
            }
        });
    });
    
    // Add delete buttons to cards/sections
    document.querySelectorAll('.card, .test-section, div[class], section[class], article[class]').forEach(card => {
        if (card.closest('#cmsToolbar') || card.classList.contains('cms-delete-btn')) return;
        if (card.querySelector('.cms-card-delete')) return;
        
        // Only add to elements that look like cards/components
        if (card.children.length === 0) return;
        
        // Skip if this is a container of other cards
        if (card.querySelector('.card, div[class*="card"]') && !card.classList.contains('card')) return;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'cms-delete-btn cms-card-delete';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.style.cssText = 'position:absolute;top:-15px;right:-15px;background:#dc3545;color:white;border:2px solid white;border-radius:50%;width:30px;height:30px;cursor:pointer;display:none;z-index:999999;font-size:14px;';
        
        if (getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }
        card.appendChild(deleteBtn);
        
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const cardName = card.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() || 'Card';
            if (confirm(\`Delete "\${cardName}"?\`)) {
                card.remove();
                showMessage('Card deleted');
            }
        });
        
        card.addEventListener('mouseenter', function() {
            if (editMode) {
                this.style.outline = '2px dashed #dc3545';
                deleteBtn.style.display = 'block';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (editMode) {
                this.style.outline = '';
                deleteBtn.style.display = 'none';
            }
        });
    });
}

function editText(element) {
    const currentText = element.textContent.trim();
    const hasFormatting = element.innerHTML !== element.textContent;
    
    if (hasFormatting) {
        if (confirm('This text has formatting. Edit as plain text (OK) or HTML (Cancel)?')) {
            const newText = prompt('Edit text:', currentText);
            if (newText !== null && newText !== currentText) {
                element.textContent = newText;
                showMessage('Text updated');
            }
        } else {
            const newHTML = prompt('Edit HTML:', element.innerHTML);
            if (newHTML !== null && newHTML !== element.innerHTML) {
                element.innerHTML = newHTML;
                showMessage('HTML updated');
            }
        }
    } else {
        const newText = prompt('Edit text:', currentText);
        if (newText !== null && newText !== currentText) {
            element.textContent = newText;
            showMessage('Text updated');
        }
    }
}

function editButton(button) {
    const text = button.textContent.trim();
    const newText = prompt('Edit button text:', text);
    if (newText !== null && newText !== text) {
        button.textContent = newText;
        showMessage('Button text updated');
    }
    
    if (button.tagName === 'A') {
        const url = button.href || '#';
        const newUrl = prompt('Edit button destination:', url);
        if (newUrl !== null && newUrl !== url) {
            button.href = newUrl;
            showMessage('Button destination updated');
        }
    }
}

function editImage(img) {
    const currentSrc = img.src;
    const filename = currentSrc.split('/').pop();
    const newFilename = prompt('Enter new image filename:', filename);
    
    if (newFilename && newFilename !== filename) {
        if (newFilename.includes('/') || newFilename.startsWith('http')) {
            img.src = newFilename;
        } else {
            const pathParts = currentSrc.split('/');
            pathParts[pathParts.length - 1] = newFilename;
            img.src = pathParts.join('/');
        }
        showMessage('Image updated');
    }
}

function duplicateElement() {
    showMessage('Click any element to duplicate it', 'info');
    
    const handler = function(e) {
        if (e.target.closest('#cmsToolbar')) return;
        e.preventDefault();
        e.stopPropagation();
        
        let target = e.target;
        
        // Find the appropriate parent element to duplicate
        while (target && target !== document.body) {
            if (target.tagName && (target.classList.length > 0 || ['DIV', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER'].includes(target.tagName))) {
                if (!target.closest('#cmsToolbar')) {
                    break;
                }
            }
            target = target.parentElement;
        }
        
        if (!target || target === document.body) return;
        
        const clone = target.cloneNode(true);
        
        // Remove CMS elements from clone
        clone.querySelectorAll('.cms-delete-btn').forEach(btn => btn.remove());
        clone.removeAttribute('data-cms-text');
        clone.removeAttribute('data-cms-button');
        clone.removeAttribute('data-cms-image');
        
        // Clean all child elements
        clone.querySelectorAll('[data-cms-text], [data-cms-button], [data-cms-image]').forEach(el => {
            el.removeAttribute('data-cms-text');
            el.removeAttribute('data-cms-button');
            el.removeAttribute('data-cms-image');
        });
        
        // Add "Copy" to first text element
        const firstText = clone.querySelector('h1, h2, h3, h4, h5, h6, p');
        if (firstText && !firstText.textContent.includes('(Copy)')) {
            firstText.textContent += ' (Copy)';
        }
        
        target.parentNode.insertBefore(clone, target.nextSibling);
        showMessage('Element duplicated');
        
        // Re-initialize CMS features
        setTimeout(() => {
            makeContentEditable();
        }, 200);
        
        document.removeEventListener('click', handler, true);
    };
    
    document.addEventListener('click', handler, true);
    setTimeout(() => document.removeEventListener('click', handler, true), 15000);
}

function addButtonToPage() {
    showMessage('Click any element to add a button to it', 'info');
    
    const handler = function(e) {
        if (e.target.closest('#cmsToolbar')) return;
        e.preventDefault();
        e.stopPropagation();
        
        let target = e.target;
        
        // Find a good container
        while (target && target !== document.body) {
            if (['DIV', 'SECTION', 'ARTICLE', 'MAIN', 'P'].includes(target.tagName)) {
                break;
            }
            target = target.parentElement;
        }
        
        if (!target || target === document.body) return;
        
        const text = prompt('Enter button text:', 'Click Here');
        if (!text) return;
        
        const dest = prompt('Enter button destination:', '#');
        if (!dest) return;
        
        const btn = document.createElement('a');
        btn.href = dest;
        btn.textContent = text;
        btn.className = 'button';
        btn.style.margin = '10px 10px 10px 0';
        
        target.appendChild(btn);
        
        showMessage('Button added');
        setTimeout(() => {
            makeContentEditable();
        }, 100);
        
        document.removeEventListener('click', handler, true);
    };
    
    document.addEventListener('click', handler, true);
    setTimeout(() => document.removeEventListener('click', handler, true), 15000);
}

function reorderCards() {
    showMessage('Click a container with multiple elements to reorder them', 'info');
    
    const handler = function(e) {
        if (e.target.closest('#cmsToolbar')) return;
        e.preventDefault();
        e.stopPropagation();
        
        let container = e.target;
        while (container && container !== document.body) {
            if (['DIV', 'SECTION', 'ARTICLE', 'UL', 'OL'].includes(container.tagName)) {
                break;
            }
            container = container.parentElement;
        }
        
        if (!container || container === document.body) return;
        
        const children = Array.from(container.children).filter(child => 
            !child.classList.contains('cms-delete-btn') && 
            child.textContent.trim()
        );
        
        if (children.length < 2) {
            showMessage('Container needs at least 2 elements to reorder', 'error');
            return;
        }
        
        const titles = children.map((card, i) => \`\${i+1}. \${card.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() || 'Element ' + (i+1)}\`);
        const cardIndex = parseInt(prompt('Which element to move?\\n\\n' + titles.join('\\n'))) - 1;
        
        if (cardIndex < 0 || cardIndex >= children.length) return;
        
        const newPosition = parseInt(prompt('Move to position (1-' + children.length + '):')) - 1;
        
        if (newPosition < 0 || newPosition >= children.length || newPosition === cardIndex) return;
        
        const cardToMove = children[cardIndex];
        const targetCard = children[newPosition];
        
        if (newPosition > cardIndex) {
            container.insertBefore(cardToMove, targetCard.nextSibling);
        } else {
            container.insertBefore(cardToMove, targetCard);
        }
        
        cardToMove.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showMessage(\`Element moved to position \${newPosition + 1}\`);
        
        document.removeEventListener('click', handler, true);
    };
    
    document.addEventListener('click', handler, true);
    setTimeout(() => document.removeEventListener('click', handler, true), 20000);
}

function showInfo() {
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,61,39,0.8);z-index:9999999;display:flex;align-items:center;justify-content:center;';
    
    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:#F3E7D1;padding:30px;border-radius:12px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.5);border:3px solid #7BB58C;font-family:Arial,sans-serif;';
    
    const currentPage = encodeURIComponent(window.location.href);
    
    dialog.innerHTML = \`
        <h2 style="color:#0F3D27;margin-top:0;text-align:center;border-bottom:3px solid #7BB58C;padding-bottom:15px;">Scanland CMS Guide</h2>
        <div style="color:#0F3D27;line-height:1.6;">
            <h3 style="color:#0F3D27;margin-top:0;">Using This CMS:</h3>
            <ul style="margin:10px 0;padding-left:20px;">
                <li>Click any text to edit it directly</li>
                <li>Click buttons to edit text and destination</li>
                <li>Click images to change filename/source</li>
                <li>Hover over elements to see delete buttons</li>
                <li>Cards show delete buttons on hover</li>
            </ul>
            
            <h3 style="color:#0F3D27;">Button Destinations:</h3>
            <ul style="margin:10px 0;padding-left:20px;">
                <li><strong>External URLs:</strong> https://example.com</li>
                <li><strong>Email links:</strong> mailto:contact@example.com</li>
                <li><strong>Phone links:</strong> tel:+1234567890</li>
                <li><strong>Page anchors:</strong> #section-name</li>
                <li><strong>Attachments folder:</strong> ./assets/attachments/document.pdf</li>
                <li><strong>Images folder:</strong> ./assets/images/photo.png or photo.jpg</li>
                <li><strong>Other pages:</strong> ./about.html or ../other-page.html</li>
            </ul>
            
            <h3 style="color:#0F3D27;">Text Formatting:</h3>
            <ul style="margin:10px 0;padding-left:20px;">
                <li><strong>Simple text:</strong> Direct editing preserves content</li>
                <li><strong>Formatted text:</strong> Choose text-only or HTML editing</li>
                <li><strong>HTML mode:</strong> Edit raw HTML for advanced formatting</li>
            </ul>
            
            <h3 style="color:#0F3D27;">File Structure:</h3>
            <ul style="margin:10px 0;padding-left:20px;">
                <li><strong>/assets/images/</strong> - Website images</li>
                <li><strong>/assets/attachments/</strong> - PDFs, documents, files</li>
                <li><strong>/</strong> - HTML pages (index.html, about.html, etc.)</li>
            </ul>
            
            <h3 style="color:#0F3D27;">Uploading Website Page to cPanel:</h3>
            <ol style="margin:10px 0;padding-left:20px;">
                <li>Click "Download" to get clean HTML file</li>
                <li>Login to cPanel File Manager</li>
                <li>Navigate to public_html folder</li>
                <li>Upload and replace your HTML file</li>
                <li>Your changes appear immediately on your website</li>
            </ol>
            
            <h3 style=\"color:#0F3D27;\">File Upload Instructions:</h3>
            <h4 style=\"color:#0F3D27;margin-bottom:8px;\">Uploading Images:</h4>
            <ol style=\"margin:5px 0 15px 20px;line-height:1.4;\">
                <li>Login to cPanel File Manager</li>
                <li>Navigate to public_html folder</li>
                <li>Go to /assets/images/ folder</li>
                <li>Click \"Upload\" button and select images</li>
                <li>Use in CMS: ./assets/images/filename.jpg</li>
            </ol>

            <h4 style=\"color:#0F3D27;margin-bottom:8px;\">Uploading Documents:</h4>
            <ol style=\"margin:5px 0 15px 20px;line-height:1.4;\">
                <li>Navigate to public_html/assets/attachments/</li>
                <li>Upload PDFs, Word docs, Excel files</li>
                <li>Link to: ./assets/attachments/document.pdf</li>
            </ol>

            <h4 style=\"color:#0F3D27;margin-bottom:8px;\">File Naming:</h4>
            <ul style=\"margin:5px 0 15px 20px;line-height:1.4;\">
                <li>Use lowercase and hyphens (no spaces)</li>
                <li>Examples: team-photo.png, company-brochure.pdf</li>
                <li>Keep names short and descriptive</li>
                <li>Optimize images before uploading</li>
            </ul>

            <h3 style="color:#0F3D27;">Keyboard Shortcuts:</h3>
            <ul style="margin:10px 0;padding-left:20px;">
                <li><strong>Ctrl+Shift+E:</strong> Toggle CMS on/off</li>
                <li><strong>Enter:</strong> Confirm in dialogs</li>
                <li><strong>Escape:</strong> Cancel operations</li>
            </ul>
            
            <div style="margin-top:25px;padding:20px;background:#7BB58C;border-radius:8px;text-align:center;">
                <p style="margin:0 0 10px 0;color:#F3E7D1;font-weight:bold;font-size:16px;">Need More Help?</p>
                <a href="https://scanland.org/cmscontact.html?source=\${currentPage}" target="_blank" style="color:#F3E7D1;text-decoration:underline;font-weight:bold;font-size:14px;">Contact Scanland CMS Support</a>
            </div>
        </div>
        <div style="text-align:center;margin-top:25px;">
            <button onclick="closeHelp()" style="padding:12px 30px;background:#0F3D27;color:#F3E7D1;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:16px;">Close</button>
        </div>
    \`;
    
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    
    // Close on backdrop click
    backdrop.onclick = function(e) {
        if (e.target === backdrop) {
            closeHelp();
        }
    };
    
    window.closeHelp = function() {
        if (backdrop.parentNode) {
            backdrop.remove();
        }
        delete window.closeHelp;
    };
}

async function downloadClean() {
    try {
        const filename = window.location.pathname.split('/').pop() || 'index.html';
        
        const clonedDoc = document.documentElement.cloneNode(true);
        
        // Remove all CMS elements
        clonedDoc.querySelectorAll('#cmsToolbar, .cms-delete-btn').forEach(el => el.remove());
        clonedDoc.querySelectorAll('[data-cms-text], [data-cms-button], [data-cms-image]').forEach(el => {
            el.removeAttribute('data-cms-text');
            el.removeAttribute('data-cms-button');
            el.removeAttribute('data-cms-image');
            el.style.outline = '';
            el.style.cursor = '';
        });
        clonedDoc.querySelectorAll('script[src*="cms.js"]').forEach(el => el.remove());
        
        const body = clonedDoc.querySelector('body');
        if (body) body.style.paddingTop = '';
        
        let cleanHTML = '<!DOCTYPE html>\\n' + clonedDoc.outerHTML;
        
        const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3001' 
            : 'https://cms.scanland.org';
        
        const response = await fetch(serverUrl + '/clean-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: cleanHTML,
                filename: filename
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showMessage('Clean file downloaded');
        } else {
            showMessage('Download failed', 'error');
        }
        
    } catch (error) {
        showMessage('Download error: ' + error.message, 'error');
    }
}

function exitCMS() {
    if (confirm('Exit CMS? Unsaved changes will be lost.')) {
        editMode = false;
        document.getElementById('cmsToolbar')?.remove();
        document.querySelectorAll('.cms-delete-btn').forEach(el => el.remove());
        
        document.body.style.paddingTop = '';
        
        document.querySelectorAll('*').forEach(el => {
            el.style.outline = '';
            el.style.cursor = '';
            el.removeAttribute('data-cms-text');
            el.removeAttribute('data-cms-button');
            el.removeAttribute('data-cms-image');
        });
        
        showMessage('CMS session ended');
    }
}

function showMessage(text, type = 'success') {
    const colors = { success: '#7BB58C', error: '#dc3545', info: '#0F3D27' };
    const textColors = { success: '#F3E7D1', error: '#ffffff', info: '#F3E7D1' };
    
    const msg = document.createElement('div');
    msg.style.cssText = \`position:fixed;top:100px;right:30px;background:\${colors[type]};color:\${textColors[type]};padding:15px 25px;border-radius:8px;z-index:10000000;font-weight:bold;border:2px solid #F3E7D1;box-shadow:0 4px 12px rgba(0,0,0,0.2);max-width:300px;word-wrap:break-word;font-family:Arial,sans-serif;\`;
    msg.textContent = text;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        if (msg.parentNode) {
            msg.style.opacity = '0';
            msg.style.transition = 'opacity 0.3s';
            setTimeout(() => msg.remove(), 300);
        }
    }, 3000);
}

console.log('Scanland CMS Ready - Press Ctrl+Shift+E to activate');
    `);
});

// Server-side clean download
app.post('/clean-download', (req, res) => {
    try {
        const { html, filename } = req.body;
        
        if (!html) {
            return res.status(400).json({
                success: false,
                message: 'No HTML content provided'
            });
        }
        
        let cleanHTML = html;
        
        // Remove CMS elements
        cleanHTML = cleanHTML.replace(/<div[^>]*id="cmsToolbar"[^>]*>[\s\S]*?<\/div>/g, '');
        cleanHTML = cleanHTML.replace(/<button[^>]*cms-delete-btn[^>]*>[\s\S]*?<\/button>/g, '');
        cleanHTML = cleanHTML.replace(/<script[^>]*src="[^"]*cms\.js"[^>]*><\/script>/g, '');
        
        // Remove CMS styling
        cleanHTML = cleanHTML.replace(/\s*style="[^"]*outline[^"]*"/g, '');
        cleanHTML = cleanHTML.replace(/\s*style="[^"]*cursor[^"]*"/g, '');
        cleanHTML = cleanHTML.replace(/(<body[^>]*style="[^"]*?)padding-top:[^;]*;?([^"]*")/g, '$1$2');
        cleanHTML = cleanHTML.replace(/\s*data-cms-[^=]*="[^"]*"/g, '');
        cleanHTML = cleanHTML.replace(/\s*style=""\s*/g, '');
        
        if (!cleanHTML.startsWith('<!DOCTYPE')) {
            cleanHTML = '<!DOCTYPE html>\n' + cleanHTML;
        }
        
        res.set({
            'Content-Type': 'text/html',
            'Content-Disposition': 'attachment; filename="' + filename + '"'        });
        res.send(cleanHTML);
        
    } catch (error) {
        console.error('Clean download error:', error);
        res.status(500).json({
            success: false,
            message: 'Download failed: ' + error.message
        });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n='.repeat(15));
    console.log('SCANLAND CMS SERVER');
    console.log('='.repeat(60));
    console.log('📋 INTEGRATION:');
    console.log('Live - Add to HTML: <script src="https://cms.scanland.org/cms.js"></script>');
    console.log('Test - Add to HTML: <script src="https://localhost:3001/cms.js"></script>');
    console.log('');
    console.log('✅ Ready for connections');
    console.log('='.repeat(60));
});