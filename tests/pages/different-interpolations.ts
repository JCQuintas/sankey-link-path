import { sankey } from 'd3-sankey';
import { select } from 'd3-selection';
import { sankeyLinkPathHorizontal } from '../../src/index.js';

interface NodeData {
  name: string;
}

interface LinkData {
  source: number;
  target: number;
  value: number;
}

const data: { nodes: NodeData[]; links: LinkData[] } = {
  nodes: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'X' }, { name: 'Y' }, { name: 'Z' }],
  links: [
    { source: 0, target: 3, value: 25 },
    { source: 1, target: 3, value: 10 },
    { source: 2, target: 4, value: 10 },
    { source: 3, target: 5, value: 25 },
    { source: 4, target: 5, value: 8 },
    { source: 0, target: 4, value: 5 },
  ],
};

function createSankey(svgId: string, interpolations: number) {
  const width = 800;
  const height = 500;
  const margin = { top: 10, right: 60, bottom: 10, left: 60 };

  const sankeyGenerator = sankey<NodeData, LinkData>()
    .nodeWidth(8)
    .nodePadding(8)
    .extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ]);

  const graph = sankeyGenerator(data);
  const { nodes, links } = graph;

  const svg = select(`#${svgId}`);

  // Draw links using our custom path function
  svg
    .selectAll('.sankey-link')
    .data(links)
    .enter()
    .append('path')
    .attr('class', 'sankey-link')
    .attr('d', (d: any) => sankeyLinkPathHorizontal(d, { pathInterpolations: interpolations }));

  // Draw nodes
  svg
    .selectAll('.sankey-node')
    .data(nodes)
    .enter()
    .append('rect')
    .attr('class', 'sankey-node')
    .attr('x', (d: any) => d.x0)
    .attr('y', (d: any) => d.y0)
    .attr('width', (d: any) => d.x1 - d.x0)
    .attr('height', (d: any) => d.y1 - d.y0);

  // Add labels (only for key nodes due to space constraints)
  svg
    .selectAll('.sankey-label')
    .data(nodes.filter((d: any, i: number) => i < 4 || i >= 8)) // Show only source and final destination labels
    .enter()
    .append('text')
    .attr('class', 'sankey-label')
    .attr('x', (d: any) => (d.x0 < width / 2 ? d.x1 + 3 : d.x0 - 3))
    .attr('y', (d: any) => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', (d: any) => (d.x0 < width / 2 ? 'start' : 'end'))
    .style('font-size', '8px')
    .style('font-weight', 'bold')
    .text((d: any) => d.name);
}

// Create all variations
createSankey('interp-2', 2);
createSankey('interp-3', 3);
createSankey('interp-10', 10);
createSankey('interp-50', 50);
