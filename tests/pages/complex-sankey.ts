import { sankey } from 'd3-sankey';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
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
  nodes: [
    { name: 'Coal' },
    { name: 'Natural Gas' },
    { name: 'Nuclear' },
    { name: 'Hydro' },
    { name: 'Wind' },
    { name: 'Solar' },
    { name: 'Electricity' },
    { name: 'Industry' },
    { name: 'Commercial' },
    { name: 'Residential' },
    { name: 'Transportation' },
  ],
  links: [
    { source: 0, target: 6, value: 124.729 },
    { source: 1, target: 6, value: 65.366 },
    { source: 2, target: 6, value: 96.132 },
    { source: 3, target: 6, value: 23.725 },
    { source: 4, target: 6, value: 17.423 },
    { source: 5, target: 6, value: 4.253 },
    { source: 6, target: 7, value: 113.308 },
    { source: 6, target: 8, value: 75.888 },
    { source: 6, target: 9, value: 84.904 },
    { source: 6, target: 10, value: 12.426 },
    { source: 1, target: 7, value: 23.675 },
    { source: 1, target: 8, value: 18.423 },
    { source: 1, target: 9, value: 46.477 },
    { source: 0, target: 7, value: 8.515 },
  ],
};

const width = 1000;
const height = 700;
const margin = { top: 20, right: 30, bottom: 20, left: 30 };

const sankeyGenerator = sankey<NodeData, LinkData>()
  .nodeWidth(20)
  .nodePadding(15)
  .extent([
    [margin.left, margin.top],
    [width - margin.right, height - margin.bottom],
  ]);

const graph = sankeyGenerator(data);
const { nodes, links } = graph;

const svg = select('#complex-sankey');
const color = scaleOrdinal(schemeCategory10);

// Draw links using our custom path function
svg
  .selectAll('.sankey-link')
  .data(links)
  .enter()
  .append('path')
  .attr('class', 'sankey-link')
  .attr('d', (d: any) => sankeyLinkPathHorizontal(d))
  .style('fill', (d: any) => color(d.source.name) as string);

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
  .attr('height', (d: any) => d.y1 - d.y0)
  .style('fill', (d: any) => color(d.name) as string);

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
  .style('font-size', '12px')
  .style('font-weight', 'bold')
  .text((d: any) => d.name);
