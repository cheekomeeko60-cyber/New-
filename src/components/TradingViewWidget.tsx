import React, { useEffect, useRef } from 'react';

export default function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (!container.current) return;
    
    // Cleanup previous widget content
    const currentContainer = container.current;
    currentContainer.innerHTML = '';
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    currentContainer.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.innerHTML = JSON.stringify({
      "colorTheme": "light",
      "dateRange": "12M",
      "showChart": true,
      "locale": "en",
      "width": "100%",
      "height": "100%",
      "largeChartUrl": "",
      "isTransparent": true,
      "showSymbolLogo": true,
      "showFloatingTooltip": true,
      "tabs": [
        {
          "title": "Connected Assets",
          "symbols": [
             { "s": "OANDA:XAUUSD", "d": "Gold Spot" },
             { "s": "OANDA:XAGUSD", "d": "Silver Spot" },
             { "s": "OANDA:WTICOUSD", "d": "WTI Crude" },
             { "s": "OANDA:BCOUSD", "d": "Brent Crude" }
          ]
        }
      ]
    });
    
    setTimeout(() => {
      if (isMounted && currentContainer) {
        currentContainer.appendChild(script);
      }
    }, 100);

    return () => {
      isMounted = false;
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}
