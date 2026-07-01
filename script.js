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
        const padLeft = 30;
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

        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('0', padLeft - 4, padTop + chartHeight);
        ctx.fillText(formatThousandLabel(yMid), padLeft - 4, padTop + (chartHeight * 0.5) + 4);
        ctx.fillText(formatThousandLabel(yMax), padLeft - 4, padTop + 4);

        ctx.beginPath();
        ctx.strokeStyle = '#e1306c'; 
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

        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.font = '10px sans-serif';
        const labelStep = Math.max(1, Math.floor(dataPoints.length / 3));
        for (let i = 0; i < dataPoints.length; i += labelStep) {
            const x = padLeft + i * step;
            ctx.fillText(labels[i] || '', x, padTop + chartHeight + 14);
        }
        const lastIdx = dataPoints.length - 1;
        if (lastIdx % labelStep !== 0) {
            ctx.fillText(labels[lastIdx], padLeft + lastIdx * step, padTop + chartHeight + 14);
        }
    };

    const viewsData = {
        points: [200, 400, 600, 900, 1100, 1450, 1850, 2100, 2288],
        labels: ['29 Jun', '', '', '', '30 Jun', '', '', '', '1 Jul'],
        maxScale: 2288
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
});