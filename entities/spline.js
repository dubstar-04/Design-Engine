//https://github.com/Tagussan/BSpline/blob/master/BSpline.js
import { Point } from './point.js'
import { Utils } from '../lib/utils.js'
import { Intersection } from '../lib/intersect.js'

export class Spline {
    constructor(data) {
        //Define Properties         //Associated DXF Value
        this.type = "Spline";
        this.family = "Geometry";
        this.minPoints = 3;
        this.showPreview = true; //show preview of item as its being created
        //this.limitPoints = false;
        //this.allowMultiple = false;
        this.helper_geometry = true; // If true a line will be drawn between points when defining geometry
        this.points = [];
        this.lineWidth = 2; //Thickness
        this.colour = "BYLAYER";
        this.layer = "0";
        this.alpha = 1.0 //Transparancy

        //Spline Specific
        this.degree = 3;
        this.dimension = 2;
        this.baseFunc = this.basisDeg2;
        this.baseFuncRangeInt = 2;

        if (data) {

            if (data.points) {
                this.points = data.points
            }

            if (data.colour) {
                this.colour = data.colour;
            }

            if (data.layer) {
                this.layer = data.layer;
            }


            if (this.degree == 2) {
                this.baseFunc = this.basisDeg2;
                this.baseFuncRangeInt = 2;
            } else if (this.degree == 3) {
                this.baseFunc = this.basisDeg3;
                this.baseFuncRangeInt = 2;
            } else if (this.degree == 4) {
                this.baseFunc = this.basisDeg4;
                this.baseFuncRangeInt = 3;
            } else if (this.degree == 5) {
                this.baseFunc = this.basisDeg5;
                this.baseFuncRangeInt = 3;
            }
        }
    }

    static register() {
        var command = { command: "Spline", shortcut: "SP" };
        return command
    }


    prompt(core) {
        var num = core.scene.inputArray.length;
        var expectedType = [];
        var reset = false;
        var action = false;
        var prompt = [];

        expectedType[0] = ["undefined"];
        prompt[0] = "Pick start point:";

        expectedType[1] = ["object"];
        prompt[1] = "Pick another point or press ESC to quit:";

        expectedType[2] = ["object"];
        prompt[2] = prompt[1];

        var validInput = expectedType[num].includes(typeof core.scene.inputArray[num - 1])

        if (!validInput || num > this.minPoints) {
            core.scene.inputArray.pop()
        } else if (core.scene.inputArray.length === this.minPoints) {
            action = true;
            //reset = true
        }

        return [prompt[core.scene.inputArray.length], reset, action, validInput]
    }

    draw(ctx, scale, core) {

        if (this.points.length > 2) {

            if (!core.LM.layerVisible(this.layer)) {
                return
            }

            var colour = this.colour;

            if (this.colour === "BYLAYER") {
                colour = core.LM.getLayerByName(this.layer).colour
            }

            try { // HTML Canvas
                ctx.strokeStyle = colour;
                ctx.lineWidth = this.lineWidth / scale;
                ctx.beginPath()
            } catch { // Cairo
                ctx.setLineWidth(this.lineWidth / scale);
                ctx.setSourceRGB(0.8, 0.0, 0.0);
            }
            //ctx.moveTo(this.points[0].x, this.points[0].y);

            var oldx, oldy, x, y;
            oldx = this.calcAt(0)[0];
            oldy = this.calcAt(0)[1];
            for (var t = 0; t <= 1; t += 0.01) {
                ctx.moveTo(oldx, oldy);
                //console.log(oldx, oldy)
                var interpol = this.calcAt(t);
                x = interpol[0];
                y = interpol[1];
                ctx.lineTo(x, y);
                oldx = x;
                oldy = y;
            }

            /*
                  var i;
                   for (i = 1; i < this.points.length - 2; i ++)
                   {
                      var xc = (this.points[i].x + this.points[i + 1].x) / 2;
                      var yc = (this.points[i].y + this.points[i + 1].y) / 2;
                      ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
                   }
                 // curve through the last two points
                 ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, this.points[i+1].x, this.points[i+1].y);
        */


            ctx.stroke()
        }
    }

    dxf() {

        var closed = (this.points[0].x === this.points[this.points.length - 1].x && this.points[0].y === this.points[this.points.length - 1].y);
        var control_points = this.controlPoints();
        var dxfitem = ""
        var data = dxfitem.concat(
            "0",
            "\n", "SPLINE",
            //"\n", "5", //HANDLE
            //"\n", "DA",
            "\n", "100", //Subclass data marker
            "\n", "AcDbEntity",
            "\n", "8", //LAYERNAME
            "\n", this.layer,
            "\n", "100", //Subclass data marker
            "\n", "AcDbSpline",
            //"\n", "71", //Degree of the spline curve
            //"\n", "",
            //"\n", "72", //Number of knots
            //"\n", "",
            "\n", "73", //Number of control points
            "\n", this.points.length,
            //"\n", "73", //Number of fit points
            //"\n", "",
            "\n", "210", //X
            "\n", "0",
            "\n", "220", //Y
            "\n", "0",
            "\n", "230", //Z
            "\n", "0",
            "\n", "39", //Line Width
            "\n", this.lineWidth,
            control_points,
            "\n", "0"
        )
        console.log(" spline.js - DXF Data:" + data)
        return data
    }

    controlPoints() {

        var control_point_data = "";
        for (var i = 0; i < this.points.length; i++) {

            control_point_data = control_point_data.concat(

                "\n", "10", //X
                "\n", this.points[i].x,
                "\n", "20", //Y
                "\n", this.points[i].y,
                "\n", "30", //Z
                "\n", "0"

            )
        }

        return control_point_data;
    }

    length() { }

    midPoint(x, x1, y, y1) {

        var midX = (x + x1) / 2
        var midY = (y + y1) / 2

        var midPoint = new Point(midX, midY);

        return midPoint;

    }


    snaps(mousePoint, delta, core) {

        var snaps = [];

        if (core.settings.endSnap) {
            // End points for each segment
            for (var i = 0; i < this.points.length; i++) {
                snaps.push(this.points[i]);
            }
        }

        if (core.settings.midSnap) {
            for (var i = 1; i < this.points.length; i++) {

                var start = this.points[i - 1];
                var end = this.points[i]

                snaps.push(this.midPoint(start.x, end.x, start.y, end.y));
            }
        }

        if (core.settings.nearestSnap) {
            var closest = this.closestPoint(mousePoint, this.points[i - 1], this.points[i])

            // Crude way to snap to the closest point or a node
            if (closest[1] < delta / 10) {
                snaps.push(closest[0])
            }
        }

        return snaps;
    }

    closestPoint(P, A, B) {
        //find the closest point on the straight line
        var APx = P.x - A.x;
        var APy = P.y - A.y;
        var ABx = B.x - A.x;
        var ABy = B.y - A.y;

        var magAB2 = ABx * ABx + ABy * ABy;
        var ABdotAP = ABx * APx + ABy * APy;
        var t = ABdotAP / magAB2;


        // check if the point is < start or > end
        if (t > 0 && t < 1) {

            var x = A.x + ABx * t
            var y = A.y + ABy * t

        }

        var closest = new Point(x, y);
        var distance = Utils.distBetweenPoints(P.x, P.y, x, y)
        //console.log(distance);

        return [closest, distance]

    }

    extremes() {

        var x_values;
        var y_values;

        for (var i = 0; i < this.points.length; i++) {
            x_values.push(this.points[i].x);
            y_values.push(this.points[i].y);
        }

        var xmin = Math.max.apply(Math, x_values)
        var xmax = Math.max.apply(Math, x_values)
        var ymin = Math.min.apply(Math, y_values)
        var ymax = Math.max.apply(Math, y_values)

        return [xmin, xmax, ymin, ymax]

    }


    seqAt(dim) {
        var points = this.points;
        var margin = this.degree + 1;

        return function (n) {
            if (n < margin) {
                return !dim ? points[0].x : points[0].y;
            } else if (points.length + margin <= n) {
                return !dim ? points[points.length - 1].x : points[points.length - 1].y;
            } else {
                return !dim ? points[n - margin].x : points[n - margin].y;
            }
        }

    };

    basisDeg2(x) {
        if (-0.5 <= x && x < 0.5) {
            return 0.75 - x * x;
        } else if (0.5 <= x && x <= 1.5) {
            return 1.125 + (-1.5 + x / 2.0) * x;
        } else if (-1.5 <= x && x < -0.5) {
            return 1.125 + (1.5 + x / 2.0) * x;
        } else {
            return 0;
        }
    };

    basisDeg3(x) {
        if (-1 <= x && x < 0) {
            return 2.0 / 3.0 + (-1.0 - x / 2.0) * x * x;
        } else if (1 <= x && x <= 2) {
            return 4.0 / 3.0 + x * (-2.0 + (1.0 - x / 6.0) * x);
        } else if (-2 <= x && x < -1) {
            return 4.0 / 3.0 + x * (2.0 + (1.0 + x / 6.0) * x);
        } else if (0 <= x && x < 1) {
            return 2.0 / 3.0 + (-1.0 + x / 2.0) * x * x;
        } else {
            return 0;
        }
    };

    basisDeg4(x) {
        if (-1.5 <= x && x < -0.5) {
            return 55.0 / 96.0 + x * (-(5.0 / 24.0) + x * (-(5.0 / 4.0) + (-(5.0 / 6.0) - x / 6.0) * x));
        } else if (0.5 <= x && x < 1.5) {
            return 55.0 / 96.0 + x * (5.0 / 24.0 + x * (-(5.0 / 4.0) + (5.0 / 6.0 - x / 6.0) * x));
        } else if (1.5 <= x && x <= 2.5) {
            return 625.0 / 384.0 + x * (-(125.0 / 48.0) + x * (25.0 / 16.0 + (-(5.0 / 12.0) + x / 24.0) * x));
        } else if (-2.5 <= x && x <= -1.5) {
            return 625.0 / 384.0 + x * (125.0 / 48.0 + x * (25.0 / 16.0 + (5.0 / 12.0 + x / 24.0) * x));
        } else if (-1.5 <= x && x < 1.5) {
            return 115.0 / 192.0 + x * x * (-(5.0 / 8.0) + x * x / 4.0);
        } else {
            return 0;
        }
    };

    basisDeg5(x) {
        if (-2 <= x && x < -1) {
            return 17.0 / 40.0 + x * (-(5.0 / 8.0) + x * (-(7.0 / 4.0) + x * (-(5.0 / 4.0) + (-(3.0 / 8.0) - x / 24.0) * x)));
        } else if (0 <= x && x < 1) {
            return 11.0 / 20.0 + x * x * (-(1.0 / 2.0) + (1.0 / 4.0 - x / 12.0) * x * x);
        } else if (2 <= x && x <= 3) {
            return 81.0 / 40.0 + x * (-(27.0 / 8.0) + x * (9.0 / 4.0 + x * (-(3.0 / 4.0) + (1.0 / 8.0 - x / 120.0) * x)));
        } else if (-3 <= x && x < -2) {
            return 81.0 / 40.0 + x * (27.0 / 8.0 + x * (9.0 / 4.0 + x * (3.0 / 4.0 + (1.0 / 8.0 + x / 120.0) * x)));
        } else if (1 <= x && x < 2) {
            return 17.0 / 40.0 + x * (5.0 / 8.0 + x * (-(7.0 / 4.0) + x * (5.0 / 4.0 + (-(3.0 / 8.0) + x / 24.0) * x)));
        } else if (-1 <= x && x < 0) {
            return 11.0 / 20.0 + x * x * (-(1.0 / 2.0) + (1.0 / 4.0 + x / 12.0) * x * x);
        } else {
            return 0;
        }
    };

    getInterpol(seq, t) {
        var f = this.baseFunc;
        var rangeInt = this.baseFuncRangeInt;
        var tInt = Math.floor(t);
        var result = 0;
        for (var i = tInt - rangeInt; i <= tInt + rangeInt; i++) {
            result += seq(i) * f(t - i);
        }
        return result;
    };

    calcAt(t) {
        t = t * ((this.degree + 1) * 2 + this.points.length); //t must be in [0,1]
        if (this.dimension === 2) {
            return [this.getInterpol(this.seqAt(0), t), this.getInterpol(this.seqAt(1), t)];
        } else if (this.dimension === 3) {
            return [this.getInterpol(this.seqAt(0), t), this.getInterpol(this.seqAt(1), t), this.getInterpol(this.seqAt(2), t)];
        } else {
            var res = [];
            for (var i = 0; i < this.dimension; i++) {
                res.push(this.getInterpol(this.seqAt(i), t));
            }
            return res;
        }
    };


    within(selection_extremes, core) {

        return false;
    }

    touched(selection_extremes, core) {

        return false;
    }
}
