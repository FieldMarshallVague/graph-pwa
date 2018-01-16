import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import * as jp from '../plumb';
import { PlumbDefaults, PlumbDefaultsFactory } from '../plumb/plumb-defaults';

declare var jsPlumb: any;

@Component({
  selector: 'app-graph-canvas',
  templateUrl: './graph-canvas.component.html',
  styleUrls: ['./graph-canvas.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GraphCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvas;

  jpInstance: jp.JsPlumbInstance;
  jpDefaults: PlumbDefaults = this.plumbDefaults.getDefaults();

  constructor(private plumbDefaults: PlumbDefaultsFactory) {}

  ngOnInit() {}

  ngAfterViewInit() {
    jsPlumb.ready(() => {
      // this.jpDefaults.Container = this.canvas.nativeElement;
      // this.jpInstance = jsPlumb.getInstance(this.jpDefaults);

      this.renderGraph();
    });
  }

  renderGraph() {
      const sourceAnchors = [
          [0.2, 0, 0, -1, 0, 0, 'foo'],
          [1, 0.2, 1, 0, 0, 0, 'bar'],
          [0.8, 1, 0, 1, 0, 0, 'baz'],
          [0, 0.8, -1, 0, 0, 0, 'qux']
        ],
        targetAnchors = [
          [0.6, 0, 0, -1],
          [1, 0.6, 1, 0],
          [0.4, 1, 0, 1],
          [0, 0.4, -1, 0]
        ],
        exampleColor = '#00f',
        exampleDropOptions = {
          tolerance: 'touch',
          hoverClass: 'dropHover',
          activeClass: 'dragActive'
        },
        connector = [
          'Bezier',
          { cssClass: 'connectorClass', hoverClass: 'connectorHoverClass' }
        ],
        connectorStyle = {
          gradient: {
            stops: [[0, exampleColor], [0.5, '#09098e'], [1, exampleColor]]
          },
          strokeWidth: 5,
          stroke: exampleColor
        },
        hoverStyle = {
          stroke: '#449999'
        },
        overlays = [['Diamond', { fill: '#09098e', width: 15, length: 15 }]],
        endpoint = [
          'Dot',
          {
            cssClass: 'endpointClass',
            radius: 10,
            hoverClass: 'endpointHoverClass'
          }
        ],
        endpointStyle = { fill: exampleColor },
        anEndpoint = {
          endpoint: endpoint,
          paintStyle: endpointStyle,
          hoverPaintStyle: { fill: '#449999' },
          isSource: true,
          isTarget: true,
          maxConnections: -1,
          connector: connector,
          connectorStyle: connectorStyle,
          connectorHoverStyle: hoverStyle,
          connectorOverlays: overlays
        };

      const instance = jsPlumb.getInstance({
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        Container: 'canvas'
      });

      // suspend drawing and initialise.
      instance.batch(function() {
        const connections = {
            dynamicWindow1: ['dynamicWindow4'],
            dynamicWindow3: ['dynamicWindow1'],
            dynamicWindow5: ['dynamicWindow3'],
            dynamicWindow6: ['dynamicWindow5'],
            dynamicWindow2: ['dynamicWindow6'],
            dynamicWindow4: ['dynamicWindow2']
          },
          endpoints = {},
          // ask jsPlumb for a selector for the window class
          divsWithWindowClass = jsPlumb.getSelector('.dynamic-demo .window');

        // add endpoints to all of these - one for source, and one for target, configured so they don't sit
        // on top of each other.
        for (let i = 0; i < divsWithWindowClass.length; i++) {
          const id = instance.getId(divsWithWindowClass[i]);
          endpoints[id] = [
            // note the three-arg version of addEndpoint; lets you re-use some common settings easily.
            instance.addEndpoint(id, anEndpoint, { anchor: sourceAnchors }),
            instance.addEndpoint(id, anEndpoint, { anchor: targetAnchors })
          ];
        }
        // then connect everything using the connections map declared above.
        for (const e in endpoints) {
          if (connections[e]) {
            for (let j = 0; j < connections[e].length; j++) {
              instance.connect({
                source: endpoints[e][0],
                target: endpoints[connections[e][j]][1]
              });
            }
          }
        }

        // bind click listener; delete connections on click
        instance.bind('click', function(conn) {
          instance.deleteEndpoint(conn.id);
        });

        // bind beforeDetach interceptor: will be fired when the click handler above calls detach, and the user
        // will be prompted to confirm deletion.
        instance.bind('beforeDetach', function(conn) {
          return confirm('Delete connection?');
        });

        //
        // configure ".window" to be draggable. 'getSelector' is a jsPlumb convenience method that allows you to
        // write library-agnostic selectors; you could use your library's selector instead, eg.
        //
        // $(".window")  		jquery
        // $$(".window") 		mootools
        // Y.all(".window")		yui3
        //
        instance.draggable(divsWithWindowClass);

        jsPlumb.fire('jsPlumbDemoLoaded', instance);
      });
  }
}
