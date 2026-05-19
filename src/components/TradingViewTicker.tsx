import React, { useEffect, useRef } from 'react';

export default function TradingViewTicker() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (!container.current) return;
    
    // Cleanup
    const currentContainer = container.current;
    currentContainer.innerHTML = '';
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    currentContainer.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.innerHTML = JSON.stringify({
      "symbols": [
        { "proName": "OANDA:XAUUSD", "title": "Gold" },
        { "proName": "OANDA:XAGUSD", "title": "Silver" },
        { "proName": "OANDA:WTICOUSD", "title": "Crude Oil" },
        { "proName": "OANDA:BCOUSD", "title": "Brent" },
        { "proName": "FX:EURUSD", "title": "EUR/USD" },
        { "proName": "BITSTAMP:BTCUSD", "title": "BTC/USD" }
      ],
      "showSymbolLogo": true,
      "colorTheme": "light",
      "isTransparent": false,
      "displayMode": "adaptive",
      "locale": "en"
    });

    setTimeout(() => {
      if (isMounted && currentContainer) {
        currentContainer.appendChild(script);
      }
    }, 150);

    return () => {
      isMounted = false;
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container w-full" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
