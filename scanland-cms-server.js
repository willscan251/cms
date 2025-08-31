const express = require('express');
const fs = require('fs');

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
        'localhost:5500',
        '127.0.0.1:5500',
        'localhost:5501',
        '127.0.0.1:5501',
        'localhost:3000',
        '127.0.0.1:3000'
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

// Root endpoint for Railway health checks
app.get('/', (req, res) => {
    res.status(200).send('OK');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
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
    
    // Read the CMS JavaScript from a separate file to avoid template literal issues
    const cmsScript = `
console.log('Scanland CMS Loading...');

let editMode = false;

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
    overlay.innerHTML = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,61,39,0.8);z-index:999999;display:flex;align-items:center;justify-content:center;"><div style="background:#F3E7D1;padding:40px;border-radius:12px;text-align:center;border:3px solid #7BB58C;box-shadow:0 10px 30px rgba(0,0,0,0.3);"><h2 style="color:#0F3D27;margin:0 0 10px 0;">Scanland CMS</h2><input type="password" id="loginPassword" placeholder="Password" style="width:100%;padding:15px;margin:20px 0;border:2px solid #7BB58C;border-radius:6px;background:#F3E7D1;color:#0F3D27;"><button onclick="doLogin()" style="width:100%;padding:15px;background:#0F3D27;color:#F3E7D1;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Access CMS</button></div></div>';
    document.body.appendChild(overlay);
    
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
        const response = await fetch('https://cms.scanland.org/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.querySelector('[style*="position:fixed"]').remove();
            startCMS();
            if (data.name) {
                showMessage('Welcome, ' + data.name);
            }
        } else {
            showMessage('Incorrect password', 'error');
        }
    } catch (error) {
        showMessage('Server connection failed', 'error');
        console.error('Login error:', error);
    }
}

function startCMS() {
    editMode = true;
    createToolbar();
    makeContentEditable();
}

function createToolbar() {
    const existingToolbar = document.getElementById('cmsToolbar');
    if (existingToolbar) {
        existingToolbar.remove();
    }
    
    const toolbar = document.createElement('div');
    toolbar.id = 'cmsToolbar';
    toolbar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#0F3D27;color:#F3E7D1;padding:15px 25px;z-index:999998;display:flex;justify-content:space-between;align-items:center;font-family:Arial,sans-serif;border-bottom:4px solid #7BB58C;box-shadow:0 4px 15px rgba(0,0,0,0.3);';
    
    toolbar.innerHTML = '<div><strong style="font-size:18px;">Scanland CMS</strong></div><div><button onclick="downloadClean()" style="padding:12px 18px;background:#7BB58C;color:#0F3D27;border:none;border-radius:6px;margin-right:8px;cursor:pointer;font-weight:bold;font-size:14px;">Download</button><button onclick="exitCMS()" style="padding:12px 18px;background:#E0E0E0;color:#0F3D27;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px;">Exit</button></div>';
    
    document.body.appendChild(toolbar);
    document.body.style.paddingTop = '80px';
}

function makeContentEditable() {
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, td, th').forEach(el => {
        if (el.closest('#cmsToolbar')) return;
        if (el.querySelector('img, button, a, input, select, textarea')) return;
        
        const text = el.textContent?.trim();
        if (!text || text.length < 2) return;
        
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
}

function editText(element) {
    const currentText = element.textContent.trim();
    const newText = prompt('Edit text:', currentText);
    if (newText !== null && newText !== currentText) {
        element.textContent = newText;
        showMessage('Text updated');
    }
}

async function downloadClean() {
    try {
        const filename = window.location.pathname.split('/').pop() || 'index.html';
        const clonedDoc = document.documentElement.cloneNode(true);
        
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
        
        let cleanHTML = '<!DOCTYPE html>' + clonedDoc.outerHTML;
        
        const response = await fetch('https://cms.scanland.org/clean-download', {
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
        document.body.style.paddingTop = '';
        
        document.querySelectorAll('*').forEach(el => {
            el.style.outline = '';
            el.style.cursor = '';
            el.removeAttribute('data-cms-text');
        });
        
        showMessage('CMS session ended');
    }
}

function showMessage(text, type = 'success') {
    const colors = { success: '#7BB58C', error: '#dc3545', info: '#0F3D27' };
    const textColors = { success: '#F3E7D1', error: '#ffffff', info: '#F3E7D1' };
    
    const msg = document.createElement('div');
    msg.style.cssText = 'position:fixed;top:100px;right:30px;background:' + colors[type] + ';color:' + textColors[type] + ';padding:15px 25px;border-radius:8px;z-index:10000000;font-weight:bold;border:2px solid #F3E7D1;box-shadow:0 4px 12px rgba(0,0,0,0.2);max-width:300px;word-wrap:break-word;font-family:Arial,sans-serif;';
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
`;

    res.send(cmsScript);
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
            'Content-Disposition': 'attachment; filename="' + filename + '"'
        });
        res.send(cleanHTML);
        
    } catch (error) {
        console.error('Clean download error:', error);
        res.status(500).json({
            success: false,
            message: 'Download failed: ' + error.message
        });
    }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(15));
    console.log('SCANLAND CMS SERVER');
    console.log('='.repeat(60));
    console.log('🔋 INTEGRATION:');
    console.log('Live - Add to HTML: <script src="https://cms.scanland.org/cms.js"></script>');
    console.log('Test - Add to HTML: <script src="http://localhost:' + PORT + '/cms.js"></script>');
    console.log('');
    console.log('✅ Ready for connections on port ' + PORT);
    console.log('='.repeat(60));
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});