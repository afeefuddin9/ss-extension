document.getElementById('saveApiKey').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    if (!apiKey) {
      alert('Please enter a valid API key.');
      return;
    }
  
    chrome.storage.local.set({ 'alphaVantageApiKey': apiKey }, () => {
      console.log('API key saved:', apiKey);
    });
  });
  
  document.getElementById('drawLevels').addEventListener('click', () => {
    chrome.storage.local.get('alphaVantageApiKey', (result) => {
      const apiKey = result.alphaVantageApiKey;
      if (!apiKey) {
        alert('Please enter and save your Alpha Vantage API key.');
        return;
      }
  
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (apiKey) => {
            window.postMessage({ type: 'drawLevels', apiKey: apiKey }, '*');
          },
          args: [apiKey]
        });
      });
    });
  });
  