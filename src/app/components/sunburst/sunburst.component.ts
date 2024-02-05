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
      ],
    };

    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, data.children.length + 1)
    );

    const arc = d3
      .arc()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .innerRadius((d: any) => Math.sqrt(d.y0))
      .outerRadius((d: any) => Math.sqrt(d.y1));

    const partition = (data: any) => {
      const root = d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a: any, b: any) => b.value - a.value);
      return d3.partition().size([2 * Math.PI, radius * radius])(root);
    };

    const svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('font', '10px sans-serif');

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const root = partition(data);

    g.selectAll('path')
      .data(root.descendants())
      .enter()
      .append('path')
      .attr('fill', (d: any) => color((d.children ? d : d.parent).data.name))
      .attr('fill-opacity', (d: any) =>
        arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 100
      )
      .attr('d', (d: any) => arc(d))
      .on('click', (event, d) => this.clicked(event, d));

    // function arcVisible(d: any) {
    //   return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    // }
    function arcVisible(d: any) {
      return d && d.y1 !== undefined && d.y0 !== undefined && d.x1 > d.x0;
    }

    this.chartContainer.nativeElement.appendChild(svg.node());

    this.sunburstService.getData().subscribe((data: any) => {
      // console.log(data)
    });
  }

  clicked(event: Event, p: any) {
    // Handle zoom or click events here
    console.log('Clicked:', p);
  }
}
