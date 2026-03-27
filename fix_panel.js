const fs = require('fs');

const pageFile = 'src/app/page.tsx';
let content = fs.readFileSync(pageFile, 'utf8');

content = content.replace(
  /<Panel defaultSize={pipelineExpanded \? 50 : 5} minSize={5} maxSize={80} collapsible onCollapse={\(\) => setPipelineExpanded\(false\)} onExpand={\(\) => setPipelineExpanded\(true\)}>/,
  `<Panel ref={pipelinePanelRef} defaultSize={pipelineExpanded ? 50 : 5} minSize={10} collapsedSize={5} maxSize={80} collapsible onCollapse={() => setPipelineExpanded(false)} onExpand={() => setPipelineExpanded(true)}>`
);

fs.writeFileSync(pageFile, content);
