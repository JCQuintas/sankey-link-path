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

const width = 800;
const height = 600;
const margin = { top: 20, right: 30, bottom: 20, left: 30 };

const sankeyGenerator = sankey<NodeData, LinkData>()
  .nodeWidth(15)
  .nodePadding(10)
  .extent([
    [margin.left, margin.top],
    [width - margin.right, height - margin.bottom],
  ]);

const graph = sankeyGenerator(data);
const { nodes, links } = graph;

const svg = select('#simple-sankey');

// Draw links using our custom path function
svg
  .selectAll('.sankey-link')
  .data(links)
  .enter()
  .append('path')
  .attr('class', 'sankey-link')
  .attr('d', (d: any) => sankeyLinkPathHorizontal(d));

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

// Add labels
svg
  .selectAll('.sankey-label')
  .data(nodes)
  .enter()
  .append('text')
  .attr('class', 'sankey-label')
  .attr('x', (d: any) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
  .attr('y', (d: any) => (d.y1 + d.y0) / 2)
  .attr('dy', '0.35em')
  .attr('text-anchor', (d: any) => (d.x0 < width / 2 ? 'start' : 'end'))
  .text((d: any) => d.name);
