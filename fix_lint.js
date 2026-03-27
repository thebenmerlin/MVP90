const fs = require('fs');

// page.tsx unused vars
let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
pageContent = pageContent.replace(/onSelectFounder={\(id\) => \{/g, 'onSelectFounder={() => {');
pageContent = pageContent.replace(/onSelectCity={\(city\) => \{/g, 'onSelectCity={() => {');
fs.writeFileSync('src/app/page.tsx', pageContent);

// StartupSignalFeed.tsx unused vars
let feedContent = fs.readFileSync('src/components/mvp90/StartupSignalFeed.tsx', 'utf8');
feedContent = feedContent.replace(/import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@\/components\/ui\/tooltip";\n/g, '');
feedContent = feedContent.replace(/const \[selectedSignalId, setSelectedSignalId\] = useState<number>\(0\);/, 'const [selectedSignalId] = useState<number>(0);');
fs.writeFileSync('src/components/mvp90/StartupSignalFeed.tsx', feedContent);

// VCDealTracker.tsx any
let dealContent = fs.readFileSync('src/components/mvp90/VCDealTracker.tsx', 'utf8');
dealContent = dealContent.replace(/onChange={\(e\) => setSortBy\(e\.target\.value as any\)}/, 'onChange={(e) => setSortBy(e.target.value as "date" | "roundSize" | "valuation")}');
fs.writeFileSync('src/components/mvp90/VCDealTracker.tsx', dealContent);
