
import {Text} from '../../core/entities/text.js';

test('Test Text.getRotation', () => {
  const text = new Text();
  text.setRotation(3.14159);

  const result = text.getRotation();

  expect(result).toBe(3.14159);
});

test('Test Text.getHorizontalAlignment', () => {
  // Test for default HorizontalAlignment when horizontalAlignment doesn't have a value
  const textDefault = new Text();
  delete textDefault.horizontalAlignment;

  const resultDefault = textDefault.getHorizontalAlignment();

  expect(resultDefault).toBe('left');

  // Test for default HorizontalAlignment for Text constructor
  const text = new Text();

  const result = text.getHorizontalAlignment();

  expect(result).toBe('left');

  // Test for center HorizontalAlignment
  const text2 = new Text();
  text2.horizontalAlignment = 1;

  const result2 = text2.getHorizontalAlignment();

  expect(result2).toBe('center');

  // Test for right HorizontalAlignment
  const text3 = new Text();
  text3.horizontalAlignment = 2;

  const result3 = text3.getHorizontalAlignment();

  expect(result3).toBe('right');

  // Test for aligned HorizontalAlignment
  const text4 = new Text();
  text4.horizontalAlignment = 3;

  const result4 = text4.getHorizontalAlignment();

  expect(result4).toBe('aligned');

  // Test for verticalAlignment Bottom HorizontalAlignment left
  const text5 = new Text();
  text5.horizontalAlignment = 3;
  text5.verticalAlignment = 1;

  const result5 = text5.getHorizontalAlignment();

  expect(result5).toBe('left');

  // Test for center HorizontalAlignment
  const text6 = new Text();
  text6.horizontalAlignment = 4;

  const result6 = text6.getHorizontalAlignment();

  expect(result6).toBe('center');

  // Test for verticalAlignment Bottom HorizontalAlignment left
  const text7 = new Text();
  text7.horizontalAlignment = 4;
  text7.verticalAlignment = 1;

  const result7 = text7.getHorizontalAlignment();

  expect(result7).toBe('left');

  // Test for fit HorizontalAlignment
  const text8 = new Text();
  text8.horizontalAlignment = 5;

  const result8 = text8.getHorizontalAlignment();

  expect(result8).toBe('fit');

  // Test for verticalAlignment Bottom HorizontalAlignment left
  const text9 = new Text();
  text9.horizontalAlignment = 5;
  text9.verticalAlignment = 1;

  const result9 = text9.getHorizontalAlignment();

  expect(result9).toBe('left');
});

test('Test Text.getVerticalAlignment', () => {
  // Test for default VerticalAlignment when VerticalAlignment doesn't have a value
  const textDefault = new Text();
  delete textDefault.verticalAlignment;

  const resultDefault = textDefault.getVerticalAlignment();

  expect(resultDefault).toBe('alphabetic');

  // Test for default VerticalAlignment
  const text = new Text();

  const result = text.getVerticalAlignment();

  expect(result).toBe('alphabetic');

  // Test for bottom VerticalAlignment
  const text1 = new Text();
  text1.verticalAlignment = 1;

  const result1 = text1.getVerticalAlignment();

  expect(result1).toBe('bottom');

  // Test for middle VerticalAlignment
  const text2 = new Text();
  text2.verticalAlignment = 2;

  const result2 = text2.getVerticalAlignment();

  expect(result2).toBe('middle');

  // Test for top VerticalAlignment
  const text3 = new Text();
  text3.verticalAlignment = 3;

  const result3 = text3.getVerticalAlignment();

  expect(result3).toBe('top');
});
