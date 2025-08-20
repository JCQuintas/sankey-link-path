'use client';
import { path } from 'd3-path';
import type { SankeyExtraProperties, SankeyLink } from 'd3-sankey';

export type SankeyLinkPathOptions = {
  /**
   * Number of interpolated points along the path.
   * @default 10, which creates a decently smooth curve.
   */
  pathInterpolations?: number;
};

/**
 * Generates a horizontal Sankey link path.
 *
 * Differently than the `sankeyPathHorizontal` provided by d3-sankey, this function returns
 * a 2D shape instead of a line.
 *
 * @param link - The Sankey link for which to generate the path.
 * @param options - Options for customizing the path generation.
 * @returns A string representing the SVG path data for the link.
 */
export function sankeyLinkPathHorizontal(
  link: SankeyLink<{}, {}>,
  options?: SankeyLinkPathOptions
): string | null;
export function sankeyLinkPathHorizontal<
  N extends SankeyExtraProperties,
  L extends SankeyExtraProperties,
>(link: SankeyLink<N, L>, options?: SankeyLinkPathOptions): string | null {
  if (!link.source || !link.target) {
    throw new Error('Invalid link: source and target are required');
  }
  if (typeof link.source !== 'object' || typeof link.target !== 'object') {
    throw new Error(
      'Invalid link: source and target must be objects. You might need to run the layout generator first.'
    );
  }

  let N = 10;

  // Needs an even number to work correctly.
  if (options && options.pathInterpolations) {
    if (options.pathInterpolations % 2 !== 0) {
      N = options.pathInterpolations + 1;
    } else {
      N = options.pathInterpolations;
    }
  }

  // Min and max X of the link
  const x0 = link.source.x1!;
  const x1 = link.target.x0!;
  // Max and min Y of the link
  const y0 = link.y0!;
  const y1 = link.y1!;
  const halfW = link.width! / 2;
  const targetWidth = link.target.x1! - link.target.x0!;
  const sourceWidth = link.source.x1! - link.source.x0!;
  const limits = {
    x: {
      min: x0 - sourceWidth,
      max: x1 + targetWidth,
    },
  };

  // Center (x) of the link
  const lcx = (x0 + x1) / 2;

  // Define outline of link as path
  const ctx = path();

  const guidePoints: Point[] = [];

  // Creates N points over the line for better interpolation
  // We use 100 to prevent rounding errors
  for (let i = 0; i <= 100; i += 100 / N) {
    const p = cubic(
      i / 100,
      // Start point, source node
      { x: x0, y: y0 },
      // Control points at the center
      { x: lcx, y: y0 },
      { x: lcx, y: y1 },
      // End point, target node
      { x: x1, y: y1 }
    );
    guidePoints.push(p);
  }

  const topPoints: Point[] = [];
  const bottomPoints: Point[] = [];
  // Calculate the angle of every path segment
  // then extrude path to create a 2D shape
  // top    ‾‾\__
  // guide  ‾‾\__
  // bottom ‾‾\__
  for (let i = 0; i < guidePoints.length; i++) {
    // First and last points are horizontal
    const angle =
      i === 0 || i === guidePoints.length - 1
        ? 0
        : getLineAngleRadians(guidePoints[i - 1], guidePoints[i]);

    topPoints.push(movePoint(guidePoints[i]!, angle, halfW, -90, limits));
    bottomPoints.push(movePoint(guidePoints[i]!, angle, halfW, 90, limits));
  }

  // Bottom points are rendered "on the way back"
  // so they need to be reversed.
  bottomPoints.reverse();

  // We add the last point again to close the curve
  topPoints.push(movePoint(guidePoints.at(-1)!, 0, halfW, -90, limits));
  bottomPoints.push(movePoint(guidePoints.at(0)!, 0, halfW, 90, limits));

  // Use catmull-rom to ensure the bezier curve crosses all points.
  const topCurves = catmullRom2bezier(topPoints);
  const bottomCurves = catmullRom2bezier(bottomPoints);

  ctx.moveTo(topPoints[0]!.x, topPoints[0]!.y);
  for (let i = 0; i < topCurves.length; i += 1) {
    ctx.bezierCurveTo(...topCurves[i]!);
  }
  ctx.lineTo(bottomPoints[0]!.x, bottomPoints[0]!.y);
  for (let i = 0; i < bottomCurves.length; i += 1) {
    ctx.bezierCurveTo(...bottomCurves[i]!);
  }
  ctx.lineTo(topPoints[0]!.x, topPoints[0]!.y);

  return ctx.toString();
}

type Point = {
  x: number;
  y: number;
};

function lerp(val: number, p1: Point, p2: Point) {
  const x = p1.x + (p2.x - p1.x) * val;
  const y = p1.y + (p2.y - p1.y) * val;
  return { x, y };
}

function quadratic(val: number, p1: Point, c1: Point, p2: Point) {
  const x = lerp(val, p1, c1);
  const y = lerp(val, c1, p2);
  const l = lerp(val, x, y);
  return { x: l.x, y: l.y };
}

function cubic(val: number, p1: Point, c1: Point, c2: Point, p2: Point) {
  const x = quadratic(val, p1, c1, c2);
  const y = quadratic(val, c1, c2, p2);

  const l = lerp(val, x, y);
  return { x: l.x, y: l.y };
}

function getLineAngleRadians(p1?: Point, p2?: Point) {
  if (!p1 || !p2) {
    return 0; // Default angle if points are not defined
  }

  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function movePoint(
  point: Point,
  angleRadians: number,
  distance: number,
  changeAngle: number,
  limits: { x: { min: number; max: number } }
): Point {
  const radians = angleRadians + (changeAngle * Math.PI) / 180;

  // Calculate the change in x and y coordinates
  const deltaX = distance * Math.cos(radians);
  const deltaY = distance * Math.sin(radians);

  // Calculate the new coordinates
  let newX = point.x + deltaX;
  const newY = point.y + deltaY;

  // Apply limits
  if (newX < limits.x.min) {
    newX = limits.x.min;
  } else if (newX > limits.x.max) {
    newX = limits.x.max;
  }

  return { x: newX, y: newY };
}

const to2 = (v: number) => Number.parseFloat(v.toFixed(2));

function catmullRom2bezier(points: Point[]) {
  const cubicArguments: [number, number, number, number, number, number][] = [];
  for (let i = 0; points.length - 2 > i; i += 1) {
    const p: Point[] = [];
    if (i === 0) {
      p.push({ x: points[i]!.x, y: points[i]!.y });
      p.push({ x: points[i]!.x, y: points[i]!.y });
      p.push({ x: points[i + 1]!.x, y: points[i + 1]!.y });
      p.push({ x: points[i + 2]!.x, y: points[i + 2]!.y });
    } else if (points.length - 2 === i) {
      p.push({ x: points[i - 1]!.x, y: points[i - 1]!.y });
      p.push({ x: points[i]!.x, y: points[i]!.y });
      p.push({ x: points[i + 1]!.x, y: points[i + 1]!.y });
      p.push({ x: points[i + 2]!.x, y: points[i + 2]!.y });
    } else {
      p.push({ x: points[i - 1]!.x, y: points[i - 1]!.y });
      p.push({ x: points[i]!.x, y: points[i]!.y });
      p.push({ x: points[i + 1]!.x, y: points[i + 1]!.y });
      p.push({ x: points[i + 2]!.x, y: points[i + 2]!.y });
    }

    // Catmull-Rom to Cubic Bezier conversion matrix
    //    0       1       0       0
    //  -1/6      1      1/6      0
    //    0      1/6      1     -1/6
    //    0       0       1       0

    const bp: Point[] = [];
    bp.push({ x: p[1]!.x, y: p[1]!.y });
    bp.push({
      x: (-p[0]!.x + 6 * p[1]!.x + p[2]!.x) / 6,
      y: (-p[0]!.y + 6 * p[1]!.y + p[2]!.y) / 6,
    });
    bp.push({ x: (p[1]!.x + 6 * p[2]!.x - p[3]!.x) / 6, y: (p[1]!.y + 6 * p[2]!.y - p[3]!.y) / 6 });
    bp.push({ x: p[2]!.x, y: p[2]!.y });

    cubicArguments.push([
      to2(bp[1]!.x),
      to2(bp[1]!.y),
      to2(bp[2]!.x),
      to2(bp[2]!.y),
      to2(bp[3]!.x),
      to2(bp[3]!.y),
    ]);
  }

  return cubicArguments;
}
