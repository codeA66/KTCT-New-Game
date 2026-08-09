const fs = require('fs');

let code = fs.readFileSync('game.js', 'utf8');

// Replace setDaytime calls
code = code.replace(/setDaytime\('🌙',/g, "setDaytime('',");
code = code.replace(/setDaytime\('🌅',/g, "setDaytime('',");
code = code.replace(/setDaytime\('☀️',/g, "setDaytime('',");

// Replace history log icons in endDay
code = code.replace(/<div>📈 \$\{formatImpact\(alloc\.market\)\} \| ⚖️ \$\{formatImpact\(alloc\.equity\)\} \| 🏛️ \$\{formatImpact\(alloc\.discipline\)\}<\/div>/g, 
`<div><i data-lucide="trending-up" style="width:14px;height:14px;vertical-align:middle;color:var(--color-market);"></i> \${formatImpact(alloc.market)} | <i data-lucide="scale" style="width:14px;height:14px;vertical-align:middle;color:var(--color-equity);"></i> \${formatImpact(alloc.equity)} | <i data-lucide="landmark" style="width:14px;height:14px;vertical-align:middle;color:var(--color-discipline);"></i> \${formatImpact(alloc.discipline)}</div>`);

// Replace history log icons in startMorning
code = code.replace(/<div>📈 \$\{formatImpact\(gameState\.bufferStats\.marketDynamics\)\} \| ⚖️ \$\{formatImpact\(gameState\.bufferStats\.socialEquity\)\} \| 🏛️ \$\{formatImpact\(gameState\.bufferStats\.institutionalDiscipline\)\}<\/div>/g, 
`<div><i data-lucide="trending-up" style="width:14px;height:14px;vertical-align:middle;color:var(--color-market);"></i> \${formatImpact(gameState.bufferStats.marketDynamics)} | <i data-lucide="scale" style="width:14px;height:14px;vertical-align:middle;color:var(--color-equity);"></i> \${formatImpact(gameState.bufferStats.socialEquity)} | <i data-lucide="landmark" style="width:14px;height:14px;vertical-align:middle;color:var(--color-discipline);"></i> \${formatImpact(gameState.bufferStats.institutionalDiscipline)}</div>`);

// Replace addHistoryLog to include lucide.createIcons()
code = code.replace(/function addHistoryLog\(htmlContent\) \{[\s\S]*?logDiv\.prepend\(entry\);\n\}/, 
`function addHistoryLog(htmlContent) {
    let logDiv = document.getElementById('history-log');
    
    if (logDiv.innerHTML.includes("Hệ thống sẵn sàng...")) {
        logDiv.innerHTML = "";
    }
    
    let entry = document.createElement('div');
    entry.className = 'log-item';
    entry.innerHTML = htmlContent;
    
    logDiv.prepend(entry);
    if(window.lucide) {
        lucide.createIcons();
    }
}`);

// Add shake animation to card in decideCase
code = code.replace(/let stamp = document\.getElementById\('stamp-overlay'\);\n    stamp\.innerText = isApproved \? 'ĐÃ DUYỆT' : 'ĐÃ BÁC BỎ';/, 
`let stamp = document.getElementById('stamp-overlay');
    stamp.innerText = isApproved ? 'DUYỆT' : 'BÁC BỎ';`);

code = code.replace(/playAnim\(stamp, 'stamp-show'\);/,
`playAnim(stamp, 'stamp-show');
    
    // Add shake to card
    let caseCard = document.getElementById('current-case');
    caseCard.classList.remove('shake');
    void caseCard.offsetWidth;
    caseCard.classList.add('shake');`);

// Update addHistoryLog text to use icons
code = code.replace(/let actionText = isApproved \? "<strong style='color:#27ae60;'>DUYỆT<\/strong>" : "<strong style='color:#c0392b;'>BÁC BỎ<\/strong>";/,
`let actionText = isApproved ? "<strong style='color:var(--color-success);'><i data-lucide='check-circle' style='width:14px;height:14px;vertical-align:middle;'></i> DUYỆT</strong>" : "<strong style='color:var(--color-danger);'><i data-lucide='x-circle' style='width:14px;height:14px;vertical-align:middle;'></i> BÁC BỎ</strong>";`);

// Make sure formatImpact text colors match our CSS vars
code = code.replace(/<span style="color:var\(--color-success\);font-weight:bold;">/g, '<span style="color:var(--color-success);font-weight:bold;">');

fs.writeFileSync('game.js', code, 'utf8');
console.log('Done refactoring game.js');
