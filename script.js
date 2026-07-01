document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Main Tab Switching Logic ---
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- 2. Audience Sub-Tab Switching Logic ---
    const subTabs = document.querySelectorAll('.sub-btn');
    const subPanes = document.querySelectorAll('.sub-pane');

    subTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            subTabs.forEach(t => t.classList.remove('active'));
            subPanes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetId = 'sub-' + tab.getAttribute('data-sub');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- 3. Graph Drawing Logic ---
    const viewsCanvas = document.getElementById('viewsChart');
    const watchCanvas = document.getElementById('watchChart');
    const likeCanvas = document.getElementById('likeChart');

    const formatThousandLabel = (value) => {
        if (value === 0) return '0';
        const t = value / 1000;
        return Number.isInteger(t) ? `${t}T` : `${t}T`;
    };

    const drawLineChart = (ctx, w, h, dataPoints, labels, yMaxScale) => {
        ctx.clearRect(0, 0, w, h);
        
        const padTop = 10;
        const padBottom = 20;
        const padLeft = 35; // Extra padding so 3T doesn't get cut off
        const padRight = 10;
        const chartHeight = h - padTop - padBottom;
        const chartWidth = w - padLeft - padRight;

        let yMax = 2000;
        let yMid = 1000;
        if (yMaxScale > 2000) {
            yMax = 3000;
            yMid = 1500;
        } else {
            yMax = 2000;
            yMid = 1000;
        }

        // --- 1. ADDED: DRAW BACKGROUND GRID LINES (Copied from second graph) ---
        ctx.strokeStyle = '#2a2a2a'; // Faint grey lines
        ctx.lineWidth = 0.5;
        ctx.fillStyle = '#a8abb2';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle'; // Centers numbers perfectly on lines

        // 0 (Bottom line)
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop + chartHeight);
        ctx.lineTo(w - padRight, padTop + chartHeight);
        ctx.stroke();
        ctx.fillText('0', padLeft - 6, padTop + chartHeight);

        // Mid (50% or 1.5T line)
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop + (chartHeight * 0.5));
        ctx.lineTo(w - padRight, padTop + (chartHeight * 0.5));
        ctx.stroke();
        ctx.fillText(formatThousandLabel(yMid), padLeft - 6, padTop + (chartHeight * 0.5));

        // Max (100% or 3T line)
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop);
        ctx.lineTo(w - padRight, padTop);
        ctx.stroke();
        ctx.fillText(formatThousandLabel(yMax), padLeft - 6, padTop);

        // --- 2. DRAW THE PINK DATA LINE (Kept 100% identical) ---
        ctx.beginPath();
        ctx.strokeStyle = '#f54394'; 
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        const getYPos = (val) => {
            const clampedVal = Math.min(val, yMax);
            return padTop + chartHeight - (clampedVal / yMax) * chartHeight;
        };
        
        const step = chartWidth / (dataPoints.length - 1);

        for (let i = 0; i < dataPoints.length; i++) {
            const x = padLeft + i * step;
            const y = getYPos(dataPoints[i]);
            if (i === 0) ctx.moveTo(x, y);
            else {
                const prevX = padLeft + (i-1) * step;
                const prevY = getYPos(dataPoints[i-1]);
                const cp1x = prevX + (x - prevX) / 2;
                const cp1y = prevY;
                const cp2x = prevX + (x - prevX) / 2;
                const cp2y = y;
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            }
        }
        ctx.stroke();

        // --- 3. DRAW X-AXIS LABELS (Using exact pixel spacing) ---
        ctx.fillStyle = '#a8abb2';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = '10px sans-serif';
        
        // Loop through data points to draw labels
        for (let i = 0; i < dataPoints.length; i++) {
            const label = labels[i] || '';
            if (label) {
                // MANUAL PIXEL OFFSETS. Adjust these numbers to move the labels!
                // Currently set for: 29 Jun at 100px, 30 Jun at 240px, 1 Jul at 350px
                let x;
                if (label === '29 Jun') x = padLeft + 25; 
                else if (label === '30 Jun') x = padLeft + 150;
                else if (label === '1 Jul') x = padLeft + 290;
                else x = padLeft + 0; // Fallback (shouldn't be used)

                // Draw the date
                ctx.fillText(label, x, padTop + chartHeight + 6);
            }
        }
    };

    // --- UPDATED DATA: 3 specific dates ---
    const viewsData = {
        // We add 2 blank labels between dates to keep the graph smooth, but only show the 3 dates
        points: [0, 1146, 1300, 1600, 1700, 1832, 2150, 2200, 2301],
        labels: ['','29 Jun', '', '',  '30 Jun', '','', '1 Jul'],
        maxScale: 2800 // Triggers the 3T scale
    };

    const watchData = {
        points: [100, 95, 85, 65, 45, 35, 30],
        labels: ['0:00', '', '', '', '', '', '0:15'],
        maxScale: 100
    };

    const likeData = {
        points: [0, 0, 0, 0, 0, 0, 0, 45],
        labels: ['0:00', '', '', '', '', '', '', '0:15'],
        maxScale: 50
    };

    if (viewsCanvas) {
        const rect = viewsCanvas.parentElement.getBoundingClientRect();
        viewsCanvas.width = rect.width - 10 || 350;
        viewsCanvas.height = 100;
        const ctx = viewsCanvas.getContext('2d');
        drawLineChart(ctx, viewsCanvas.width, viewsCanvas.height, viewsData.points, viewsData.labels, viewsData.maxScale);
    }

    if (watchCanvas) {
        const rect = watchCanvas.parentElement.getBoundingClientRect();
        watchCanvas.width = rect.width - 10 || 350;
        watchCanvas.height = 100;
        const ctx = watchCanvas.getContext('2d');
        drawLineChart(ctx, watchCanvas.width, watchCanvas.height, watchData.points, watchData.labels, watchData.maxScale);
    }

    if (likeCanvas) {
        const rect = likeCanvas.parentElement.getBoundingClientRect();
        likeCanvas.width = rect.width - 10 || 350;
        likeCanvas.height = 100;
        const ctx = likeCanvas.getContext('2d');
        drawLineChart(ctx, likeCanvas.width, likeCanvas.height, likeData.points, likeData.labels, likeData.maxScale);
    }

    window.addEventListener('resize', () => {
        if (document.getElementById('overview').classList.contains('active')) {
            const rect = viewsCanvas.parentElement.getBoundingClientRect();
            viewsCanvas.width = rect.width - 10 || 350;
            viewsCanvas.height = 100;
            const ctx = viewsCanvas.getContext('2d');
            drawLineChart(ctx, viewsCanvas.width, viewsCanvas.height, viewsData.points, viewsData.labels, viewsData.maxScale);
        } 
        if (document.getElementById('engagement').classList.contains('active')) {
            const rectW = watchCanvas.parentElement.getBoundingClientRect();
            watchCanvas.width = rectW.width - 10 || 350;
            watchCanvas.height = 100;
            let ctx = watchCanvas.getContext('2d');
            drawLineChart(ctx, watchCanvas.width, watchCanvas.height, watchData.points, watchData.labels, watchData.maxScale);

            const rectL = likeCanvas.parentElement.getBoundingClientRect();
            likeCanvas.width = rectL.width - 10 || 350;
            likeCanvas.height = 100;
            ctx = likeCanvas.getContext('2d');
            drawLineChart(ctx, likeCanvas.width, likeCanvas.height, likeData.points, likeData.labels, likeData.maxScale);
        }
    });



    // --- GRAPH: HOW LONG PEOPLE WATCHED ---
const watchSectionCanvas = document.getElementById('watchChartCanvas');

if (watchSectionCanvas) {
    const rect = watchSectionCanvas.parentElement.getBoundingClientRect();
    watchSectionCanvas.width = rect.width || 350;
    watchSectionCanvas.height = 130;
    
    const ctx = watchSectionCanvas.getContext('2d');
    const w = watchSectionCanvas.width;
    const h = watchSectionCanvas.height;
    
    // Margins
    const padTop = 20;
    const padBottom = 25;
    const padLeft = 35;
    const padRight = 15;
    const chartHeight = h - padTop - padBottom;
    const chartWidth = w - padLeft - padRight;

    ctx.clearRect(0, 0, w, h);

    // --- 1. Draw Grid Lines & Y-Axis Labels ---
    ctx.strokeStyle = '#2a2a2a'; // Faint grey lines
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#a8abb2';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // 100% (Top)
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(w - padRight, padTop);
    ctx.stroke();
    ctx.fillText('100%', padLeft - 6, padTop);

    // 50% (Middle)
    const yMid = padTop + (chartHeight / 2);
    ctx.beginPath();
    ctx.moveTo(padLeft, yMid);
    ctx.lineTo(w - padRight, yMid);
    ctx.stroke();
    ctx.fillText('50%', padLeft - 6, yMid);

    // 0 (Bottom)
    const yZero = padTop + chartHeight;
    ctx.beginPath();
    ctx.moveTo(padLeft, yZero);
    ctx.lineTo(w - padRight, yZero);
    ctx.stroke();
    ctx.fillText('0', padLeft - 6, yZero);

    // --- 2. Draw X-Axis Labels ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('0:00', padLeft + 15, yZero + 6);
    ctx.fillText('0:15', w - padRight, yZero + 6);

    // --- 3. Draw Data Line (Mimicking the exact drop-off curve) ---
    // Data points roughly matching screenshot (100% drops to ~40% then slowly to ~30%)
    const dataPoints = [
        {x: 0, y: 95},    // Start at 95%
        {x: 0.15, y: 85}, // Quick drop
        {x: 0.35, y: 55}, // Major drop
        {x: 0.50, y: 45}, 
        {x: 0.70, y: 40},
        {x: 0.90, y: 38},
        {x: 1.0, y: 35}   // End at ~35%
    ];

    ctx.beginPath();
    ctx.strokeStyle = '#f54394'; // Bright pink
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Loop through points and draw smooth curve
    for (let i = 0; i < dataPoints.length; i++) {
        // Map X (0 to 1) to chartWidth
        const x = padLeft + (dataPoints[i].x * chartWidth);
        // Map Y (percentage) to chartHeight (100% = top, 0% = bottom)
        const y = padTop + chartHeight - ((dataPoints[i].y / 100) * chartHeight);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            // Calculate control points for a smooth bezier curve
            const prevX = padLeft + (dataPoints[i-1].x * chartWidth);
            const prevY = padTop + chartHeight - ((dataPoints[i-1].y / 100) * chartHeight);
            
            const cp1x = prevX + (x - prevX) / 2;
            const cp1y = prevY;
            const cp2x = prevX + (x - prevX) / 2;
            const cp2y = y;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        }
    }
    ctx.stroke();
}


    // --- NEW GRAPH: WHEN PEOPLE LIKED YOUR REEL ---
    const likeSectionCanvas = document.getElementById('likeChartCanvas');

    if (likeSectionCanvas) {
        const rect = likeSectionCanvas.parentElement.getBoundingClientRect();
        likeSectionCanvas.width = rect.width || 350;
        likeSectionCanvas.height = 120;
        
        const ctx = likeSectionCanvas.getContext('2d');
        const w = likeSectionCanvas.width;
        const h = likeSectionCanvas.height;
        
        // Margins
        const padTop = 20;
        const padBottom = 25;
        const padLeft = 35;
        const padRight = 15;
        const chartHeight = h - padTop - padBottom;
        const chartWidth = w - padLeft - padRight;

        ctx.clearRect(0, 0, w, h);

        // --- 1. Draw Y-Axis Grid Lines & Labels (50%, 25%, 0) ---
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 0.5;
        ctx.fillStyle = '#a8abb2';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // 50% (Top)
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop);
        ctx.lineTo(w - padRight, padTop);
        ctx.stroke();
        ctx.fillText('50%', padLeft - 6, padTop);

        // 25% (Middle)
        const yMid = padTop + (chartHeight / 2);
        ctx.beginPath();
        ctx.moveTo(padLeft, yMid);
        ctx.lineTo(w - padRight, yMid);
        ctx.stroke();
        ctx.fillText('25%', padLeft - 6, yMid);

        // 0 (Bottom)
        const yZero = padTop + chartHeight;
        ctx.beginPath();
        ctx.moveTo(padLeft, yZero);
        ctx.lineTo(w - padRight, yZero);
        ctx.stroke();
        ctx.fillText('0', padLeft - 6, yZero);

        // --- 2. Draw X-Axis Labels ---
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('0:00', padLeft + 15, yZero + 6);
        ctx.fillText('0:15', w - padRight, yZero + 6);

        // --- 3. Draw Data Line (Flat, slight dip, then huge spike) ---
        const dataPoints = [
            {x: 0, y: 2},    // Start low
            {x: 0.2, y: 2},  // Stay flat
            {x: 0.4, y: 1},  // Tiny dip
            {x: 0.5, y: 2},  // Tiny recover
            {x: 0.6, y: 2},  // Flat
            {x: 0.85, y: 2}, // Flat
            {x: 0.95, y: 20},// Sharp spike starts
            {x: 1.0, y: 45}  // Massive spike at end
        ];

        ctx.beginPath();
        ctx.strokeStyle = '#f54394';
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        for (let i = 0; i < dataPoints.length; i++) {
            const x = padLeft + (dataPoints[i].x * chartWidth);
            const y = padTop + chartHeight - ((dataPoints[i].y / 50) * chartHeight);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                const prevX = padLeft + (dataPoints[i-1].x * chartWidth);
                const prevY = padTop + chartHeight - ((dataPoints[i-1].y / 50) * chartHeight);
                
                const cp1x = prevX + (x - prevX) / 2;
                const cp1y = prevY;
                const cp2x = prevX + (x - prevX) / 2;
                const cp2y = y;
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            }
        }
        ctx.stroke();
    }
});