import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SunburstService } from '../../services/sunburst.service';

import * as d3 from 'd3';

@Component({
  selector: 'app-sunburst',
  templateUrl: './sunburst.component.html',
  styleUrl: './sunburst.component.css',
})
export class SunburstComponent implements OnInit {
  constructor(private sunburstService: SunburstService) {}

  @ViewChild('chartContainer', { static: true })
  chartContainer!: ElementRef;

  ngOnInit(): void {
    // Sample data for demonstration
    const data = {
      name: 'Root',
      children: [
        {
          name: 'A',
          children: [
            { name: 'A1', value: 10 },
            { name: 'A2', value: 20 },
          ],
        },
        {
          name: 'B',
          value: 30,
        },
        {
          name: 'C',
          children: [
            { name: 'C1', value: 40 },
            { name: 'C2', value: 50 },
            { name: 'C3', value: 60 },
          ],
        },
        {
          name: 'A',
          children: [
            {
              name: 'A',
              children: [
                { name: 'A1', value: 10 },
                { name: 'A2', value: 20 },
              ],
            },
            {
              name: 'B',
              value: 30,
            },
            {
              name: 'C',
              children: [
                { name: 'C1', value: 40 },
                { name: 'C2', value: 50 },
                { name: 'C3', value: 60 },
              ],
            },
          ],
        },
        {
          name: 'B',
          value: 30,
        },
        {
          name: 'C',
          children: [
            { name: 'C1', value: 40 },
            { name: 'C2', value: 50 },
            { name: 'C3', value: 60 },
          ],
        },
      ],
    };

    // setup the dimensions
    const width = 928;
    const height = width;
    const radius = Math.min(width, height) / 2;

    // create the color scale
    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, data.children.length + 1)
    );

    // create an arc with angle, padding and radius
    const arc = d3
      .arc()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .padAngle((d: any) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d: any) => Math.sqrt(d.y0))
      .outerRadius((d: any) => Math.sqrt(d.y1));

    // compute the layout
    const partition = (data: any) => {
      // calculate the hierarchy and return the partition size
      const hierarchy = d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a: any, b: any) => b.value - a.value);
      return d3.partition().size([2 * Math.PI, radius * radius])(hierarchy);
    };

    const svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('viewBox', [0, 0, width, height]) // made the diagram responsive
      .style('font', '10px sans-serif');
    // .attr('width', width)
    // .attr('height', height)

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const root = partition(data);

    const path = g
      .selectAll('path')
      .data(root.descendants().slice(1)) // removed root node from center
      .join('path')
      .attr('fill', (d: any) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr('fill-opacity', (d: any) =>
        arcVisible(d) ? (d.children ? 0.6 : 0.4) : 1
      )
      .attr('d', (d: any) => arc(d));
    // .on('click', (event, d) => clicked(event, d));

    // Make them clickable if they have children.
    path
      .filter((d: any) => d.children)
      .style('cursor', 'pointer')
      .on('click', clicked);

    const format = d3.format(',d');
    path.append('title').text(
      (d: any) =>
        `${d
          .ancestors()
          .map((d: any) => d.data.name)
          .reverse()
          .join('/')}\n${format(d.value)}`
    );

    const label = svg
      .append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '1em')
      .attr('fill-opacity', (d: any) => 1)
      .attr('transform', (d: any) => labelTransform(d))
      .text((d: any) => d.data.name);

    const parent = svg
      .append('circle')
      .datum(root)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', clicked);

    function arcVisible(d: any) {
      // console.log(
      //   `d.y1 <= 3 : ${d.y1 >= 3} | d.y0 >= 1 - ${d.y0 >= 1} | d.x1 > d.x0 - ${
      //     d.x1 > d.x0
      //   } => ${d.y1 >= 3 && d.y0 >= 1 && d.x1 > d.x0}`
      // );
      return d.y1 >= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }
    // function arcVisible(d: any) {
    //   console.log(d);
    //   return (
    //     d &&
    //     d.y1 !== undefined &&
    //     d.y0 !== undefined &&
    //     d.y1 <= 3 &&
    //     d.y0 >= 1 &&
    //     d.x1 > d.x0
    //   );
    // }

    function labelVisible(d: any) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    // function labelTransform(d: any) {
    //   const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    //   const y = (d.y0 + d.y1) / 2;
    //   console.log(x, y)
    //   return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    // }
    function labelTransform(d: any) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * radius;
      const rotation = x - 90;
      const rotationThreshold = 180;
      const isRotated = x < rotationThreshold ? 0 : 180;
      console.log(d.data.name, x, y);
      return `rotate(${rotation}) translate(${y},${x}) rotate(${isRotated})`;
    }

    function clicked(event: Event, p: any) {
      // Handle zoom or click events here
      parent.datum(p.parent || root);
      root.each(
        (d: any) =>
          (d.target = {
            x0:
              Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            x1:
              Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth),
          })
      );
      const t = svg.transition().duration(750);
      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.

      console.log('Clicked:', p);
    }

    this.chartContainer.nativeElement.appendChild(svg.node());

    this.sunburstService.getData().subscribe((data: any) => {
      // console.log(data)
    });
  }
}
