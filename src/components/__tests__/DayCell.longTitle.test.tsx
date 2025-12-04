import React from 'react';
import { render, screen } from '@testing-library/react';
import DayCell from '../CalendarView/DayCell';

const longTitle = `Leetcode\nWork through the 30 days of JavaScript course, make notes in oneOne, use GPT as a mentor to work through the problems together. This-is-a-very-long-word-to-test-breaking-behavior-should-not-cause-horizontal-scroll`;

test('long task title is rendered and has wrapping classes so it does not force horizontal scroll', () => {
  const date = new Date('2025-12-04T12:00:00');
  render(
    <DayCell
      date={date}
      tasks={[{ id: 'x1', title: longTitle, createdAt: new Date().toISOString() }]}
    />,
  );

  const el = screen.getByText(/Leetcode/i);
  expect(el).toBeInTheDocument();
  const li = el.closest('li');
  expect(li).toBeTruthy();
  // check classes that enable wrapping and prevent overflow
  expect(li).toHaveClass('whitespace-normal');
  expect(li).toHaveClass('break-words');
  expect(li).toHaveClass('max-w-full');
});
