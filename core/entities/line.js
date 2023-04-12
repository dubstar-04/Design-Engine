import {Point} from './point.js';
import {Utils} from '../lib/utils.js';
import {Strings} from '../lib/strings.js';
import {Colours} from '../lib/colours.js';
import {Entity} from './entity.js';

export class Line extends Entity {
  constructor(data) {
    super(data);

    if (data) {
      if (data.points) {
        // clear points
        this.points = [];

        const startPoint = data.points.at(-2);
        const endPoint = data.points.at(-1);
        this.points.push(new Point(startPoint.x, startPoint.y));
        this.points.push(new Point(endPoint.x, endPoint.y));
      }
    }
  }


  static register() {
    const command = {command: 'Line', shortcut: 'L', type: 'Entity'};
    return command;
  }

  prompt(core) {
    const num = core.scene.inputArray.length;
    const expectedType = [];
    const reset = false;
    let action = false;
    let validInput = true;
    const prompt = [];

    expectedType[0] = ['undefined'];
    prompt[0] = Strings.Input.START;

    expectedType[1] = ['object'];
    prompt[1] = Strings.Input.POINTORQUIT;

    expectedType[2] = ['object', 'number'];
    prompt[2] = prompt[1];

    expectedType[3] = ['object', 'number'];
    prompt[3] = prompt[1];

    validInput = expectedType[num].includes(typeof core.scene.inputArray[num - 1]);

    if (!validInput || num > this.minPoints) {
      core.scene.inputArray.pop();
    }

    if (core.scene.inputArray.length === this.minPoints) {
      action = true;
    }

    return {promptInput: prompt[core.scene.inputArray.length], resetBool: reset, actionBool: action, validInput: validInput};
  }

  draw(ctx, scale, core, colour) {
    try { // HTML Canvas
      ctx.strokeStyle = colour;
      ctx.lineWidth = this.lineWidth / scale;
      ctx.beginPath();
    } catch { // Cairo
      ctx.setLineWidth(this.lineWidth / scale);
      const rgbColour = Colours.hexToScaledRGB(colour);
      ctx.setSourceRGB(rgbColour.r, rgbColour.g, rgbColour.b);
    }

    ctx.moveTo(this.points[0].x, this.points[0].y);
    ctx.lineTo(this.points[1].x, this.points[1].y);
    ctx.stroke();
  }

  dxf() {
    const dxfitem = '';
    const data = dxfitem.concat(
        '0',
        '\n', 'LINE',
        // "\n", "5", //HANDLE
        // "\n", "DA",
        '\n', '8', // LAYERNAME
        '\n', this.layer,
        '\n', '10', // X
        '\n', this.points[0].x,
        '\n', '20', // Y
        '\n', this.points[0].y,
        '\n', '30', // Z
        '\n', '0.0',
        '\n', '11', // X
        '\n', this.points[1].x,
        '\n', '21', // Y
        '\n', this.points[1].y, // Y
        '\n', '31', // Z
        '\n', '0.0',
    );
    return data;
  }

  trim(points, core) {
    function trimOneEnd(intersectPnts, line) {
      let originPoint;
      let destinationPoint;
      const validPoints = [];

      for (let i = 0; i < line.points.length; i++) {
        for (let j = 0; j < intersectPnts.length; j++) {
          if (betweenPoints(core.mouse, [intersectPnts[j], line.points[i]], false)) {
            if (Math.round(intersectPnts[j].distance(line.points[i]) * 100) / 100 < Math.round(line.points[0].distance(line.points[1]) * 100) / 100) {
              originPoint = i;
              validPoints.push(j);
            }
          }
        }
      }

      if (typeof validPoints !== 'undefined') {
        let dist = Number.POSITIVE_INFINITY;

        for (let j = 0; j < validPoints.length; j++) {
          if (line.points[originPoint].distance(intersectPnts[validPoints[j]]) < dist) {
            dist = line.points[originPoint].distance(intersectPnts[validPoints[j]]);
            destinationPoint = validPoints[j];
          }
        }
      }

      if (typeof destinationPoint !== 'undefined') {
        line.points[originPoint] = intersectPnts[destinationPoint];
      }
    }

    function trimBetween(pnts, line) {
      const a = Math.round(line.points[0].distance(pnts[0]));
      const b = Math.round(line.points[0].distance(pnts[1]));
      const c = Math.round(line.points[1].distance(pnts[0]));
      const d = Math.round(line.points[1].distance(pnts[1]));

      if (a === 0 && d === 0 || b === 0 && c === 0) {
      } else {
        const data = {
          points: [pnts[a < b ? 1 : 0], line.points[1]],
          colour: line.colour,
          layer: line.layer,
          lineWidth: line.lineWidth,
        };

        core.scene.addToScene('Line', data, false);

        if (a < b) {
          line.points[1] = pnts[0];
        } else {
          line.points[1] = pnts[1];
        }
      }
    }

    function betweenPoints(mousePnt, pntsArray, returnPoints) {
      for (let i = 0; i < pntsArray.length - 1; i++) {
        const a = pntsArray[i].distance(mousePnt);
        const b = pntsArray[i + 1].distance(mousePnt);
        const c = pntsArray[i].distance(pntsArray[i + 1]);

        if (Math.round(a + b) === Math.round(c)) {
          if (returnPoints) {
            return [pntsArray[i], pntsArray[i + 1]];
          }

          return true;
        }
      }
    }

    if (points.length > 1) {
      // is the mouse between two points
      const pnts = betweenPoints(core.mouse, points, true);

      if (typeof pnts !== 'undefined') {
        trimBetween(pnts, this);
      } else {
        trimOneEnd(points, this);
      }
    } else {
      trimOneEnd(points, this);
    }
  }

  extend(points, core) {
    let originPoint;
    let destinationPoint;

    // Find which end is closer to the mouse
    // ToDo: Pass the mouse location in rather than needing a ref to core.
    if (this.points[0].distance(core.mouse) < this.points[1].distance(core.mouse)) {
      originPoint = 0;
    } else {
      originPoint = 1;
    }

    // check if any of the points are valid
    const validPoints = [];

    for (let i = 0; i < points.length; i++) {
      if (Math.round(this.points[originPoint].angle(points[i])) === Math.round(this.points[originPoint ? 0 : 1].angle(this.points[originPoint]))) {
        // if the destination point is different than the origin add it to the array of valid points
        if (Math.round(this.points[originPoint].distance(points[i])) !== 0) {
          validPoints.push(i);
        }
      }
    }

    if (validPoints.length > 1) {
      let dist = Number.POSITIVE_INFINITY;

      for (let j = 0; j < validPoints.length; j++) {
        if (this.points[originPoint].distance(points[validPoints[j]]) < dist) {
          dist = this.points[originPoint].distance(points[validPoints[j]]);
          destinationPoint = validPoints[j];
        }
      }
    } else if (validPoints.length === 1) {
      // only one valid point
      destinationPoint = validPoints[0];
    }

    if (destinationPoint !== undefined) {
      this.points[originPoint] = points[destinationPoint];
    }
  }

  intersectPoints() {
    return {
      start: this.points[0],
      end: this.points[1],
    };
  }

  length() {
    const A = (this.points[0].x - this.points[1].x);
    const B = (this.points[0].y - this.points[1].y);
    const ASQ = Math.pow(A, 2);
    const BSQ = Math.pow(B, 2);
    const dist = Math.sqrt(ASQ + BSQ);

    return dist;
  }

  midPoint() {
    const midPoint = this.points[0].midPoint(this.points[1]);
    return midPoint;
  }

  snaps(mousePoint, delta, core) {
    const snaps = [];

    if (core.settings.endsnap) {
      const start = new Point(this.points[0].x, this.points[0].y);
      const end = new Point(this.points[1].x, this.points[1].y);
      snaps.push(start, end);
    }

    if (core.settings.midsnap) {
      snaps.push(this.midPoint());
    }

    if (core.settings.nearestsnap) {
      const closest = this.closestPoint(mousePoint, start, end);

      // Crude way to snap to the closest point or a node
      if (closest[1] < delta / 10) {
        snaps.push(closest[0]);
      }
    }

    return snaps;
  }

  closestPoint(P) {
    // find the closest point on the straight line
    const A = new Point(this.points[0].x, this.points[0].y);
    const B = new Point(this.points[1].x, this.points[1].y);

    const pnt = P.perpendicular(A, B);
    if (pnt === null) {
      return [P, Infinity];
    }

    const distance = Utils.distBetweenPoints(P.x, P.y, pnt.x, pnt.y);
    return [pnt, distance];
  }

  extremes() {
    const xmin = Math.min(this.points[0].x, this.points[1].x);
    const xmax = Math.max(this.points[0].x, this.points[1].x);
    const ymin = Math.min(this.points[0].y, this.points[1].y);
    const ymax = Math.max(this.points[0].y, this.points[1].y);

    return [xmin, xmax, ymin, ymax];
  }
}
