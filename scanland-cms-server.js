const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

let authenticated = false;

app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'running', authenticated: authenticated, server: 'Scanland CMS Server', port: PORT });
});

app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === 'Scanland2025!CMS') {
        authenticated = true;
        res.json({ success: true, message: 'Authentication successful' });
    } else {
        res.json({ success: false, message: 'Invalid password' });
    }
});

app.get('/cms.js', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.send(`
let editMode = false;

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyE') {
        e.preventDefault();
        if (!editMode) showLogin();
        else exitCMS();
    }
});

function showLogin() {
    const overlay = document.createElement('div');
    overlay.innerHTML = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,61,39,0.8);z-index:999999;display:flex;align-items:center;justify-content:center;"><div style="background:#F3E7D1;padding:40px;border-radius:12px;text-align:center;border:3px solid #7BB58C;"><h2 style="color:#0F3D27;">Scanland CMS</h2><input type="password" id="loginPassword" placeholder="Password" style="width:100%;padding:15px;margin:20px 0;border:2px solid #7BB58C;border-radius:6px;"><button onclick="doLogin()" style="width:100%;padding:15px;background:#0F3D27;color:#F3E7D1;border:none;border-radius:6px;cursor:pointer;">Access CMS</button></div></div>';
    document.body.appendChild(overlay);
}

async function doLogin() {
    const password = document.getElementById('loginPassword').value;
    try {
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });
        const data = await response.json();
        if (data.success) {
            document.querySelector('[style*="position:fixed"]').remove();
            startCMS();
        } else {
            alert('Incorrect password');
        }
    } catch (error) {
        alert('Server connection failed');
    }
}

function startCMS() {
    editMode = true;
    createToolbar();
    initializeElements();
    showMessage('Scanland CMS Active');
}

function createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'cmsToolbar';
    toolbar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#0F3D27;color:#F3E7D1;padding:12px 20px;z-index:999998;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 10px rgba(0,0,0,0.2);font-family:Arial,sans-serif;';
    toolbar.innerHTML = '<div><strong>Scanland CMS Active</strong></div><div><button onclick="startDuplicate()">Duplicate</button><button onclick="startAddButton()">Add Button</button><button onclick="startReorder()">Reorder</button><button onclick="showHelp()">Help</button><button onclick="downloadClean()">Download</button><button onclick="exitCMS()">Exit</button></div>';
    document.body.appendChild(toolbar);
    document.body.style.paddingTop = '70px';
}

function initializeElements() {
    // Remove existing CMS elements
    document.querySelectorAll('.cms-delete').forEach(el => el.remove());
    
    // Text elements
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li').forEach(el => {
        if (el.closest('#cmsToolbar') || el.querySelector('button, a, img')) return;
        if (!el.textContent.trim()) return;
        
        el.style.cursor = 'pointer';
        el.addEventListener('mouseover', () => el.style.outline = '2px dashed #7BB58C');
        el.addEventListener('mouseout', () => el.style.outline = '');
        el.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.cms_editing) return; // Prevent multiple prompts
            this.cms_editing = true;
            
            const currentText = this.textContent.trim();
            const hasFormatting = this.innerHTML !== this.textContent;
            
            if (hasFormatting) {
                if (confirm('This text has formatting. Edit as plain text (OK) or HTML (Cancel)?')) {
                    const newText = prompt('Edit text:', currentText);
                    if (newText !== null && newText !== currentText) {
                        this.textContent = newText;
                        showMessage('Text updated');
                    }
                } else {
                    const newHTML = prompt('Edit HTML:', this.innerHTML);
                    if (newHTML !== null && newHTML !== this.innerHTML) {
                        this.innerHTML = newHTML;
                        showMessage('HTML updated');
                    }
                }
            } else {
                const newText = prompt('Edit text:', currentText);
                if (newText !== null && newText !== currentText) {
                    this.textContent = newText;
                    showMessage('Text updated');
                }
            }
            
            this.cms_editing = false;
        });
    });
    
    // Buttons and links
    document.querySelectorAll('a, button').forEach(btn => {
        if (btn.closest('#cmsToolbar')) return;
        
        // Add delete button
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'cms-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.style.cssText = 'position:absolute;top:-8px;right:-8px;background:red;color:white;border-radius:50%;width:18px;height:18px;cursor:pointer;display:none;z-index:999999;font-size:12px;text-align:center;line-height:18px;';
        
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
        
        btn.addEventListener('mouseover', () => {
            btn.style.outline = '2px solid #0F3D27';
            deleteBtn.style.display = 'block';
        });
        
        btn.addEventListener('mouseout', () => {
            btn.style.outline = '';
            deleteBtn.style.display = 'none';
        });
        
        btn.addEventListener('click', function(e) {
            if (e.target.classList.contains('cms-delete')) return;
            e.preventDefault();
            e.stopPropagation();
            if (this.cms_editing) return; // Prevent multiple prompts
            this.cms_editing = true;
            
            const newText = prompt('Edit button text:', this.textContent.trim());
            if (newText !== null && newText !== this.textContent.trim()) {
                this.textContent = newText;
                showMessage('Button text updated');
            }
            
            if (this.tagName === 'A') {
                const newUrl = prompt('Edit destination:', this.href || '#');
                if (newUrl !== null && newUrl !== this.href) {
                    this.href = newUrl;
                    showMessage('Button destination updated');
                }
            }
            
            this.cms_editing = false;
        });
    });
    
    // Cards
    document.querySelectorAll('.card, div[class*="card"]').forEach(card => {
        if (card.closest('#cmsToolbar') || !card.children.length) return;
        
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'cms-delete';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.style.cssText = 'position:absolute;top:-15px;right:-15px;background:#dc3545;color:white;border:2px solid white;border-radius:50%;width:30px;height:30px;cursor:pointer;display:none;z-index:999999;text-align:center;line-height:26px;';
        
        if (getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }
        card.appendChild(deleteBtn);
        
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const cardName = card.querySelector('h1,h2,h3,h4,h5,h6')?.textContent || 'Card';
            if (confirm('Delete "' + cardName + '"?')) {
                card.remove();
                showMessage('Card deleted');
            }
        });
        
        card.addEventListener('mouseover', () => {
            card.style.outline = '2px dashed #dc3545';
            deleteBtn.style.display = 'block';
        });
        
        card.addEventListener('mouseout', () => {
            card.style.outline = '';
            deleteBtn.style.display = 'none';
        });
    });
}

function startDuplicate() {
    showMessage('Click element to duplicate');
    document.body.style.cursor = 'copy';
    
    function handleClick(e) {
        if (e.target.closest('#cmsToolbar')) return;
        e.preventDefault();
        e.stopPropagation();
        
        let target = e.target;
        while (target && target !== document.body) {
            if (target.classList.length > 0) break;
            target = target.parentElement;
        }
        
        if (target && target !== document.body) {
            const clone = target.cloneNode(true);
            clone.querySelectorAll('.cms-delete').forEach(el => el.remove());
            
            const heading = clone.querySelector('h1,h2,h3,h4,h5,h6');
            if (heading) heading.textContent += ' (Copy)';
            
            target.parentNode.insertBefore(clone, target.nextSibling);
            showMessage('Element duplicated');
            setTimeout(() => initializeElements(), 200);
        }
        
        document.removeEventListener('click', handleClick, true);
        document.body.style.cursor = '';
    }
    
    document.addEventListener('click', handleClick, true);
    setTimeout(() => {
        document.removeEventListener('click', handleClick, true);
        document.body.style.cursor = '';
    }, 15000);
}

function startAddButton() {
    showMessage('Click where to add button');
    document.body.style.cursor = 'crosshair';
    
    function handleClick(e) {
        if (e.target.closest('#cmsToolbar')) return;
        e.preventDefault();
        e.stopPropagation();
        
        let target = e.target;
        while (target && target !== document.body) {
            if (['DIV', 'SECTION', 'ARTICLE', 'MAIN', 'P'].includes(target.tagName)) break;
            target = target.parentElement;
        }
        
        if (target && target !== document.body) {
            const text = prompt('Enter button text:', 'Click Here');
            if (text) {
                const url = prompt('Enter button destination:', '#');
                if (url) {
                    const btn = document.createElement('a');
                    btn.href = url;
                    btn.textContent = text;
                    btn.className = 'button';
                    btn.style.margin = '10px 10px 10px 0';
                    target.appendChild(btn);
                    showMessage('Button added');
                    setTimeout(() => initializeElements(), 200);
                }
            }
        }
        
        document.removeEventListener('click', handleClick, true);
        document.body.style.cursor = '';
    }
    
    document.addEventListener('click', handleClick, true);
    setTimeout(() => {
        document.removeEventListener('click', handleClick, true);
        document.body.style.cursor = '';
    }, 20000);
}

function startReorder() {
    showMessage('Click container to reorder');
    
    function handleClick(e) {
        if (e.target.closest('#cmsToolbar')) return;
        e.preventDefault();
        e.stopPropagation();
        
        let container = e.target;
        while (container && container !== document.body) {
            if (['DIV', 'SECTION', 'ARTICLE', 'UL'].includes(container.tagName)) break;
            container = container.parentElement;
        }
        
        if (container && container !== document.body) {
            const children = Array.from(container.children).filter(child => 
                !child.classList.contains('cms-delete') && child.textContent.trim()
            );
            
            if (children.length >= 2) {
                const names = children.map((child, i) => {
                    const heading = child.querySelector('h1,h2,h3,h4,h5,h6');
                    return (i + 1) + '. ' + (heading ? heading.textContent : child.textContent.substring(0, 30));
                });
                
                const choice = prompt('Which element to move?\\n\\n' + names.join('\\n'));
                if (choice) {
                    const elementIndex = parseInt(choice) - 1;
                    if (elementIndex >= 0 && elementIndex < children.length) {
                        const newPos = prompt('Move to position (1-' + children.length + '):');
                        if (newPos) {
                            const newPosition = parseInt(newPos) - 1;
                            if (newPosition >= 0 && newPosition < children.length && newPosition !== elementIndex) {
                                const elementToMove = children[elementIndex];
                                const targetElement = children[newPosition];
                                
                                if (newPosition > elementIndex) {
                                    container.insertBefore(elementToMove, targetElement.nextSibling);
                                } else {
                                    container.insertBefore(elementToMove, targetElement);
                                }
                                showMessage('Element moved');
                            }
                        }
                    }
                }
            } else {
                alert('Container needs at least 2 elements');
            }
        }
        
        document.removeEventListener('click', handleClick, true);
    }
    
    document.addEventListener('click', handleClick, true);
}

function showHelp() {
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,61,39,0.8);z-index:9999999;display:flex;align-items:center;justify-content:center;';
    
    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:#F3E7D1;padding:30px;border-radius:12px;max-width:650px;width:95%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.5);border:3px solid #7BB58C;font-family:Arial,sans-serif;';
    
    const currentPage = encodeURIComponent(window.location.href);
    
    dialog.innerHTML = '<h2 style="color:#0F3D27;margin-top:0;text-align:center;border-bottom:3px solid #7BB58C;padding-bottom:15px;">Scanland CMS Guide</h2>' +
        '<div style="color:#0F3D27;line-height:1.6;">' +
        '<h3 style="color:#0F3D27;margin-top:0;">Using This CMS:</h3>' +
        '<ul style="margin:10px 0;padding-left:20px;"><li>Click any text to edit it directly</li><li>Click buttons to edit text and destination</li><li>Click images to change filename/source</li><li>Hover over elements to see delete buttons</li><li>Cards show trash delete buttons on hover</li></ul>' +
        '<h3 style="color:#0F3D27;">Button Destinations:</h3>' +
        '<ul style="margin:10px 0;padding-left:20px;"><li><strong>External URLs:</strong> https://example.com</li><li><strong>Email links:</strong> mailto:contact@example.com</li><li><strong>Phone links:</strong> tel:+1234567890</li><li><strong>Page anchors:</strong> #section-name</li><li><strong>Assets folder:</strong> ./assets/attachments/document.pdf</li><li><strong>Images folder:</strong> ./assets/images/photo.jpg</li><li><strong>Downloads folder:</strong> ./downloads/file.zip</li><li><strong>Other pages:</strong> ./about.html or ../other-page.html</li></ul>' +
        '<h3 style="color:#0F3D27;">Text Formatting:</h3>' +
        '<ul style="margin:10px 0;padding-left:20px;"><li><strong>Simple text:</strong> Direct editing preserves content</li><li><strong>Formatted text:</strong> Choose text-only or HTML editing</li><li><strong>HTML mode:</strong> Edit raw HTML for advanced formatting</li><li><strong>Links in text:</strong> Use HTML mode to add link tags</li></ul>' +
        '<h3 style="color:#0F3D27;">File Structure:</h3>' +
        '<ul style="margin:10px 0;padding-left:20px;"><li><strong>/assets/images/</strong> - Website images and photos</li><li><strong>/assets/attachments/</strong> - PDFs, documents, files</li><li><strong>/downloads/</strong> - Downloadable files for visitors</li><li><strong>/</strong> - HTML pages (index.html, about.html, etc.)</li></ul>' +
        '<h3 style="color:#0F3D27;">Uploading to cPanel:</h3>' +
        '<ol style="margin:10px 0;padding-left:20px;"><li>Click "Download" to get clean HTML file</li><li>Login to cPanel File Manager</li><li>Navigate to public_html folder</li><li>Upload and replace your HTML file</li><li>Your changes appear immediately on your website</li></ol>' +
        '<h3 style="color:#0F3D27;">Features:</h3>' +
        '<ul style="margin:10px 0;padding-left:20px;"><li><strong>Duplicate:</strong> Copy any page element with "(Copy)" label</li><li><strong>Add Button:</strong> Insert new website-styled buttons anywhere</li><li><strong>Reorder:</strong> Rearrange elements within containers</li><li><strong>Clean Download:</strong> Get HTML with all CMS code removed</li></ul>' +
        '<h3 style="color:#0F3D27;">Keyboard Shortcuts:</h3>' +
        '<ul style="margin:10px 0;padding-left:20px;"><li><strong>Ctrl+Shift+E:</strong> Toggle CMS on/off</li><li><strong>Enter:</strong> Confirm in browser dialogs</li><li><strong>Escape:</strong> Cancel operations</li></ul>' +
        '<h3 style="color:#0F3D27;">Troubleshooting:</h3>' +
        '<ul style="margin:10px 0;padding-left:20px;"><li>If buttons stop working, exit and restart CMS</li><li>New buttons automatically use website styling</li><li>Clean download removes all CMS traces</li><li>Contact support if you encounter issues</li></ul>' +
        '<div style="margin-top:25px;padding:20px;background:#7BB58C;border-radius:8px;text-align:center;"><p style="margin:0 0 10px 0;color:#F3E7D1;font-weight:bold;font-size:16px;">Need More Help?</p><a href="https://scanland.org/cmscontact.html?source=' + currentPage + '" target="_blank" style="color:#F3E7D1;text-decoration:underline;font-weight:bold;font-size:14px;">Contact Scanland Support</a></div>' +
        '</div>' +
        '<div style="text-align:center;margin-top:25px;"><button onclick="closeHelpDialog()" style="padding:15px 35px;background:#0F3D27;color:#F3E7D1;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:16px;">Close Help</button></div>';
    
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    
    backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) closeHelpDialog();
    });
    
    window.closeHelpDialog = function() {
        if (backdrop.parentNode) backdrop.remove();
        delete window.closeHelpDialog;
    };
}

async function downloadClean() {
    try {
        const filename = window.location.pathname.split('/').pop() || 'index.html';
        const clonedDoc = document.documentElement.cloneNode(true);
        
        clonedDoc.querySelectorAll('#cmsToolbar, .cms-delete').forEach(el => el.remove());
        clonedDoc.querySelectorAll('script[src*="cms.js"]').forEach(el => el.remove());
        
        const body = clonedDoc.querySelector('body');
        if (body) body.style.paddingTop = '';
        
        clonedDoc.querySelectorAll('*').forEach(el => {
            el.style.outline = '';
            el.style.cursor = '';
        });
        
        const cleanHTML = '<!DOCTYPE html>' + clonedDoc.outerHTML;
        
        const response = await fetch('http://localhost:3001/clean-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: cleanHTML, filename: filename })
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
            showMessage('Clean HTML downloaded');
        }
    } catch (error) {
        alert('Download failed: ' + error.message);
    }
}

function exitCMS() {
    if (confirm('Exit CMS? Unsaved changes will be lost.')) {
        editMode = false;
        document.getElementById('cmsToolbar')?.remove();
        document.querySelectorAll('.cms-delete').forEach(el => el.remove());
        document.body.style.paddingTop = '';
        document.querySelectorAll('*').forEach(el => {
            el.style.outline = '';
            el.style.cursor = '';
        });
        showMessage('CMS ended');
    }
}

function showMessage(text) {
    const msg = document.createElement('div');
    msg.style.cssText = 'position:fixed;top:80px;right:30px;background:#7BB58C;color:white;padding:15px 25px;border-radius:8px;z-index:10000000;font-weight:bold;border:2px solid white;';
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
}

console.log('Scanland CMS Ready - Press Ctrl+Shift+E');
    `);
});

app.post('/clean-download', (req, res) => {
    try {
        const { html, filename } = req.body;
        if (!html) return res.status(400).json({ success: false, message: 'No HTML content' });
        
        let cleanHTML = html;
        cleanHTML = cleanHTML.replace(/<div[^>]*id="cmsToolbar"[^>]*>[\s\S]*?<\/div>/gi, '');
        cleanHTML = cleanHTML.replace(/<span[^>]*cms-delete[^>]*>[\s\S]*?<\/span>/gi, '');
        cleanHTML = cleanHTML.replace(/<script[^>]*cms\.js[^>]*><\/script>/gi, '');
        cleanHTML = cleanHTML.replace(/\s*style="[^"]*outline[^"]*"/gi, '');
        cleanHTML = cleanHTML.replace(/\s*style="[^"]*cursor[^"]*"/gi, '');
        
        res.set({
            'Content-Type': 'text/html',
            'Content-Disposition': 'attachment; filename="' + filename + '"'
        });
        res.send(cleanHTML);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Download failed' });
    }
});

app.listen(PORT, () => {
    console.log('\n='.repeat(20));
    console.log('🚀 SCANLAND CMS SERVER');
    console.log('='.repeat(30));
    console.log('Server: http://localhost:' + PORT);
    console.log('Add this to your HTML: <script src="http://localhost:3001/cms.js"></script>')
    console.log('Password: Scanland2025!CMS');
    console.log('Shortcut: Ctrl+Shift+E');
    console.log('✅ Ready');
    console.log('='.repeat(30));
});