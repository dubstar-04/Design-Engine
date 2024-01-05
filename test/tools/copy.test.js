import {Core} from '../../core/core/core.js';
import {DesignCore} from '../../core/designCore.js';
import {Point} from '../../core/entities/point.js';
import {Copy} from '../../core/tools/copy.js';

const core = new Core();

test('Test Copy.action', () => {
  // Add items to scene
  DesignCore.Scene.addItem('Line', {points: [new Point(), new Point(0, 10)]});
  DesignCore.Scene.addItem('Circle', {points: [new Point(), new Point(0, 10)]});
  DesignCore.Scene.addItem('Polyline', {points: [new Point(), new Point(0, 10)]});
  DesignCore.Scene.addItem('Arc', {points: [new Point(), new Point(0, 10), new Point(10, 0)]});
  DesignCore.Scene.addItem('Rectangle', {points: [new Point(), new Point(0, 10)]});
  DesignCore.Scene.addItem('Text', {points: [new Point(), new Point(0, 10)], height: 10, rotation: 0, string: 'text test'});

  // Add items to selection set
  for (let i = 0; i < DesignCore.Scene.items.length; i++) {
    DesignCore.Scene.selectionManager.addToSelectionSet(i);
  }

  /**
   * Copy by x = 10 y = 0
   */

  const copy = new Copy();

  // set base point
  copy.points.push(new Point());

  // set destination point
  copy.points.push(new Point(10, 0));

  // Perform Copy
  copy.action();

  expect(DesignCore.Scene.items.length).toBe(12);

  for (let i = 6; i < DesignCore.Scene.items.length; i++) {
    expect(DesignCore.Scene.items[i].points[0].x).toBe(10);
    expect(DesignCore.Scene.items[i].points[0].y).toBe(0);
  }
});
