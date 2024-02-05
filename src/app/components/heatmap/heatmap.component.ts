import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';

interface YourDataType {
  [key: string]: string | number;
}

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.css',
})
export class HeatmapComponent implements OnInit, AfterViewInit {
  @ViewChild('myDataviz', { static: false }) myDataviz!: ElementRef;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.drawHeatmap();
  }

  drawHeatmap(): void {
    const margin = { top: 80, right: 25, bottom: 30, left: 40 };
    const width = 450 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3
      .select(this.myDataviz.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv(
      'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv'
    ).then((data: YourDataType[]) => {
      const myGroups = Array.from(
        new Set(data.map((d) => d['group'] as string))
      );
      const myVars = Array.from(
        new Set(data.map((d) => d['variable'] as string))
      );

      const x = d3.scaleBand().range([0, width]).domain(myGroups).padding(0.05);
      svg
        .append('g')
        .style('font-size', 15)
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select('.domain')
        .remove();

      const y = d3.scaleBand().range([height, 0]).domain(myVars).padding(0.05);
      svg
        .append('g')
        .style('font-size', 15)
        .call(d3.axisLeft(y).tickSize(0))
        .select('.domain')
        .remove();

      const myColor = d3
        .scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([1, 100]);

      const tooltip = d3
        .select(this.myDataviz.nativeElement)
        .append('div')
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '5px');

      const mouseover = (event: MouseEvent, d: YourDataType) => {
        tooltip.style('opacity', 1);
        d3.select(event.currentTarget as SVGRectElement)
          .style('stroke', 'black')
          .style('opacity', 1);
      };

      const mousemove = (event: MouseEvent, d: YourDataType) => {
        tooltip
          .html(`The exact value of this cell is: ${d['value']}`)
          .style(
            'left',
            `${d3.pointer(event, this.myDataviz.nativeElement)[0] + 70}px`
          )
          .style(
            'top',
            `${d3.pointer(event, this.myDataviz.nativeElement)[1]}px`
          );
      };

      const mouseleave = (event: MouseEvent, d: YourDataType) => {
        tooltip.style('opacity', 0);
        d3.select(event.currentTarget as SVGRectElement)
          .style('stroke', 'none')
          .style('opacity', 0.8);
      };

      svg
        .selectAll()
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d) => String(x(d['group'] as string)))
        .attr('y', (d) => String(y(String(d['variable']))))
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .style('fill', (d) => myColor(d['value'] as number))
        .style('stroke-width', 4)
        .style('stroke', 'none')
        .style('opacity', 0.8)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave);
    });
  }
}
