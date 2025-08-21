import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { select } from 'd3-selection';
import { naiveSankeyLinkPathHorizontal, sankeyLinkPathHorizontal } from '../../src';

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

function createSankey(
  svgId: string,
  data: { nodes: NodeData[]; links: LinkData[] },
  fn: (s: any) => string | null,
  width: number,
  height: number
) {
  const margin = { top: 20, right: 40, bottom: 20, left: 40 };

  const sankeyGenerator = sankey<NodeData, LinkData>()
    .nodeWidth(15)
    .nodePadding(15)
    .extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ]);

  const graph = sankeyGenerator(data);
  const { nodes, links } = graph;

  const svg = select(`#${svgId}`);
  svg.selectAll('*').remove(); // Clear previous content
  svg.attr('width', width).attr('height', height);

  const parent = document.querySelector(`#${svgId}`)?.parentElement;
  if (parent) {
    parent.style.width = `${width + 100}px`;
  }

  const linkClass = `${svgId}-link`;

  // Draw links using D3's sankeyLinkHorizontal
  svg
    .selectAll(`.${linkClass}`)
    .data(links)
    .enter()
    .append('path')
    .attr('class', linkClass)
    .attr('class', 'sankey-link')
    .attr('d', d => fn(d))
    .style('stroke-width', (d: any) => Math.max(1, d.width));

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
    .style('font-size', '10px')
    .style('font-weight', 'bold')
    .text((d: any) => d.name);

  return { nodes, links };
}

// Create all comparisons
const width = 200;
const height = 400;
createSankey('d3-sankey', data, sankeyLinkHorizontal(), width, height);
createSankey('custom-sankey', data, sankeyLinkPathHorizontal, width, height);
createSankey('naive-sankey', data, naiveSankeyLinkPathHorizontal, width, height);
