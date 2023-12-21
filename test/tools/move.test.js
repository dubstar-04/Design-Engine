import {Core} from '../../core/core.js';
import {Point} from '../../core/entities/point.js';
import {Move} from '../../core/tools/move.js';

const core = new Core();

test('Test Move.action', () => {
  // Add items to scene
  Core.Scene.addItem('Line', {points: [new Point(), new Point(0, 10)]});
  Core.Scene.addItem('Circle', {points: [new Point(), new Point(0, 10)]});
  Core.Scene.addItem('Polyline', {points: [new Point(), new Point(0, 10)]});
  Core.Scene.addItem('Arc', {points: [new Point(), new Point(0, 10), new Point(10, 0)]});
  Core.Scene.addItem('Rectangle', {points: [new Point(), new Point(0, 10)]});
  Core.Scene.addItem('Text', {points: [new Point(), new Point(0, 10)], height: 10, rotation: 0, string: 'text test'});

  // Add items to selection set
  for (let i = 0; i < Core.Scene.items.length; i++) {
    Core.Scene.selectionManager.addToSelectionSet(i);
  }

  /**
   * move by x = 10 y = 0
   */

  const move = new Move();

  // set base point
  move.points.push(new Point());

  // set destination point
  move.points.push(new Point(10, 0));

  // Perform move
  move.action();

  for (let i = 0; i < Core.Scene.items.length; i++) {
    expect(Core.Scene.items[i].points[0].x).toBe(10);
    expect(Core.Scene.items[i].points[0].y).toBe(0);
  }


  /**
   * move by x = 0 y = 10
   */
  // reset move points
  move.points = [];

  // set base point
  move.points.push(new Point());

  // set destination point
  move.points.push(new Point(0, 10));

  // Perform move
  move.action();

  for (let i = 0; i < Core.Scene.items.length; i++) {
    expect(Core.Scene.items[i].points[0].x).toBe(10);
    expect(Core.Scene.items[i].points[0].y).toBe(10);
  }

  /**
   * move by x = -10 y = -10
   */
  // reset move points
  move.points = [];

  // set base point
  move.points.push(new Point());

  // set destination point
  move.points.push(new Point(-10, -10));

  // Perform move
  move.action();

  for (let i = 0; i < Core.Scene.items.length; i++) {
    expect(Core.Scene.items[i].points[0].x).toBe(0);
    expect(Core.Scene.items[i].points[0].y).toBe(0);
  }
});
