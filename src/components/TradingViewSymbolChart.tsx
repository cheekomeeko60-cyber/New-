import React, { useEffect, useRef } from 'react';

export default function TradingViewSymbolChart({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (!container.current) return;
    
    // Clear previous widget content if symbol changes
    const currentContainer = container.current;
    currentContainer.innerHTML = '';
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    currentContainer.appendChild(widgetDiv);

    // Map internal symbols to TradingView symbols
    const symbolMap: Record<string, string> = {
      "GOLD": "OANDA:XAUUSD",
      "SILVER": "OANDA:XAGUSD",
      "OIL": "OANDA:WTICOUSD",
      "NONE": "FX:EURUSD",
      "STABLE": "FX:EURUSD"
    };

    const tvSymbol = symbolMap[symbol] || symbolMap["NONE"];

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.innerHTML = JSON.stringify({
      "symbol": tvSymbol,
      "width": "100%",
      "height": "200",
      "locale": "en",
      "dateRange": "1M",
      "colorTheme": "light",
      "isTransparent": true,
      "autosize": false,
      "largeChartUrl": ""
    });

    setTimeout(() => {
      if (isMounted && currentContainer) {
        currentContainer.appendChild(script);
      }
    }, 200);

    return () => {
      isMounted = false;
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-[200px]" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
