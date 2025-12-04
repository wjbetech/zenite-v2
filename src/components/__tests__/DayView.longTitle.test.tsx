import React from 'react';
import { render, screen } from '@testing-library/react';
import DayView from '../CalendarView/DayView';

const longTitle = `Leetcode\nWork through the 30 days of JavaScript course, make notes in oneOne, use GPT as a mentor to work through the problems together. This-is-a-very-long-word-to-test-breaking-behavior-should-not-cause-horizontal-scroll`;

test('long task title in DayView wraps and does not force horizontal scroll', () => {
  const date = new Date('2025-12-04T12:00:00');
  render(
    <DayView
      date={date}
      tasks={[
        {
          id: 'd-long-1',
          title: longTitle,
          createdAt: new Date().toISOString(),
          dueDate: '2025-12-04',
        },
      ]}
    />,
  );

  const titleEl = screen.getByText(/Leetcode/i);
  expect(titleEl).toBeInTheDocument();
  // ensure the title element includes wrapping classes we added
  expect(titleEl).toHaveClass('whitespace-normal');
  expect(titleEl).toHaveClass('break-words');
});
