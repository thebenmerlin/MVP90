const fs = require('fs');

let feedContent = fs.readFileSync('src/components/mvp90/StartupSignalFeed.tsx', 'utf8');
feedContent = feedContent.replace(/const \[apiStatus, setApiStatus\] = useState<any>\(\{\}\);/, 'const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({});');
feedContent = feedContent.replace(/aVal = new Date\(a.lastUpdated\).getTime\(\) as any;/g, 'aVal = new Date(a.lastUpdated).getTime() as unknown as typeof aVal;');
feedContent = feedContent.replace(/bVal = new Date\(b.lastUpdated\).getTime\(\) as any;/g, 'bVal = new Date(b.lastUpdated).getTime() as unknown as typeof bVal;');

fs.writeFileSync('src/components/mvp90/StartupSignalFeed.tsx', feedContent);
