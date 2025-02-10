window.addEventListener('message', (event) => {
    if (event.source !== window || event.data.type !== 'drawLevels') {
        return;
    }

    const apiKey = event.data.apiKey; // Get API key from the message
    console.log("Received API Key:", apiKey);

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=XAUUSD&outputsize=compact&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data["Error Message"]) {
                console.error("Alpha Vantage API Error:", data["Error Message"]);
                return;
            }

            const timeSeries = data['Time Series (Daily)'];
            if (!timeSeries) {
                console.error("Invalid API response. No time series data found.");
                return;
            }

            const dates = Object.keys(timeSeries).sort().reverse(); // Sort dates in descending order (newest first)
            if (dates.length < 2) {
                console.error("Not enough data points to calculate levels.");
                return;
            }

            const latestDate = dates[0];
            const high = parseFloat(timeSeries[latestDate]['2. high']);
            const low = parseFloat(timeSeries[latestDate]['3. low']);
            const close = parseFloat(timeSeries[latestDate]['4. close']);

            console.log(`Latest Data (${latestDate}) - High: ${high}, Low: ${low}, Close: ${close}`);

            // Pivot point calculation
            const pivot = (high + low + close) / 3;
            const r1 = (2 * pivot) - low;
            const s1 = (2 * pivot) - high;

            console.log(`Calculated Levels - Pivot: ${pivot}, R1: ${r1}, S1: ${s1}`);

            let canvas = document.getElementById('srCanvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = 'srCanvas';
                canvas.width = window.innerWidth;
                canvas.height = 300;
                canvas.style.position = "fixed";
                canvas.style.bottom = "10px";
                canvas.style.left = "50%";
                canvas.style.transform = "translateX(-50%)";
                canvas.style.border = "1px solid black";
                document.body.appendChild(canvas);
            }
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings

            drawLine(ctx, pivot, 'blue', "Pivot");
            drawLine(ctx, r1, 'red', "R1");
            drawLine(ctx, s1, 'green', "S1");

        })
        .catch(error => console.error('Error fetching data:', error));

}, false);

function drawLine(ctx, level, color, label) {
    const y = ctx.canvas.height - (level % ctx.canvas.height); // Normalize within canvas height
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text label
    ctx.fillStyle = color;
    ctx.font = "14px Arial";
    ctx.fillText(label, 10, y - 5);
}
